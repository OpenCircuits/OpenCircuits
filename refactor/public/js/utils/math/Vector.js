// @flow


class Vector {
    x: number;
    y: number;
    
    constructor(x: Vector | number, y: ?number) {
        this.set(x, y);
    }
    set(x: Vector | number, y: ?number): void {
        if (x instanceof Vector) {
            this.x = (x.x ? x.x : 0);
            this.y = (x.y ? x.y : 0);
        } else if (y != null) {
            this.x = (x ? x : 0);
            this.y = (y ? y : 0);
        } else {
            throw new Error("Undefined parameters passed to Vector.set! ${x}, ${y}");
        }
    }
    translate(dx: Vector | number, dy: ?number): void {
        if (dx instanceof Vector)
            this.set(this.add(dx));
        else if (dy != null)
            this.set(this.x + dx, this.y + dy);
        else
            throw new Error("Undefined parameters passed to Vector.translate! ${dx}, ${dy}");
    }
    add(x: Vector | number, y: ?number): Vector {
        if (x instanceof Vector)
            return new Vector(this.x + x.x, this.y + x.y);
        if (y != null)
            return new Vector(this.x + x, this.y + y);
        throw new Error("Undefined parameters passed to Vector.add! ${x}, ${y}");
    }
    sub(x: Vector | number, y: ?number): Vector {
        if (x instanceof Vector)
            return new Vector(this.x - x.x, this.y - x.y);
        if (y != null)
            return new Vector(this.x - x, this.y - y);
        throw new Error("Undefined parameters passed to Vector.sub! ${x}, ${y}");
    }
    scale(a: Vector | number): Vector {
        if (a instanceof Vector)
            return new Vector(a.x * this.x, a.y * this.y);
        return new Vector(a * this.x, a * this.y);
    }
    normalize(): Vector {
        var len = this.len();
        if (len === 0) {
            return new Vector(0, 0);
        } else {
            var invLen = 1 / len;
            return new Vector(this.x * invLen, this.y * invLen);
        }
    }
    len(): number {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }
    len2(): number {
        return this.x*this.x + this.y*this.y;
    }
    distanceTo(v: Vector): number {
        return this.sub(v).len();
    }
    dot(v: Vector): number {
        return this.x * v.x + this.y * v.y;
    }
    project(v: Vector): Vector {
        return this.scale(v.dot(this) / this.len2());
    }
    copy(): Vector {
        return new Vector(this.x, this.y);
    }
    
    static V(x: Vector | number, y: ?number): Vector {
        return new Vector(x, y);
    }
}

module.exports = Vector;
