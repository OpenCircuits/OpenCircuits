import {Vector}         from "Vector";

import {ComponentAssembler, ComponentBaseShapePrimAssembly, ComponentExtraAssemblerParams} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {PortFactory} from "shared/api/circuit/internal/assembly/PortAssembler";

import {DigitalSim}           from "digital/api/circuit/internal/sim/DigitalSim";
import {Schema} from "shared/api/circuit/schema";


export type SimplifiedAssembly = {
    assemble: ComponentBaseShapePrimAssembly["assemble"];
    getStyle: ComponentBaseShapePrimAssembly["getStyle"];
}
export interface GateAssemblerParams extends ComponentExtraAssemblerParams {
    size: Vector;
    svg: string;
    not: boolean;
    portFactory: PortFactory;
    otherPrims?: SimplifiedAssembly[];
}
export class GateAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    protected readonly size: Vector;

    public constructor(
        params: AssemblerParams,
        sim: DigitalSim,
        { size, svg, not, portFactory, otherPrims, ...otherParams }: GateAssemblerParams
    ) {
        super(params, portFactory, [
            // NOT symbol
            ...((not ? [{
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged]),
                assemble: (gate) => ({
                    kind: "Circle",

                    pos:    this.getPos(gate).add(this.size.x / 2 + this.options.notPortCircleRadius, 0),
                    radius: this.options.notPortCircleRadius,
                }),

                styleChangesWhenSelected: true,
                getStyle: (gate) => ({
                    fill: (this.isSelected(gate.id)
                        ? this.options.selectedFillColor
                        : this.options.defaultFillColor),
                    stroke: {
                        color: (this.isSelected(gate.id)
                            ? this.options.selectedBorderColor
                            : this.options.defaultBorderColor),
                        size: this.options.defaultBorderWidth,
                    },
                }),
            } satisfies ComponentBaseShapePrimAssembly] : [])),

            // Other prims
            ...(otherPrims?.map((o) => ({
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.PortsChanged]),
                assemble: (gate) => o.assemble(gate),

                styleChangesWhenSelected: true,
                getStyle: (gate) => o.getStyle(gate),
            } satisfies ComponentBaseShapePrimAssembly)) ?? []),

            { // SVG
                kind: "SVG",

                dependencies: new Set([AssemblyReason.TransformChanged]),
                assemble: (gate) => ({
                    kind: "SVG",

                    svg:       svg,
                    transform: this.getTransform(gate),
                }),

                tintChangesWhenSelected: true,
                getTint: (comp) =>
                    (this.isSelected(comp.id) ? this.options.selectedFillColor : undefined),
            },
        ], otherParams);

        this.sim = sim;
        this.size = size;
    }

    protected override getSize(_: Schema.Component): Vector {
        return this.size;
    }
}
