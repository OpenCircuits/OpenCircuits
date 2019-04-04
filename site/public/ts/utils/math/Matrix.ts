import {Vector,V} from "./Vector";

export class Matrix2x3 {
    private mat: Array<number>

    public constructor(other?: Matrix2x3) {
        this.mat = [];
        this.identity();
        if (other instanceof Matrix2x3) {
            for (let i = 0; i < 2*3; i++)
                this.mat[i] = other.mat[i];
        }
    }
    public get(i: number): number {
        return this.mat[i];
    }
    public zero(): Matrix2x3 {
        for (let i = 0; i < 2*3; i++)
            this.mat[i] = 0;
        return this;
    }
    public identity(): Matrix2x3 {
        this.zero();

        this.mat[0] = 1.0;
        this.mat[3] = 1.0;

        return this;
    }
    public mul(v: Vector): Vector {
        const result = V(0,0);
        result.x = this.mat[0] * v.x + this.mat[2] * v.y + this.mat[4];
        result.y = this.mat[1] * v.x + this.mat[3] * v.y + this.mat[5];
        return result;
    }
    public mult(m: Matrix2x3): Matrix2x3 {
        const result = new Matrix2x3();
        result.mat[0] = this.mat[0]*m.mat[0] + this.mat[2]*m.mat[1];
        result.mat[1] = this.mat[1]*m.mat[0] + this.mat[3]*m.mat[1];
        result.mat[2] = this.mat[0]*m.mat[2] + this.mat[2]*m.mat[3];
        result.mat[3] = this.mat[1]*m.mat[2] + this.mat[3]*m.mat[3];
        result.mat[4] = this.mat[0]*m.mat[4] + this.mat[2]*m.mat[5] + this.mat[4];
        result.mat[5] = this.mat[1]*m.mat[4] + this.mat[3]*m.mat[5] + this.mat[5];
        return result;
    }
    public setTranslation(v: Vector): void {
        this.mat[4] = v.x;
        this.mat[5] = v.y;
    }
    public getTranslation(): Vector {
        return V(this.mat[4], this.mat[5]);
    }
    public translate(v: Vector): void {
        this.mat[4] += this.mat[0] * v.x + this.mat[2] * v.y;
        this.mat[5] += this.mat[1] * v.x + this.mat[3] * v.y;
    }
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

        if (det == 0)
            return new Matrix2x3();

        det = 1.0 / det;

        const m = new Matrix2x3();
        for (let i = 0; i < 2*3; i++)
            m.mat[i] = inv[i] * det;

        return m;
    }
    public print(): void {
        console.log("[" + this.mat[0].toFixed(3) + ", " + this.mat[2].toFixed(3) + ", " + this.mat[4].toFixed(3) + "]\n" +
                    "[" + this.mat[1].toFixed(3) + ", " + this.mat[3].toFixed(3) + ", " + this.mat[5].toFixed(3) + "]");
    }
    public equals(other: Matrix2x3): boolean {
        if (other == null)
            return false;
        
        for (let i = 0; i < 2*3; i++) {
            if (this.mat[i] !== other.mat[i])
                return false;
        }
        return true;
    }
    public copy(): Matrix2x3 {
        return new Matrix2x3(this);
    }
}
