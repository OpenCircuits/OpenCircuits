import {Rect} from "math/Rect";
import {TextMeasurer} from "shared/api/circuit/internal/assembly/RenderOptions";
import {FontStyle} from "shared/api/circuit/internal/assembly/Style";


export class CanvasTextMeasurer implements TextMeasurer {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;

    public constructor() {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d")!;
    }

    public getBounds(fontStyle: FontStyle, text: string): Rect {
        this.ctx.font = fontStyle.font;
        this.ctx.textBaseline = fontStyle.textBaseline;
        this.ctx.textAlign = fontStyle.textAlign;
        const result = this.ctx.measureText(text);
        return Rect.From({
            left:   -result.width / 2 / fontStyle.scale,
            right:  result.width / 2 / fontStyle.scale,
            bottom: -result.fontBoundingBoxDescent / fontStyle.scale,
            top:    result.fontBoundingBoxAscent / fontStyle.scale,
        });
    }
}
