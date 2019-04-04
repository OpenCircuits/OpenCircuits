export class Vector {
    public x: number;
    public y: number;

    public constructor(x: Vector | number = 0, y: number = 0) {
        this.set(x, y);
    }
    public set(x: Vector | number, y: number = 0): void {
        if (x instanceof Vector) {
            this.x = (x.x ? x.x : 0);
            this.y = (x.y ? x.y : 0);
        } else {
            this.x = (x ? x : 0);
            this.y = (y ? y : 0);
        }
    }
    public translate(dx: Vector | number, dy: number = 0): void {
        if (dx instanceof Vector)
            this.set(this.add(dx));
        else
            this.set(this.x + dx, this.y + dy);
    }
    public add(x: Vector | number, y: number = 0): Vector {
        if (x instanceof Vector)
            return new Vector(this.x + x.x, this.y + x.y);
        else
            return new Vector(this.x + x, this.y + y);
    }
    public sub(x: Vector | number, y: number = 0): Vector {
        if (x instanceof Vector)
            return new Vector(this.x - x.x, this.y - x.y);
        else (y != null)
            return new Vector(this.x - x, this.y - y);
    }
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
        if (len === 0) {
            return new Vector(0, 0);
        } else {
            const invLen = 1 / len;
            return new Vector(this.x * invLen, this.y * invLen);
        }
    }
    public len(): number {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }
    public len2(): number {
        return this.x*this.x + this.y*this.y;
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
    public copy(): Vector {
        return new Vector(this.x, this.y);
    }

    public static min(v1: Vector, v2: Vector): Vector {
        return new Vector(Math.min(v1.x, v2.x), Math.min(v1.y, v2.y));
    }
    public static max(v1: Vector, v2: Vector): Vector {
        return new Vector(Math.max(v1.x, v2.x), Math.max(v1.y, v2.y));
    }
    public static clamp(x: Vector, lo: Vector, hi: Vector): Vector {
        return Vector.min(Vector.max(x, lo), hi);
    }
}

export function V(x: Vector | number = 0, y: number = 0): Vector {
    return new Vector(x, y);
}
