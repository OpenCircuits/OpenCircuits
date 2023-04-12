/* eslint-disable @typescript-eslint/no-namespace */


/**
 * A representation of a vector in 2D space. Commonly used to represent points,
 *  but also sizes, rays, and any other collection of 2-numbers.
 *
 * It should be noted that the Vector is immutable and its values can only be set
 *  on initialization.
 */
export interface Vector {
    /**
     * The Vector "space" that represents the coordinate-space for this vector.
     * By default it is set to "world" space, but can also be set as "screen" space.
     * The interpretation of these spaces is entirely up to the user.
     */
    readonly space: Vector.Spaces;

    /**
     * The x-component of this Vector in the given space.
     */
    readonly x: number;

    /**
     * The y-component of this Vector in the given space.
     */
    readonly y: number;


    /**
     * Returns a new Vector with `this` Vector's x and y
     *  components added by `val` to each component.
     *
     * @param amt The value to add to `this`.
     * @returns   A vector with `this` added to by `amt`.
     */
    add(amt: number): Vector;

    /**
     * Return a new Vector with `this` Vector's x and y
     *  components added by `x` and `y` respectively.
     *
     * @param x The x-component to add to `this`.
     * @param y The y-component to add to `this`.
     * @returns A vector with `this` added to `x` and `y`.
     */
    add(x: number, y: number): Vector;

    /**
     * Returns a new Vector with `this` Vector's x and y
     *  components added to `other`'s components.
     *
     * @param other The vector to add to `this`.
     * @returns     A vector with `this` added to `other.x` and `other.y`.
     */
    add(other: Vector): Vector;


    /**
     * Return a new vector with 'this' Vector's x and y
     *  components substracted by 'amt' to each component.
     *
     * @param amt The x-component to substract to 'this'.
     * @returns   A new vector with 'this' substracted to 'amt'.
     */
    sub(amt: number): Vector;

    /**
     * Return a new vector with 'this' Vector's x and y
     *  components substracted by 'x' and 'y'respectively.
     *
     * @param x The x-component to substract to 'this'.
     * @param y The y-component to substract to 'this'.
     * @returns A new vector with 'this' substracted to 'x' and 'y'.
     */
    sub(x: number, y: number): Vector;

    /**
     * Return a new Vector with 'this' Vector's x and y
     *  components substracted by 'other''s components.
     *
     * @param other The vector to substract to 'this'.
     * @returns     A new vector with 'this' substracted by 'other.x' and 'other.y'.
     */
    sub(other: Vector): Vector;


    /**
     * Return a new vector with 'this' vector's 'x' and 'y'
     * scalar multiplied by 'amt'.
     *
     * @param amt The number to scalar multiply to 'this'.
     * @returns   A new vector with 'this' scalar multiplied by 'amt'.
     */
    scale(amt: number): Vector;

    /**
     * Return a new vector with 'this' vector's 'x' and 'y'
     * scalar multiplied by vector 'other''s 'x' and 'y' respectively.
     *
     * @param other The vector to scalar multiply to 'this'.
     */
    scale(other: Vector): Vector;


    /**
     * Return a Vector with 'this' Vector's absolute value of 'x' and 'y'.
     *
     * @returns Return a new vector that hold the absolute value
     *  of original vector.
     */
    abs(): Vector;

    /**
     * Return a vector that is normalized 'this' Vector.
     *
     * @returns Return a new vector that is normalized 'this'.
     */
    normalize(): Vector;

    /**
     * Return the length of the vector.
     *
     * @returns Return the length of the vector.
     */
    len(): number;

    /**
     * Return the dot product of 'this' to itself,
     * which is the squared length of 'this'.
     *
     * @returns The dot product of 'this' . 'this'.
     */
    len2(): number;

    /**
     * Return the angle of 'this' that respects to the x-axis.
     *
     * @returns The arctan value of 'this''s 'x' and 'y'.
     */
    angle(): number;

    /**
     * Return the distance from 'this' to 'v'.
     *
     * @param v The vector we need to mearsure the distance to.
     * @returns The length of the vector of 'this' sub 'v'.
     */
    distanceTo(v: Vector): number;

    /**
     * Return the dot product of 'this' and 'v'.
     *
     * @param v The vector to dot multiply to 'this'.
     * @returns 'this' dot multiplied by 'v'.
     */
    dot(v: Vector): number;

    /**
     * Returns a new vector rotated `a` radians from this one.
     *
     * @param a The angle in radians.
     * @param o The origin to rotate around.
     * @returns A new, rotated vector.
     */
    rotate(a: number, o?: Vector): Vector;

    /**
     * Returns a new vector with a set rotation of `a` radians from the origin.
     *
     * @param a The angle in radians.
     * @param o The origin to rotate around.
     * @returns A new, rotated vector.
     */
    withRotation(a: number, o?: Vector): Vector;

    /**
     * Return the projection of 'this' on 'v'.
     *
     * @param v The vector that 'this' projects to.
     * @returns The projection of 'this' on vector 'v'.
     */
    project(v: Vector): Vector;

    /**
     * Return a negative reciprocal vector of 'this'.
     *
     * @returns A new vector with negative reciprocal 'this'.
     */
    negativeReciprocal(): Vector;

    toString(): string;
}

export namespace Vector {
    export type Spaces = "world" | "screen";

    /**
     * Return a vector that has mininum 'x' and 'y' components from
     * vectors within the array 'vectors'.
     *
     * @param vecs The array that holds vectors.
     * @returns    A Vector with the smallest 'x' and 'y' that
     *             from vector(s) in the array.
     */
    export function Min(...vecs: Vector[]): Vector {
        return new VectorImpl(
            Math.min(...vecs.map((v) => v.x)),
            Math.min(...vecs.map((v) => v.y)));
    }

    /**
     * Return a vector that has maxium 'x' and 'y' components from
     * vectors within the array 'vectors'.
     *
     * @param vecs The array that holds vectors.
     * @returns    A Vector with the biggest 'x' and 'y' that
     *             from vector(s) in the array.
     */
    export function Max(...vecs: Vector[]): Vector {
        return new VectorImpl(
            Math.max(...vecs.map((v) => v.x)),
            Math.max(...vecs.map((v) => v.y))
        );
    }

    /**
     * Keep the vector 'x' within the range that formed by 'lo' and 'hi'.
     *
     * @param x  The vector that need to be examined.
     * @param lo The minimum vector of the range.
     * @param hi The maximum vector of the range.
     * @returns  Return 'x' itself if it is in the range of 'lo' and 'hi'.
     *           If one of the component of 'x' out of the range, it will
     *           be respectively change to corresponding compoenent of 'lo' or 'hi' and return.
     *           If both component of 'x' out of the range,
     *           it will return 'lo' or 'hi' depend on the valueof 'x'.
     */
    export function Clamp(x: Vector, lo: Vector, hi: Vector): Vector {
        return Vector.Min(Vector.Max(x, lo), hi);
    }

    export function Ceil(vec: Vector): Vector {
        return new VectorImpl(
            Math.ceil(vec.x),
            Math.ceil(vec.y),
            vec.space,
        );
    }

    export function Floor(vec: Vector): Vector {
        return new VectorImpl(
            Math.floor(vec.x),
            Math.floor(vec.y),
            vec.space,
        );
    }
}

class VectorImpl implements Vector {
    public readonly space: Vector.Spaces;
    public readonly x: number;
    public readonly y: number;

    public constructor(x: number, y: number, space: Vector.Spaces = "world") {
        this.space = space;
        this.x = x;
        this.y = y;
    }

    public add(amt: number): Vector;
    public add(x: number, y: number): Vector;
    public add(other: Vector): Vector;
    public add(x: Vector | number, y?: number): Vector {
        if (typeof x === "number")
            return new VectorImpl(this.x + x, this.y + (y ?? x), this.space);
        return new VectorImpl(this.x + x.x, this.y + x.y, this.space);
    }

    public sub(amt: number): Vector;
    public sub(x: number, y: number): Vector;
    public sub(other: Vector): Vector;
    public sub(x: Vector | number, y?: number): Vector {
        if (typeof x === "number")
            return new VectorImpl(this.x - x, this.y - (y ?? x), this.space);
        return new VectorImpl(this.x - x.x, this.y - x.y, this.space);
    }

    public scale(amt: number): Vector;
    public scale(other: Vector): Vector;
    public scale(a: Vector | number): Vector {
        if (typeof a === "number")
            return new VectorImpl(this.x * a, this.y  * a, this.space);
        return new VectorImpl(this.x * a.x, this.y * a.y, this.space);
    }

    public abs(): Vector {
        return new VectorImpl(Math.abs(this.x), Math.abs(this.y), this.space);
    }
    public normalize(): Vector {
        const len = this.len();
        if (len === 0)
            return new VectorImpl(0, 0, this.space);
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
    public rotate(a: number, o = new VectorImpl(0, 0)): Vector {
        const cos = Math.cos(a), sin = Math.sin(a);
        return new VectorImpl(
            ((this.x - o.x) * cos - (this.y - o.y) * sin) + o.x,
            ((this.x - o.x) * sin + (this.y - o.y) * cos) + o.y,
            this.space
        );
    }
    public withRotation(a: number, o = new VectorImpl(0, 0)): Vector {
        return this.rotate(a - this.sub(o).angle(), o);
    }
    public project(v: Vector): Vector {
        return v.scale(this.dot(v) / v.len2());
    }
    public negativeReciprocal(): Vector {
        return new VectorImpl(this.y, -this.x, this.space);
    }

    public toString(): string {
        return `${this.space}(${Math.round(this.x)}, ${Math.round(this.y)})`;
    }
}

export function V(): Vector;
export function V(space: Vector.Spaces): Vector;
export function V(v: Vector): Vector;
export function V(x: number): Vector;
export function V(x: number, space: Vector.Spaces): Vector;
export function V(x: number, y: number): Vector;
export function V(x: number, y: number, space?: Vector.Spaces): Vector;
export function V(a?: Vector.Spaces | Vector | number, b?: Vector.Spaces | number, c?: Vector.Spaces): Vector {
    if (a === undefined)
        return new VectorImpl(0, 0);

    if (typeof a === "number") {
        if (typeof b === "number")
            return new VectorImpl(a, b, c);
        return new VectorImpl(a, a, b);
    }
    if (typeof a === "object") {
        return new VectorImpl(a.x, a.y, a.space);
    }
    if (typeof a === "string") {
        return new VectorImpl(0, 0, a);
    }

    throw new Error(`V: Incorrect parameters! ${a}, ${b}, ${c}`);
}
