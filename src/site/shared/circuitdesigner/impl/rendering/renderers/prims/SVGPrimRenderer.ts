import {Style} from "shared/circuitdesigner/impl/rendering/Style";


// SVG Prim
export function render(ctx: CanvasRenderingContext2D): void {
    if (!this.svg) // Don't draw if the image isn't loaded
        return;

    ctx.save();

    const [a,b,c,d,e,f] = this.transform.getMatrix().mat;
    ctx.transform(a,b,c,d,e,f);

    this.svg.draw(ctx, 0, 0, this.size.x, -this.size.y, this.tint);

    ctx.restore();
}
export function updateStyle(style: Style): void {
    if (!style.fill) {
        this.tint = undefined;
        return;
    }

    if (typeof style.fill !== "string")
        throw new Error("Cannot have an SVG with a Gradient tint!");
    this.tint = parseColor(style.fill);
}

// BaseShape Prim
// protected abstract renderShape(ctx: CanvasRenderingContext2D): void;
// protected prePath(ctx: CanvasRenderingContext2D): void {}
export function render(ctx: CanvasRenderingContext2D): void {
    // Set style
    if (this.style.fill !== undefined)
        ctx.fillStyle = this.style.fill;
    if (this.style.stroke !== undefined) {
        ctx.strokeStyle = this.style.stroke.color;
        ctx.lineWidth = this.style.stroke.size;
        if (this.style.stroke.lineCap !== undefined)
            ctx.lineCap = this.style.stroke.lineCap;
    }
    if (this.style.alpha !== undefined)
        ctx.globalAlpha = this.style.alpha;

    ctx.save();

    this.prePath(ctx);

    ctx.beginPath();

    this.renderShape(ctx);

    if (this.style.fill)
        ctx.fill();
    if (this.style.stroke && this.style.stroke.size > 0)
        ctx.stroke();

    ctx.closePath();

    ctx.restore();

    // Reset alpha if we set it
    if (this.style.alpha !== undefined)
        ctx.globalAlpha = 1;
}
export function updateStyle(style: Style): void {
    this.style = style;
}

// BezierCurvePrim
export function renderShape(ctx: CanvasRenderingContext2D): void {
    const { p1, p2, c1, c2 } = this.curve;

    ctx.moveTo(p1.x, p1.y);
    ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p2.x, p2.y);
}


// CirclePrim
export function renderShape(ctx: CanvasRenderingContext2D): void {
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2*Math.PI);
}

// CircleSectorPrim
export function renderShape(ctx: CanvasRenderingContext2D): void {
    const { pos: { x, y }, radius, angles: [a0, a1] } = this;

    ctx.moveTo(x, y);
    let da = (a1 - a0) % (2*Math.PI);
    if (da < 0)
        da += 2*Math.PI;
    ctx.arc(x, y, radius, a0, a1, da > Math.PI);
}

// LinePrim
export function renderShape(ctx: CanvasRenderingContext2D): void {
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
}

// PolygonPrim
export function renderShape(ctx: CanvasRenderingContext2D): void {
    const { points } = this;

    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < this.points.length; i++)
        ctx.lineTo(points[i].x, points[i].y);
    ctx.lineTo(points[0].x, points[0].y);
}

// QuadCurvePrim
export function renderShape(ctx: CanvasRenderingContext2D): void {
    const { p1, p2, c } = this;

    ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(c.x, c.y, p2.x, p2.y);
}

// RectanglePrim
export function prePath(ctx: CanvasRenderingContext2D): void {
    // Transform
    const [a,b,c,d,e,f] = this.transform.getMatrix().mat;
    ctx.transform(a,b,c,d,e,f);
}
export function renderShape(ctx: CanvasRenderingContext2D): void {
    const size = this.transform.getSize();
    ctx.rect(-size.x/2, -size.y/2, size.x, size.y);
}