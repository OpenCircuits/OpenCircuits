import {serializable} from "serialeazy";

import {V, Vector} from "./Vector";


/**
 * A representation of a 2x3 Matrix. Commonly used to represent the transform of a 2D object. This matrix really
 *  represents a 3x3 matrix with the last row being $[0, 0, 1]$. The first two columns represent the scale and rotation
 *  of the object (indices [0, 3]), while the last column represents the translation of the object (indices [4, 5]).
 *
 * The indices are laid out in column-major order:
 * $$
 * \begin{bmatrix} 0 & 2 & 4 \\ 1 & 3 & 5 \end{bmatrix}
 * $$
 * .
 */
@serializable("Matrix2x3")
export class Matrix2x3 {
    private mat: number[];

    /**
     * Initializes a 2x3 Identity Matrix with all zeros except indices 0, 3 as ones.
     */
    public constructor();

    /**
     * Creates a 2x3 Matrix with values copied from `other`.
     *
     * @param other The other matrix in which to copy.
     */
    public constructor(other: Matrix2x3);

    public constructor(other?: Matrix2x3) {
        this.mat = [];
        this.identity();
        if (other instanceof Matrix2x3) {
            for (let i = 0; i < 2*3; i++)
                this.mat[i] = other.mat[i];
        }
    }

    /**
     * Sets all of the values in `this` Matrix to 0.
     *
     * @returns `this` for chaining.
     */
    public zero(): Matrix2x3 {
        for (let i = 0; i < 2*3; i++)
            this.mat[i] = 0;
        return this;
    }

    /**
     * Zeros all the values in `this` Matrix except at index 0 and 3 which are set to 1 to represent an Identity matrix.
     *
     * @returns `this` for chaining.
     */
    public identity(): Matrix2x3 {
        this.zero();

        this.mat[0] = 1;
        this.mat[3] = 1;

        return this;
    }

    /**
     * Return the result of `this` Matrix multiplied by the `other` Vector, resulting in a Vector.
     *
     * @param other The vector to multiply with this.
     * @returns       The resultant vector.
     */
    public mul(other: Vector): Vector {
        const result = V(0,0);
        result.x = this.mat[0] * other.x + this.mat[2] * other.y + this.mat[4];
        result.y = this.mat[1] * other.x + this.mat[3] * other.y + this.mat[5];
        return result;
    }

    /**
     * Returns the result of `this` Matrix multiplied with the `other` Matrix, resulting in another 2x3 Matrix.
     *
     * @param other The other matrix to multiply with this.
     * @returns       The resultant matrix.
     */
    public mult(other: Matrix2x3): Matrix2x3 {
        const result = new Matrix2x3();
        result.mat[0] = this.mat[0]*other.mat[0] + this.mat[2]*other.mat[1];
        result.mat[1] = this.mat[1]*other.mat[0] + this.mat[3]*other.mat[1];
        result.mat[2] = this.mat[0]*other.mat[2] + this.mat[2]*other.mat[3];
        result.mat[3] = this.mat[1]*other.mat[2] + this.mat[3]*other.mat[3];
        result.mat[4] = this.mat[0]*other.mat[4] + this.mat[2]*other.mat[5] + this.mat[4];
        result.mat[5] = this.mat[1]*other.mat[4] + this.mat[3]*other.mat[5] + this.mat[5];
        return result;
    }

    /**
     * Sets the translation of `t`his Matrix (last column) to `t`.
     *
     * @param t The translation vector.
     */
    public setTranslation(t: Vector): void {
        this.mat[4] = t.x;
        this.mat[5] = t.y;
    }

    /**
     * Translates `this` by `t` depending on the rotation of `this` matrix.
     *
     * @param t The translation vector.
     */
    public translate(t: Vector): void {
        this.mat[4] += this.mat[0] * t.x + this.mat[2] * t.y;
        this.mat[5] += this.mat[1] * t.x + this.mat[3] * t.y;
    }

    /**
     * Rotates `this` matrix by `theta` (in radians).
     *
     * @param theta The angle to rotate by (in radians).
     */
    public rotate(theta: number): void {
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        const m11 = this.mat[0] * c + this.mat[2] * s;
        const m12 = this.mat[1] * c + this.mat[3] * s;
        const m21 = this.mat[0] * -s + this.mat[2] * c;
        const m22 = this.mat[1] * -s + this.mat[3] * c;
        this.mat[0] = m11;
        this.mat[1] = m12;
        this.mat[2] = m21;
        this.mat[3] = m22;
    }

    /**
     * Scales `this` matrix non-uniformly by the given vector, `s`.
     *
     * @param s The vector to scale `this` matrix by.
     */
    public scale(s: Vector): void;

    /**
     * Scales `this` matrix uniformly by the given scalar, `s`.
     *
     * @param s The vector to scale `this` matrix by.
     */
    public scale(s: number): void;

    public scale(s: Vector | number): void {
        if (s instanceof Vector) {
            this.mat[0] *= s.x;
            this.mat[1] *= s.x;
            this.mat[2] *= s.y;
            this.mat[3] *= s.y;
        } else {
            this.mat[0] *= s;
            this.mat[1] *= s;
            this.mat[2] *= s;
            this.mat[3] *= s;
        }
    }

    /**
     * Returns a new matrix that is the inverse of `this` matrix which satisfies: $MM^{-1} = M^{-1}M = I$.
     *
     * @returns The inverted matrix.
     */
    public inverse(): Matrix2x3 {
        const inv = new Array(3*2);
        let det;

        inv[0] = this.mat[3];
        inv[1] = -this.mat[1];
        inv[2] = -this.mat[2];
        inv[3] = this.mat[0];
        inv[4] = this.mat[2] * this.mat[5] -
                 this.mat[4] * this.mat[3];
        inv[5] = this.mat[4] * this.mat[1] -
                 this.mat[0] * this.mat[5];

        det = this.mat[0]*this.mat[3] - this.mat[1]*this.mat[2];

        if (det === 0)
            return new Matrix2x3();

        det = 1 / det;

        const m = new Matrix2x3();
        for (let i = 0; i < 2*3; i++)
            m.mat[i] = inv[i] * det;

        return m;
    }

    /**
     * Returns the matrix element at index `i`. ($i \in [0, 5]$).
     *
     * @param i The index that must be an integer $\in [0, 5]$.
     * @returns   The matrix corresponding element value.
     */
    public get(i: number): number {
        return this.mat[i];
    }

    /**
     * Returns the translation of `this` matrix (last column).
     *
     * @returns The translation vector.
     */
    public getTranslation(): Vector {
        return V(this.mat[4], this.mat[5]);
    }

    /**
     * Returns whether or not `this` matrix has the same components as `other`.
     *
     * @param other The other matrix to compare with.
     * @returns       True if the two matrices are equal, false otherwise.
     */
    public equals(other: Matrix2x3): boolean {
        for (let i = 0; i < 2*3; i++) {
            if (this.mat[i] !== other.mat[i])
                return false;
        }
        return true;
    }

    /**
     * Return a copy of this Matrix with the same components.
     *
     * @returns A copy of the matrix.
     */
    public copy(): Matrix2x3 {
        return new Matrix2x3(this);
    }
}
