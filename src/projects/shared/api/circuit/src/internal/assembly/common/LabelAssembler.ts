import {V, Vector} from "Vector";

import {Rect} from "math/Rect";

import {Schema}                          from "shared/api/circuit/schema";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {ComponentAssembler}              from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {FontStyle}                       from "shared/api/circuit/internal/assembly/Style";


export class LabelAssembler extends ComponentAssembler {
    public constructor(params: AssemblerParams) {
        super(params, {}, [
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.PropChanged]),
                assemble:     (comp) => ({
                    kind:      "Rectangle",
                    transform: this.getTransform(comp),
                }),

                styleChangesWhenSelected: true,
                getStyle:                 (comp) => this.getRectangleStyle(comp),
            },
            {
                kind: "Text",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.PropChanged]),
                assemble:     (comp) => this.assembleText(comp),

                getFontStyle: (comp) => this.getFontStyle(comp),
            },
        ], {
            propMapping: {
                "name": AssemblyReason.TransformChanged,
            },
        });
    }

    protected override getSize(comp: Schema.Component): Vector {
        const bounds = this.getBounds(comp);
        return V(bounds.width + 0.4, bounds.height + 0.4);
    }

    private getBounds(comp: Schema.Component) {
        const name = this.getName(comp);
        return this.options.textMeasurer?.getBounds(this.getFontStyle(comp), name) ?? new Rect(V(), V());
    }

    private getName(comp: Schema.Component): string {
        return this.circuit.getCompByID(comp.id).unwrap().props.name ?? "LABEL";
    }

    private getRectangleStyle(comp: Schema.Component) {
        const isSelected = this.isSelected(comp.id);
        const fill = isSelected ? this.options.selectedFillColor : this.getBGColor(comp);
        return { ...this.options.fillStyle(isSelected), fill };
    }

    private getTextColor(comp: Schema.Component) {
        return this.circuit.getCompByID(comp.id).unwrap().props["textColor"] as string | undefined ?? this.options.defaultFontColor;
    }

    private getBGColor(comp: Schema.Component) {
        return this.circuit.getCompByID(comp.id).unwrap().props["bgColor"] as string | undefined ?? this.options.defaultFillColor;
    }

    private assembleText(comp: Schema.Component) {
        const text = this.getName(comp);
        const bounds = this.getBounds(comp);
        return {
            kind:     "Text",
            pos:      this.getPos(comp),
            contents: text,
            angle:    this.getAngle(comp),
            offset:   bounds.center,
        } as const
    }

    private getFontStyle(comp: Schema.Component): FontStyle {
        return {
            ...this.options.fontStyle(),
            color: this.getTextColor(comp),
        }
    }
}
