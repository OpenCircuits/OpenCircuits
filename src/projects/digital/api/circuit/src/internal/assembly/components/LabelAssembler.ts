import {V, Vector} from "Vector";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalComponentConfigurationInfo} from "../../DigitalComponents";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {Schema} from "shared/api/circuit/schema";
import {FontStyle} from "shared/api/circuit/internal/assembly/Style";
import {Transform} from "math/Transform";


export class LabelAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;
    protected info: DigitalComponentConfigurationInfo;

    private readonly ctx: CanvasRenderingContext2D;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, {}, [
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.PropChanged]),
                assemble:     (comp) => ({
                    kind:      "Rectangle",
                    // this.getTransform uses cache which doesn't get updated when name changes
                    transform: new Transform(
                        this.getPos(comp),
                        this.getSize(comp),
                        this.getAngle(comp),
                    ),
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
        ]);
        this.sim = sim;
        this.info = this.circuit.getComponentInfo("Label").unwrap() as DigitalComponentConfigurationInfo;
        this.ctx = document.createElement("canvas").getContext("2d")!;
        this.ctx.textBaseline = "middle";
        this.ctx.font = this.options.defaultFont;
    }

    protected override getSize(comp: Schema.Component): Vector {
        const name = this.getName(comp);
        const textWidth = this.ctx.measureText(name).width;
        return V(textWidth + 0.4, 0.6);
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
        // to adjust for cap-height of the Arial font (see https://stackoverflow.com/questions/61747006)
        // const FONT_CAP_OFFSET = 0.06;
        const text = this.getName(comp);
        return {
            kind:     "Text",
            pos:      this.getPos(comp),
            contents: text,
            angle:    -this.getAngle(comp),
        } as const
    }

    private getFontStyle(comp: Schema.Component): FontStyle {
        const fontStyle = this.options.fontStyle();
        return {
            ...fontStyle,
            font:  this.options.defaultFont,
            color: this.getTextColor(comp),
        }
    }
}
