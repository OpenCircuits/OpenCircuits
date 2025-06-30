import {Curve}  from "./Curve";
import {Rect}   from "./Rect";
import {Vector} from "./Vector";


/**
 * Line Curve class.
 *
 * Represents a parametric straight line, consisting of a start and end point.
 *
 * Note that curves are immutable.
 */
export class LineCurve extends Curve {

    /**
     * The x, y coordinates of the start point.
     */
    public readonly p1: Vector;

    /**
     * The x, y coordinates of the end point.
     */
    public readonly p2: Vector;

    /**
     * The Bounding Box that encases the entire curve.
     * Note this will be undefined until `.bounds` is called at which
     *  point the box will be computed and won't be re-computed again.
     */
    private boundingBox?: Rect;

    /**
     * Initializes line curve with the given start point, end point.
     *
     * @param p1 Initializes start point with given coordinates.
     * @param p2 Initializes end point with given coordinates.
     */
    public constructor(p1: Vector, p2: Vector) {
        super();

        this.p1 = p1;
        this.p2 = p2;
    }

    private calcBoundingBox(): Rect {
        return Rect.FromPoints(this.p1, this.p2);
    }

    public override get bounds(): Rect {
        if (!this.boundingBox) // Calculate when requested
            this.boundingBox = this.calcBoundingBox();
        return this.boundingBox;
    }

    public override getX(t: number): number {
        return this.p1.x*(1 - t) + this.p2.x*t;
    }
    public override getY(t: number): number {
        return this.p1.y*(1 - t) + this.p2.y*t;
    }

    public override getDX(_: number): number {
        return this.p2.x - this.p1.x;
    }
    public override getDY(_: number): number {
        return this.p2.y - this.p1.y;
    }

    public override getDDX(_: number): number {
        return 0;
    }
    public override getDDY(_: number): number {
        return 0;
    }
}
