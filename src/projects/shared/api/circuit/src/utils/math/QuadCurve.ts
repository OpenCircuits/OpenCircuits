import {Curve}     from "./Curve";
import {Clamp}     from "./MathUtils";
import {Rect}      from "./Rect";
import {V, Vector} from "./Vector";


/**
 * Quadratic Bezier Curve class.
 *
 * Consists of a start point, an end point,
 * 1 control point, and the bounding
 * box for the curve.
 *
 * Note that quad curves are immutable.
 *
 * Link to an interactive quadratic bezier curve with formulas:
 * https://www.desmos.com/calculator/mr7deqgp7e.
 */
export class QuadCurve extends Curve {

    /**
     * The x, y coordinates of the start point.
     */
    public readonly p1: Vector;

    /**
     * The x, y coordinates of the end point.
     */
    public readonly p2: Vector;

    /**
     * The x, y coordinates of the control point.
     */
    public readonly c: Vector;

    /**
     * The Bounding Box that encases the entire curve.
     * Note this will be undefined until `.bounds` is called at which
     *  point the box will be computed and won't be re-computed again.
     */
    private boundingBox?: Rect;

    /**
     * Initializes quadratic curve with the given start point, end point, and intermediate point.
     * Bounding Box holds meaningless values by default.
     *
     * @param p1 Initializes start point with given coordinates.
     * @param p2 Initializes end point with given coordinates.
     * @param c  Initializes first control point with given coordinates.
     */
    public constructor(p1: Vector, p2: Vector, c: Vector) {
        super();

        this.p1 = p1;
        this.p2 = p2;
        this.c = c;
    }

    private calcBoundingBox(): Rect {
        const end1 = this.getPos(0);
        const end2 = this.getPos(1);

        const a = this.p1.sub(this.c);
        const b = this.p1.sub(this.c.scale(2)).add(this.p2);

        const tx = Clamp(a.x / b.x, 0, 1);
        const ty = Clamp(a.y / b.y, 0, 1);

        const maxX = Math.max(this.getX(tx), end1.x, end2.x);
        const minX = Math.min(this.getX(tx), end1.x, end2.x);

        const maxY = Math.max(this.getY(ty), end1.y, end2.y);
        const minY = Math.min(this.getY(ty), end1.y, end2.y);

        return Rect.FromPoints(V(minX, minY), V(maxX, maxY));
    }

    public override get bounds(): Rect {
        if (!this.boundingBox) // Calculate when requested
            this.boundingBox = this.calcBoundingBox();
        return this.boundingBox;
    }

    public override getX(t: number): number {
        const it = 1 - t;
        return this.p1.x*it*it + 2*this.c.x*t*it + this.p2.x*t*t;
    }
    public override getY(t: number): number {
        const it = 1 - t;
        return this.p1.y*it*it + 2*this.c.y*t*it + this.p2.y*t*t;
    }

    public override getDX(t: number): number {
        const it = 1 - t;
        return -2*this.p1.x*it + 2*this.c.x*(1-2*t) + 2*this.p2.x*t;
    }
    public override getDY(t: number): number {
        const it = 1 - t;
        return -2*this.p1.y*it + 2*this.c.y*(1-2*t) + 2*this.p2.y*t;
    }

    public override getDDX(_: number): number {
        return 2*(this.p1.x - 2*this.c.x + this.p2.x);
    }
    public override getDDY(_: number): number {
        return 2*(this.p1.y - 2*this.c.y + this.p2.y);
    }
}
