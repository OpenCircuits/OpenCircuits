import {V, Vector} from "./Vector";


/**
 * A representation of a 2x3 Matrix. Commonly used to represent the transform of a 2D object. This matrix really
 *  represents a 3x3 matrix with the last row being $[0, 0, 1]$. The first two columns represent the scale and rotation
 *  of the object (indices [0, 3]), while the last column represents the translation of the object (indices [4, 5]).
 *
 * Note that matrices are immutable.
 *
 * The indices are laid out in column-major order:
 * $$
 * \begin{bmatrix} 0 & 2 & 4 \\ 1 & 3 & 5 \end{bmatrix}
 * $$
 * .
 */
export class Matrix2x3 {
    public readonly mat: readonly number[];

    // Store inverse matrix for efficiency since matrices are immutable
    //  but only calculate on first call to `.inverse()`
    private inv?: Matrix2x3;

    /**
     * Initializes an identity matrix with pos/angle/scale given.
     */
    public constructor(pos?: Vector, angle?: number, scale?: Vector);

    /**
     * Creates a 2x3 Matrix with values copied from `mat`.
     *
     * @param mat The matrix values in which to copy.
     */
    public constructor(mat: number[]);

    // TODO[master](leon) - maybe make factory methods to do this logic w/ constructor only taking in raw elements
    //                      for efficiency reasons
    // TODO(leon) - consider making this not support arbitrary elements, and limit it to non-shear transformation
    //              which I think makes the determinant easier to calculate
    public constructor(other?: number[] | Vector, angle?: number, scale?: Vector) {
        this.mat = [1,0,0,1,0,0];

        if (other && "length" in other) {
            this.mat = [...other];
        } else {
            // This is kinda a hack, might want to in-line all the operations or something in the future
            let mat: Matrix2x3 = this;
            if (other)
                mat = mat.translate(other);
            if (angle)
                mat = mat.rotate(angle);
            if (scale)
                mat = mat.scale(scale);
            this.mat = mat.mat;
        }
    }

    /**
     * Return the result of `this` Matrix multiplied by the `other` Vector, resulting in a Vector.
     *
     * @param other The vector to multiply with this.
     * @returns     The resultant vector.
     */
    public mul(other: Vector): Vector {
        return V(
            this.mat[0] * other.x + this.mat[2] * other.y + this.mat[4],
            this.mat[1] * other.x + this.mat[3] * other.y + this.mat[5]
        );
    }

    /**
     * Returns the result of `this` Matrix multiplied with the `other` Matrix, resulting in another 2x3 Matrix.
     *
     * @param other The other matrix to multiply with this.
     * @returns     The resultant matrix.
     */
    public mult(other: Matrix2x3): Matrix2x3 {
        return new Matrix2x3([
            this.mat[0]*other.mat[0] + this.mat[2]*other.mat[1],
            this.mat[1]*other.mat[0] + this.mat[3]*other.mat[1],
            this.mat[0]*other.mat[2] + this.mat[2]*other.mat[3],
            this.mat[1]*other.mat[2] + this.mat[3]*other.mat[3],
            this.mat[0]*other.mat[4] + this.mat[2]*other.mat[5] + this.mat[4],
            this.mat[1]*other.mat[4] + this.mat[3]*other.mat[5] + this.mat[5],
        ]);
    }

    /**
     * Translates `this` by `t` depending on the rotation of `this` matrix.
     *
     * @param t The translation vector.
     * @returns The resultant matrix.
     */
    public translate(t: Vector): Matrix2x3 {
        const tx = this.mat[0] * t.x + this.mat[2] * t.y;
        const ty = this.mat[1] * t.x + this.mat[3] * t.y;
        return new Matrix2x3([
            this.mat[0], this.mat[1],
            this.mat[2], this.mat[3],
            tx,          ty,
        ]);
    }

    /**
     * Returns this matrix with translation set to `t`.
     *
     * @param t The translation vector.
     * @returns The resultant matrix.
     */
    public withTranslation(t: Vector): Matrix2x3 {
        return new Matrix2x3([
            this.mat[0], this.mat[1],
            this.mat[2], this.mat[3],
            t.x,         t.y,
        ]);
    }

    /**
     * Rotates `this` matrix by `theta` (in radians).
     *
     * @param theta The angle to rotate by (in radians).
     * @returns     The resultant matrix.
     */
    public rotate(theta: number): Matrix2x3 {
        const c = Math.cos(theta), s = Math.sin(theta);
        const m11 = this.mat[0] *  c + this.mat[2] * s;
        const m12 = this.mat[1] *  c + this.mat[3] * s;
        const m21 = this.mat[0] * -s + this.mat[2] * c;
        const m22 = this.mat[1] * -s + this.mat[3] * c;
        return new Matrix2x3([
            m11, m12,
            m21, m22,
            this.mat[4], this.mat[5],
        ]);
    }

    /**
     * Scales `this` matrix non-uniformly by the given vector, `s`.
     *
     * @param s The vector to scale `this` matrix by.
     * @returns The resultant matrix.
     */
    public scale(s: Vector): Matrix2x3;

    /**
     * Scales `this` matrix uniformly by the given scalar, `s`.
     *
     * @param s The vector to scale `this` matrix by.
     * @returns The resultant matrix.
     */
    public scale(s: number): Matrix2x3;

    public scale(s: Vector | number): Matrix2x3 {
        if (typeof s === "number") {
            return new Matrix2x3([
                this.mat[0] * s, this.mat[1] * s,
                this.mat[2] * s, this.mat[3] * s,
                this.mat[4],     this.mat[5],
            ]);
        }
        return new Matrix2x3([
            this.mat[0] * s.x, this.mat[1] * s.x,
            this.mat[2] * s.y, this.mat[3] * s.y,
            this.mat[4],       this.mat[5],
        ]);
    }

    /**
     * Returns a new matrix that is the inverse of `this` matrix which satisfies: $MM^{-1} = M^{-1}M = I$.
     *
     * @returns The inverted matrix.
     */
    public inverse(): Matrix2x3 {
        if (this.inv) // If already computed inverse, then return it
            return this.inv;

        // Calculate determinant
        const det = this.mat[0]*this.mat[3] - this.mat[1]*this.mat[2];
        if (det === 0) // undefined
            return new Matrix2x3();

        // Flip determinant since multiplication is typically faster than division
        const detI = 1 / det;
        this.inv = new Matrix2x3([
            (this.mat[3]) * detI,
            (-this.mat[1]) * detI,
            (-this.mat[2]) * detI,
            (this.mat[0]) * detI,
            (this.mat[2] * this.mat[5] - this.mat[4] * this.mat[3]) * detI,
            (this.mat[4] * this.mat[1] - this.mat[0] * this.mat[5]) * detI,
        ]);
        this.inv.inv = this; // Set the inverses' inverse to be us

        return this.inv;
    }

    /**
     * Returns the matrix element at index `i`. ($i \in [0, 5]$).
     *
     * @param i The index that must be an integer $\in [0, 5]$.
     * @returns The matrix corresponding element value.
     */
    public get(i: number): number {
        return this.mat[i];
    }

    /**
     * Returns the translation of `this` matrix (last column).
     *
     * @returns The translation vector.
     */
    public get pos(): Vector {
        return V(this.mat[4], this.mat[5]);
    }

    /**
     * Returns whether or not `this` matrix has the same components as `other`.
     *
     * @param other The other matrix to compare with.
     * @returns     True if the two matrices are equal, false otherwise.
     */
    public equals(other: Matrix2x3): boolean {
        for (let i = 0; i < 2*3; i++) {
            if (this.mat[i] !== other.mat[i])
                return false;
        }
        return true;
    }


    public static Zero() {
        return new Matrix2x3([
            0,0,
            0,0,
            0,0,
        ]);
    }
    public static Identity() {
        return new Matrix2x3([
            1,0,
            0,1,
            0,0,
        ]);
    }
}
