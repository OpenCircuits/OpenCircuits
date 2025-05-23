import {V, Vector} from "Vector";
import {Rect} from "math/Rect";
import {Transform} from "math/Transform";

import {Schema} from "shared/api/circuit/schema";
import {FontStyle, Style} from "shared/api/circuit/internal/assembly/Style";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {PositioningHelpers} from "shared/api/circuit/internal/assembly/PortAssembler";


export class ConstantNumberAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, {
            "outputs": (comp, index, total) => ({
                origin: V(0.5, PositioningHelpers.ConstantSpacing(index, total, this.getSize(comp).y, { spacing: 0.5 })),
                dir:    V(1, 0),
            }),
        }, [
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.SelectionChanged]),
                assemble:     (comp) => ({
                    kind:      "Rectangle",
                    transform: this.getTransform(comp),
                }),

                getStyle: (comp) => this.options.fillStyle(this.isSelected(comp.id)),
            },
            {
                kind: "Text",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.PropChanged]),
                assemble:     (comp) => this.assembleText(comp),

                getFontStyle: () => this.getFontStyle(),
            },
        ], { drawPortLineForGroups: ["outputs"] });
        this.sim = sim;
    }

    protected override getSize(_: Schema.Component): Vector {
        return V(1, 1);
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
