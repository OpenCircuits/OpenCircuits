
// Utility method for a new Vector
function V(x, y) {
    return new Vector(x, y);
}

class Vector {
    constructor(x, y) {
        this.set(x, y);
    }
    set(x, y) {
        if (x instanceof Vector) {
            this.x = (x.x ? x.x : 0);
            this.y = (x.y ? x.y : 0);
        } else {
            this.x = (x ? x : 0);
            this.y = (y ? y : 0);
        }
    }
    translate(dx, dy) {
        if (dx instanceof Vector)
            this.set(this.add(dx));
        else
            this.set(this.x + dx, this.y + dy);
    }
    add(x, y) {
        if (x instanceof Vector)
            return new Vector(this.x + x.x, this.y + x.y);
        else
            return new Vector(this.x + x, this.y + y);
    }
    sub(x, y) {
        if (x instanceof Vector)
            return new Vector(this.x - x.x, this.y - x.y);
        else
            return new Vector(this.x - x, this.y - y);
    }
    scale(a) {
        if (a instanceof Vector)
            return new Vector(a.x * this.x, a.y * this.y);
        else
            return new Vector(a * this.x, a * this.y);
    }
    normalize() {
        var len = this.len();
        if (len === 0) {
            return new Vector(0, 0);
        } else {
            var invLen = 1 / len;
            return new Vector(this.x * invLen, this.y * invLen);
        }
    }
    len() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }
    len2() {
        return this.x*this.x + this.y*this.y;
    }
    distanceTo(v) {
        return this.sub(v).len();
    }
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    project(v) {
        return this.scale(v.dot(this) / this.len2());
    }
    copy() {
        return new Vector(this.x, this.y);
    }
}
