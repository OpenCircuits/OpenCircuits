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
     * The x-component of this Vector.
     */
    @serialize
    public x: number;

    /**
     * The y-component of this Vector.
     */
    @serialize
    public y: number;

    /**
     * Initializes a blank Vector with default (x, y) values of (0, 0).
     */
    public constructor();

    /**
     * Creates a Vector with the x and y values of the `other` Vector.
     *
     * @param other The vector to copy.
     */
    public constructor(other: Vector);

    /**
     * Initialize a Vector with the same x and y values as `val`.
     *
     * @param val The value to initialize the vector with.
     */
    public constructor(val: number);

    /**
     * Initialize a Vector with x values `x` and y value `y`.
     *
     * @param x The x-component.
     * @param y The y-component.
     */
    public constructor(x: number, y: number);

    public constructor(x: Vector | number = 0, y?: number) {
        if (x instanceof Vector) {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = x;
            this.y = (y === undefined ? x : y);
        }
    }

    /**
     * Returns a new Vector with `this` Vector's x and y
     *  components added to `other`'s components.
     *
     * @param other The vector to add to `this`.
     */
    public add(other: Vector): Vector;

    /**
     * Returns a new Vector with `this` Vector's x and y
     *  components added by `val` to each component.
     *
     * @param val The value to add to `this`.
     */
    public add(val: number): Vector;

    /**
     * Return a new Vector with `this` Vector's x and y
     *  components added by `x` and `y` respectively.
     *
     * @param x The x-component to add to `this`.
     * @param y The y-component to add to `this`.
     * @returns   A vector with `this` added to `x` and `y`.
     */
    public add(x: number, y: number): Vector;

    public add(x: Vector | number, y?: number): Vector {
        const dx = (x instanceof Vector ? x.x : x);
        const dy = (x instanceof Vector ? x.y : (y === undefined ? x : y));
        return new Vector(this.x + dx, this.y + dy);
    }
    /**
     * Return a new Vector with 'this' Vector's x and y
     *  components substracted by 'v''s components.
     *
     * @param v The vector to substract ot 'this'.
     */
    public sub(v: Vector): Vector;
    /**
     * Return a new vector with 'this' Vector's x and y
     *  components substracted by 'x' to each component.
     *
     * @param x The x-component to substract to 'this'.
     */
    public sub(x: number): Vector;

    /**
     * Return a new vector with 'this' Vector's x and y
     *  components substracted by 'x' and 'y'respectively.
     *
     * @param x The x-component to substract to 'this'.
     * @param y The y-component to substract to 'this'.
     * @returns   A new vector with 'this' substracted to 'x' and 'y'.
     */
    public sub(x: number, y: number): Vector;

    public sub(x: Vector | number, y?: number): Vector {
        const dx = (x instanceof Vector ? x.x : x);
        const dy = (x instanceof Vector ? x.y : (y === undefined ? x : y));
        return new Vector(this.x - dx, this.y - dy);
    }
    /**
     * Return a new vector with 'this' vector's 'x' and 'y'
     * scalar multiplied by vector 'v''s 'x' and 'y' respectively.
     *
     * @param v The vector to scalar multiply to 'this'.
     */
    public scale(v: Vector): Vector;

    /**
     * Return a new vector with 'this' vector's 'x' and 'y'
     * scalar multiplied by number 'x'.
     *
     * @param x The number to scalar multiply to 'this'.
     * @returns   A new vector with 'this' scalar multiplied by 'a'.
     */
    public scale(x: number): Vector;

    public scale(a: Vector | number): Vector {
        if (a instanceof Vector)
            return new Vector(a.x * this.x, a.y * this.y);
        return new Vector(a * this.x, a * this.y);
    }
    /**
     * Return a Vector with 'this' Vector's absolute value of 'x' and 'y'.
     *
     * @returns Return a new vector that hold the absolute value
     *  of original vector.
     */
    public abs(): Vector {
        return new Vector(Math.abs(this.x), Math.abs(this.y));
    }
    /**
     * Return a vector that is normalized 'this' Vector.
     *
     * @returns Return a new vector that is normalized 'this'.
     */
    public normalize(): Vector {
        const len = this.len();
        if (len === 0)
            return new Vector(0, 0);
        return this.scale(1 / len);
    }
    /**
     * Return the length of the vector.
     *
     * @returns Return the length of the vector.
     */
    public len(): number {
        return Math.sqrt(this.len2());
    }
    /**
     * Return the dot product of 'this' to itself,
     * which is the squared length of 'this'.
     *
     * @returns The dot product of 'this' . 'this'.
     */
    public len2(): number {
        return this.dot(this);
    }
    /**
     * Return the angle of 'this' that respects to the x-axis.
     *
     * @returns The arctan value of 'this''s 'x' and 'y'.
     */
    public angle(): number {
        return Math.atan2(this.y, this.x);
    }
    /**
     * Return the distance from 'this' to 'v'.
     *
     * @param v The vector we need to mearsure the distance to.
     * @returns   The length of the vector of 'this' sub 'v'.
     */
    public distanceTo(v: Vector): number {
        return this.sub(v).len();
    }
    /**
     * Return the dot product of 'this' and 'v'.
     *
     * @param v The vector to dot multiply to 'this'.
     * @returns   'this' dot multiplied by 'v'.
     */
    public dot(v: Vector): number {
        return this.x * v.x + this.y * v.y;
    }
    /**
     * Returns a new vector rotated `a` radians from this one.
     *
     * @param a The angle in radians.
     * @returns   A new, rotated vector.
     */
    public rotate(a: number): Vector {
        const cos = Math.cos(a), sin = Math.sin(a);
        return V(
            (this.x * cos - this.y * sin),
            (this.x * sin + this.y * cos)
        );
    }
    /**
     * Return the projection of 'this' on 'v'.
     *
     * @param v The vector that 'this' projects to.
     * @returns   The projection of 'this' on vector 'v'.
     */
    public project(v: Vector): Vector {
        return v.scale(this.dot(v) / v.len2())
    }
    /**
     * Return a negative reciprocal vector of 'this'.
     *
     * @returns A new vector with negative reciprocal 'this'.
     */
    public negativeReciprocal(): Vector {
        return new Vector(this.y, -this.x);
    }
    /**
     * Return a new vector that copies 'this''s data.
     *
     * @returns A Vector with 'this''s 'x' and 'y'.
     */
    public copy(): Vector {
        return new Vector(this.x, this.y);
    }

    public toString(): string {
        return `(${Math.round(this.x)}, ${Math.round(this.y)})`;
    }
    /**
     * Return a vector that has mininum 'x' and 'y' components from
     * vectors within the array 'vectors'.
     *
     * @param vectors The array that holds vectors.
     * @returns         A Vector with the smallest 'x' and 'y' that
     *          from vector(s) in the array.
     */
    public static Min(...vectors: Vector[]): Vector {
        return new Vector(Math.min(...vectors.map((v) => v.x)),
                          Math.min(...vectors.map((v) => v.y)));
    }
    /**
     * Return a vector that has maxium 'x' and 'y' components from
     * vectors within the array 'vectors'.
     *
     * @param vectors The array that holds vectors.
     * @returns         A Vector with the biggest 'x' and 'y' that
     *          from vector(s) in the array.
     */
    public static Max(...vectors: Vector[]): Vector {
        return new Vector(Math.max(...vectors.map((v) => v.x)),
                          Math.max(...vectors.map((v) => v.y)));
    }
    /**
     * Keep the vector 'x' within the range that formed by 'lo' and 'hi'.
     *
     * @param x  The vector that need to be examined.
     * @param lo The minimum vector of the range.
     * @param hi The maximum vector of the range.
     * @returns    Return 'x' itself if it is in the range of 'lo' and 'hi'.
     *     If one of the component of 'x' out of the range, it will
     *     be respectively change to corresponding compoenent of 'lo' or 'hi' and return.
     *     If both component of 'x' out of the range,
     *     it will return 'lo' or 'hi' depend on the valueof 'x'.
     */
    public static Clamp(x: Vector, lo: Vector, hi: Vector): Vector {
        return Vector.Min(Vector.Max(x, lo), hi);
    }
}

/**
 * The useful utils that make the claim of the vector much easier.
 */
export function V(): Vector;
export function V(v: Vector): Vector;
export function V(x: number): Vector;
export function V(x: number, y: number): Vector;
export function V(x: Vector | number = 0, y?: number): Vector {
    if (x instanceof Vector)
        return new Vector(x);
    return new Vector(x, y!);
}
