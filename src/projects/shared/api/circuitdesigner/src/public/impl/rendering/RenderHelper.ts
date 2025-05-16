import {SVGDrawing, parseColor} from "svg2canvas";

import {V, Vector} from "Vector";

import {Matrix2x3} from "math/Matrix";

import {Style} from "shared/api/circuit/internal/assembly/Style";


export class RenderHelper {
    public canvas: HTMLCanvasElement;
    protected context: CanvasRenderingContext2D;

    public constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d")!;
    }

    public get ctx(): CanvasRenderingContext2D {
        if (!this.context)
            throw new Error(`RenderHelper: Uninitialized context! ${this.canvas} | ${this.context}`);
        return this.context;
    }

    public clear(): void {
        this.ctx.clearRect(0, 0, this.size.x, this.size.y);
    }

    public transform(m: Matrix2x3) {
        this.ctx.transform(
            m.get(0), m.get(1),
            m.get(2), m.get(3),
            m.get(4), m.get(5),
        );
    }

    // public image(img: SVGDrawing, pos: Vector, size: Vector, tint?: string): void {
    //     const col = (tint ? parseColor(tint) : undefined);

    //     // Flip y-axis scale
    //     img.draw(this.ctx, pos.x, pos.y, size.x, -size.y, col);
    // }

    public createRadialGradient(pos1: Vector, r1: number, pos2: Vector, r2: number): CanvasGradient {
        return this.ctx.createRadialGradient(pos1.x, pos1.y, r1, pos2.x, pos2.y, r2);
    }

    public beginPath() {
        this.ctx.beginPath();
    }
    public closePath() {
        this.ctx.closePath();
    }
    public moveTo(p: Vector) {
        this.ctx.moveTo(p.x, p.y);
    }
    public lineTo(p: Vector) {
        this.ctx.lineTo(p.x, p.y);
    }
    public pathLine(p1: Vector, p2: Vector): void {
        this.moveTo(p1);
        this.lineTo(p2);
    }
    public stroke() {
        this.ctx.stroke();
    }

    public setStyle(style: Style, alpha = 1) {
        this.ctx.globalAlpha = alpha;

        if (style.fill !== undefined) {
            if (typeof style.fill === "string") {
                this.ctx.fillStyle = style.fill;
            } else {
                // Gradient info
                // TODO - evaluate performance of this and if it's too much, find a way to cache the gradient
                const { pos1, radius1, pos2, radius2, colorStops } = style.fill;
                const gradient = this.ctx.createRadialGradient(pos1.x, pos1.y, radius1, pos2.x, pos2.y, radius2);
                colorStops.forEach(([offset, color]) =>
                    gradient.addColorStop(offset, color));
                this.ctx.fillStyle = gradient;
            }
        }
        if (style.stroke !== undefined) {
            this.ctx.strokeStyle = style.stroke.color;
            this.ctx.lineWidth = style.stroke.size;
        }
    }

    public save(): void {
        this.ctx.save();
    }
    public restore(): void {
        this.ctx.restore();
    }

    public get size(): Vector {
        return V(this.canvas.width, this.canvas.height);
    }
}
