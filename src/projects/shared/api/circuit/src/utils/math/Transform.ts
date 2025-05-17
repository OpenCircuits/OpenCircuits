import {TransformContains, TransformContainsRect} from "./MathUtils";
import {Matrix2x3} from "./Matrix";
import {Rect}      from "./Rect";
import {V, Vector} from "./Vector";


/**
 * Class representing a 2D Transform.
 *
 * A Transform holds all the spacial information about an object: position, rotation, and scale.
 * A Transform can be thought of as a rectangle at the given pos, angle, and with size = scale.
 *
 * In local space of a Transform, the unit square represents the bounds of the rectangle for the Transform.
 *
 * For performance reasons the transform also stores a list of corners to be able to quickly apply intersection testing.
 *
 * It should be noted that the Transform is immutable and its values can only be set on construction.
 */
export class Transform {
    private static readonly LOCAL_CORNERS = [V(-0.5, 0.5), V(0.5, 0.5), V(0.5, -0.5), V(-0.5, -0.5)];

    public readonly pos: Vector;
    public readonly angle: number;
    public readonly scale: Vector;

    public readonly matrix: Matrix2x3;

    private corners?: Vector[];
    private radius?: number;

    /**
     * Constructs a new Transform object.
     *
     * @param pos   The position of the transform.
     * @param angle The angle of the transform.
     * @param scale The scale of the transform.
     */
    public constructor(pos: Vector, angle: number, scale: Vector) {
        this.pos = pos;
        this.scale = scale;
        this.angle = angle;

        this.matrix = new Matrix2x3(this.pos, this.angle, this.scale);
    }

    /**
     * Calculates the new position and angle
     *  after transforming this by 'a' radians about the axis 'c'.
     *
     * @param a The angle to rotate.
     * @param c The axis to rotate about.
     * @returns The new position and angle to set to perform this rotation.
     */
    public calcRotationAbout(a: number, c: Vector) {
        return [
            this.pos.sub(c).rotate(a).add(c), // new position
            this.angle + a,              // new rotation
        ] as const;
    }

    /**
     * Converts the given Vector, v, to local space relative
     *  to this transform.
     *
     * @param v The vector to transform, must be in world coordinates.
     * @returns The local space vector.
     */
    public toLocalSpace(v: Vector): Vector { // v must be in world coords
        return this.matrix.inverse().mul(v);
    }

    /**
     * Converts the given Vector, v, to world space relative
     *  to this transform.
     *
     * @param v The vector to transform, must be in local coordinates.
     * @returns The world space vector.
     */
    public toWorldSpace(v: Vector): Vector {
        return this.matrix.mul(v);
    }

    public getRadius(): number {
        if (!this.radius)
            this.radius = Math.sqrt(this.scale.x*this.scale.x + this.scale.y*this.scale.y) / 2;
        return this.radius;
    }

    public getCorners(): readonly Vector[] {
        if (!this.corners)
            this.corners = Transform.LOCAL_CORNERS.map((v) => this.toWorldSpace(v));
        return this.corners;
    }
    public getLocalCorners(): readonly Vector[] {
        return Transform.LOCAL_CORNERS;
    }

    public asRect(): Rect {
        return Rect.FromPoints(
            Vector.Min(...this.getCorners()),
            Vector.Max(...this.getCorners()),
        );
    }

    public intersects(other: Rect | Transform): boolean {
        if (other instanceof Rect)
            return TransformContainsRect(this, other);
        return TransformContains(this, other);
    }

    public withScale(newScale: Vector): Transform{
        return new Transform(this.pos, this.angle, newScale);
    }
    public withoutScale(): Transform {
        return this.withScale(V(1, 1));
    }

    public static FromCorners(p1: Vector, p2: Vector): Transform {
        return new Transform(p1.add(p2).scale(0.5), 0, p2.sub(p1).abs());
    }
    public static FromRect(rect: Rect): Transform {
        return Transform.FromCorners(rect.bottomLeft, rect.topRight);
    }
}
