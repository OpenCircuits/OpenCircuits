import {V, Vector} from "Vector";
import {Rect} from "math/Rect";
import {Transform} from "math/Transform";

import {Schema} from "shared/api/circuit/schema";
import {FontStyle, Style} from "shared/api/circuit/internal/assembly/Style";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {DigitalComponentConfigurationInfo} from "../../DigitalComponents";


export class ConstantNumberAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    protected info: DigitalComponentConfigurationInfo;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, {
            "outputs": (parent, index) => this.getOutputLocations(parent, index),
        }, [
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.SelectionChanged]),
                assemble:     (comp) => this.assembleRectangle(comp),

                getStyle: (comp) => this.options.fillStyle(this.isSelected(comp.id)),
            },
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.SelectionChanged]),
                assemble:     (comp) => this.assembleLine(comp),

                getStyle: (comp) => this.getLineStyle(comp),
            },
            {
                kind: "Text",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.PropChanged]),
                assemble:     (comp) => this.assembleText(comp),

                getFontStyle: () => this.getFontStyle(),
            },
        ]);
        this.sim = sim;
        this.info = this.circuit.getComponentInfo("ConstantNumber").unwrap() as DigitalComponentConfigurationInfo;
    }

    protected override getSize(_: Schema.Component): Vector {
        return V(1, 1);
    }

    private getOutputLocations(comp: Schema.Component, index: number) {
        const targetY = 0.75 - (index * 1.5 / 3);
        return {
            origin: V((this.getSize(comp).x - this.options.defaultBorderWidth) / 2, targetY),
            target: V(1.2, targetY),
        } as const
    }

    private assembleRectangle(comp: Schema.Component) {
        // Border is subtracted from size so that size matches constant high/low
        const transform = new Transform(
            this.getPos(comp),
            this.getSize(comp).sub(V(this.options.defaultBorderWidth)),
            this.getAngle(comp),
        );
        return {
            kind: "Rectangle",
            transform,
        } as const
    }

    private assembleLine(comp: Schema.Component) {
        const dy = 1.5 * this.getSize(comp).y / 2;
        const x = (this.getSize(comp).x - this.options.defaultBorderWidth) / 2;

        const transform = this.getTransform(comp);
        return {
            kind: "Line",

            p1: transform.toWorldSpace(V(x, -dy)),
            p2: transform.toWorldSpace(V(x, dy)),
        } as const;
    }

    private getLineStyle(comp: Schema.Component): Style {
        const style = this.options.lineStyle(this.isSelected(comp.id));
        const { stroke } = style;
        return {
            ...style,
            stroke: stroke ? { ...stroke, lineCap: "square" } : undefined,
        }
    }

    private assembleText(comp: Schema.Component) {
        const value = (comp.props["inputNum"] as number) ?? 0;
        const text = value < 10 ? value.toString() : "ABCDEF".charAt(value - 10);
        const bounds = this.options.textMeasurer?.getBounds(this.getFontStyle(), text) ?? new Rect(V(), V());
        return {
            kind:     "Text",
            pos:      this.getPos(comp),
            angle:    this.getAngle(comp),
            offset:   bounds.center,
            contents: text,
        } as const;
    }

    private getFontStyle(): FontStyle {
        return {
            ...this.options.fontStyle(),
            font:  "lighter 800px arial",
            color: this.options.defaultOnColor,
            scale: 1000,
        }
    }
}
