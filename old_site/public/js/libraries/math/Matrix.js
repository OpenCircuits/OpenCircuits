class Matrix2x3 {
    constructor(other) {
        this.mat = [];
        this.identity();
        if (other instanceof Matrix2x3) {
            for (var i = 0; i < 2*3; i++)
                this.mat[i] = other.mat[i];
        }
    }
    zero() {
        for (var i = 0; i < 2*3; i++)
            this.mat[i] = 0;
        return this;
    }
    identity() {
        this.zero();

        this.mat[0] = 1.0;
        this.mat[3] = 1.0;

        return this;
    }
    mul(v) {
        var result = V(0,0);
        result.x = this.mat[0] * v.x + this.mat[2] * v.y + this.mat[4];
        result.y = this.mat[1] * v.x + this.mat[3] * v.y + this.mat[5];
        return result;
    }
    mult(m) {
        var result = new Matrix2x3();
        result.mat[0] = this.mat[0]*m.mat[0] + this.mat[2]*m.mat[1];
        result.mat[1] = this.mat[1]*m.mat[0] + this.mat[3]*m.mat[1];
        result.mat[2] = this.mat[0]*m.mat[2] + this.mat[2]*m.mat[3];
        result.mat[3] = this.mat[1]*m.mat[2] + this.mat[3]*m.mat[3];
        result.mat[4] = this.mat[0]*m.mat[4] + this.mat[2]*m.mat[5] + this.mat[4];
        result.mat[5] = this.mat[1]*m.mat[4] + this.mat[3]*m.mat[5] + this.mat[5];
        return result;
    }
    translate(v) {
        this.mat[4] += this.mat[0] * v.x + this.mat[2] * v.y;
        this.mat[5] += this.mat[1] * v.x + this.mat[3] * v.y;
    }
    rotate(theta) {
        var c = Math.cos(theta);
        var s = Math.sin(theta);
        var m11 = this.mat[0] * c + this.mat[2] * s;
        var m12 = this.mat[1] * c + this.mat[3] * s;
        var m21 = this.mat[0] * -s + this.mat[2] * c;
        var m22 = this.mat[1] * -s + this.mat[3] * c;
        this.mat[0] = m11;
        this.mat[1] = m12;
        this.mat[2] = m21;
        this.mat[3] = m22;
    }
    scale(s) {
        this.mat[0] *= s.x;
        this.mat[1] *= s.x;
        this.mat[2] *= s.y;
        this.mat[3] *= s.y;
    }
    inverse() {
        var inv = new Array(3*2);
        var det;

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
            return undefined;

        det = 1.0 / det;

        var m = new Matrix2x3();
        for (var i = 0; i < 2*3; i++)
            m.mat[i] = inv[i] * det;

        return m;
    }
    print() {
        console.log("[" + this.mat[0].toFixed(3) + ", " + this.mat[2].toFixed(3) + ", " + this.mat[4].toFixed(3) + "]\n" +
                    "[" + this.mat[1].toFixed(3) + ", " + this.mat[3].toFixed(3) + ", " + this.mat[5].toFixed(3) + "]");
    }
}
