import {serializable, serialize} from "serialeazy";

/**
 * A representation of a vector in 2D space. Commonly used to represent points,
 *  but also sizes, rays, and any other collection of 2-numbers.
 *
 * It should be noted that although the Vector itself is *not* immutable
 *  (since its `x` and `y` properties are settable), all methods on the Vector
 *  will return new Vectors with the performed operation.
 */
@serializable("Vector")
export class Vector {

    /**
     * The x-component of this Vector
     */
    @serialize
    public x: number;

    /**
     * The y-component of this Vector
     */
    @serialize
    public y: number;

    /**
     * Initializes a blank Vector with default x, y values of 0, 0
     */
    public constructor();

    /**
     * Creates a Vector with the x and y values of the `other` Vector
     * @param other The vector to copy
     */
    public constructor(other: Vector);

    /**
     * Initialize a Vector with the same x and y values as `val`
     * @param val The value to initialize the vector with
     */
    public constructor(val: number);

    /**
     * Initialize a Vector with x values `x` and y value `y`
     * @param x The x-component
     * @param y The y-component
     */
    public constructor(x: number, y: number);

    public constructor(x: Vector | number = 0, y?: number) {
        if (x instanceof Vector) {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = x;
            this.y = (y == null ? x : y);
        }
    }

    /**
     * Returns a new Vector with `this` Vector's x and y
     *  components added to `other`'s components.
     * @param other The vector to add to `this`
     */
    public add(other: Vector): Vector;

    /**
     * Returns a new Vector with `this` Vector's x and y
     *  components added by `val` to each component.
     * @param val The value to add to `this`
     */
    public add(val: number): Vector;

    /**
     * Return a new Vector with `this` Vector's x and y
     *  components added by `x` and `y` respectively.
     * @param x The x-component to add to `this`
     * @param y The y-component to add to `this`
     * @returns A vector with `this` added to `x` and `y`
     */
    public add(x: number, y: number): Vector;

    public add(x: Vector | number, y?: number): Vector {
        const dx = (x instanceof Vector ? x.x : x);
        const dy = (x instanceof Vector ? x.y : (y == null ? x : y));
        return new Vector(this.x + dx, this.y + dy);
    }

    public sub(v: Vector): Vector;
    public sub(x: number): Vector;
    public sub(x: number, y: number): Vector;
    public sub(x: Vector | number, y?: number): Vector {
        const dx = (x instanceof Vector ? x.x : x);
        const dy = (x instanceof Vector ? x.y : (y == null ? x : y));
        return new Vector(this.x - dx, this.y - dy);
    }

    public scale(v: Vector): Vector;
    public scale(x: number): Vector;
    public scale(a: Vector | number): Vector {
        if (a instanceof Vector)
            return new Vector(a.x * this.x, a.y * this.y);
        return new Vector(a * this.x, a * this.y);
    }

    public abs(): Vector {
        return new Vector(Math.abs(this.x), Math.abs(this.y));
    }
    public normalize(): Vector {
        const len = this.len();
        if (len === 0)
            return new Vector(0, 0);
        return this.scale(1 / len);
    }
    public len(): number {
        return Math.sqrt(this.len2());
    }
    public len2(): number {
        return this.dot(this);
    }
    public angle(): number {
        return Math.atan2(this.y, this.x);
    }
    public distanceTo(v: Vector): number {
        return this.sub(v).len();
    }
    public dot(v: Vector): number {
        return this.x * v.x + this.y * v.y;
    }
    public project(v: Vector): Vector {
        return this.scale(v.dot(this) / this.len2());
    }
    public negativeReciprocal(): Vector {
        return new Vector(this.y, -this.x);
    }
    public copy(): Vector {
        return new Vector(this.x, this.y);
    }

    public static min(...vectors: Vector[]): Vector {
        return new Vector(Math.min(...vectors.map((v) => v.x)),
                          Math.min(...vectors.map((v) => v.y)));
    }
    public static max(...vectors: Vector[]): Vector {
        return new Vector(Math.max(...vectors.map((v) => v.x)),
                          Math.max(...vectors.map((v) => v.y)));
    }
    public static clamp(x: Vector, lo: Vector, hi: Vector): Vector {
        return Vector.min(Vector.max(x, lo), hi);
    }
}

export function V(): Vector;
export function V(v: Vector): Vector;
export function V(x: number): Vector;
export function V(x: number, y: number): Vector;
export function V(x: Vector | number = 0, y?: number): Vector {
    if (x instanceof Vector)
        return new Vector(x);
    return new Vector(x, y);
}
