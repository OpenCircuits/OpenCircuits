import {V, Vector} from "Vector";

import {Transform} from "math/Transform";

import {Schema} from "shared/api/circuit/schema";

import {Assembler, AssemblerParams,
        AssemblyReason} from "./Assembler";
import {PortAssembler, PortFactory} from "./PortAssembler";
import {BaseShapePrimWithoutStyle, GroupPrim, Prim, SVGPrim, TextPrim} from "./Prim";
import {FontStyle, Style} from "./Style";
import {parseColor} from "svg2canvas";

import "shared/api/circuit/utils/Array";


export interface ComponentBaseShapePrimAssembly {
    kind: "BaseShape";

    dependencies: Set<AssemblyReason>;
    assemble: (comp: Schema.Component) => BaseShapePrimWithoutStyle | Omit<GroupPrim, "style">;

    styleChangesWhenSelected?: boolean;
    getStyle: (comp: Schema.Component) => Style;
}
export interface ComponentSVGPrimAssembly {
    kind: "SVG";

    dependencies: Set<AssemblyReason>;
    assemble: (comp: Schema.Component) => Omit<SVGPrim, "tint">;

    tintChangesWhenSelected?: boolean;
    getTint:  (comp: Schema.Component) => string | undefined;
}
export interface ComponentTextPrimAssembly {
    kind: "Text";

    dependencies: Set<AssemblyReason>;
    assemble: (comp: Schema.Component) => Omit<TextPrim, "fontStyle">;

    styleChangesWhenSelected?: boolean;
    getFontStyle: (comp: Schema.Component) => FontStyle;
}
export type ComponentPrimAssembly = ComponentBaseShapePrimAssembly
    | ComponentSVGPrimAssembly
    | ComponentTextPrimAssembly;

export abstract class ComponentAssembler extends Assembler<Schema.Component> {
    protected portAssembler: PortAssembler;
    protected primAssembly: ComponentPrimAssembly[];

    public constructor(
        params: AssemblerParams,
        factory: PortFactory,
        primAssembly: ComponentPrimAssembly[],
    ) {
        super(params);

        this.portAssembler = new PortAssembler(params, factory);
        this.primAssembly = primAssembly;
    }

    // Some components change size from miscellaneous props (i.e. Multiplexer or Oscilloscope).
    protected abstract getSize(comp: Schema.Component): Vector;

    protected getPos(comp: Schema.Component): Vector {
        return V(comp.props.x ?? 0, comp.props.y ?? 0);
    }

    protected getAngle(comp: Schema.Component): number {
        return comp.props.angle ?? 0;
    }

    protected getTransform(comp: Schema.Component) {
        return this.cache.componentTransforms.get(comp.id)!;
    }

    private getPrim(assembly: ComponentPrimAssembly, comp: Schema.Component): Prim {
        if (assembly.kind === "BaseShape") {
            return {
                ...assembly.assemble(comp),
                style: assembly.getStyle(comp),
            } as const;
        } else if (assembly.kind === "SVG") {
            const tint = assembly.getTint(comp);
            return {
                ...assembly.assemble(comp),
                tint: (tint ? parseColor(tint) : undefined),
            } as const;
        } else if (assembly.kind === "Text") {
            return {
                ...assembly.assemble(comp),
                fontStyle: assembly.getFontStyle(comp),
            } as const;
        }
        throw new Error(`Invalid prim assembly kind: ${assembly}`!);
    }

    public override assemble(comp: Schema.Component, reasons: Set<AssemblyReason>) {
        const added            = reasons.has(AssemblyReason.Added);
        const transformChanged = reasons.has(AssemblyReason.TransformChanged);
        const selectionChanged = reasons.has(AssemblyReason.SelectionChanged);

        if (added || transformChanged) {
            this.cache.componentTransforms.set(comp.id, new Transform(
                this.getPos(comp),
                this.getSize(comp),
                this.getAngle(comp),
            ));
        }
        this.portAssembler.assemble(comp, reasons);

        // NOTE: THIS SYSTEM ASSUMES THAT THE PRIM ASSEMBLY ORDER IS FIXED
        // USE GROUP PRIMS IF YOU NEED AN 'N' AMOUNT OF PRIMS.

        // If added, completely assemble.
        if (added) {
            const prims: Prim[] = this.primAssembly.map((assembly) => this.getPrim(assembly, comp));

            this.cache.componentPrims.set(comp.id, prims);

            return;
        }

        // Otherwise, check if any dependencies are met, and update only those prims (re-using existing ones)
        const prevPrims = this.cache.componentPrims.get(comp.id)!;

        const prims = prevPrims.map((prim, i) => {
            const assembly = this.primAssembly[i];
            // If no dependencies are met, return the previous prim
            if (assembly.dependencies.intersection(reasons).size === 0) {
                // Check if selection changed causes style to need updating though
                if (!selectionChanged)
                    return prim;

                if (assembly.kind === "BaseShape" && assembly.styleChangesWhenSelected) {
                    return {
                        ...prim,
                        style: assembly.getStyle(comp),
                    }
                } else if (assembly.kind === "SVG" && assembly.tintChangesWhenSelected) {
                    const tint = assembly.getTint(comp);
                    return {
                        ...prim,
                        tint: (tint ? parseColor(tint) : undefined),
                    }
                }

                return prim;
            }
            return this.getPrim(assembly, comp);
        });

        this.cache.componentPrims.set(comp.id, prims);
    }
}
