
// Quick, easy constructor for a new Vector
function V(x, y, z, w) {
    return new Vector(x, y, z, w);
}

// Constructor for a Vector object
function Vector(x, y, z, w) {
    if (y === undefined) {
        this.x = (x.x === undefined ? 0 : x.x);
        this.y = (x.y === undefined ? 0 : x.y);
        this.z = (x.z === undefined ? 0 : x.z);
        this.w = (x.w === undefined ? 0 : x.w);
    } else {
        this.x = (x === undefined ? 0 : x);
        this.y = (y === undefined ? 0 : y);
        this.z = (z === undefined ? 0 : z);
        this.w = (w === undefined ? 0 : w);
    }
}

// Mutator; translates the Vector
Vector.prototype.translate = function(dx, dy, dz, dw) {
    if (dy !== undefined) {
        this.x += dx;
        this.y += dy;
        this.z += (dz === undefined ? 0 : dz);
        this.w += (dw === undefined ? 0 : dw);
    } else {
        this.x += dx.x;
        this.y += dx.y;
        this.z += dx.z;
        this.w += dx.w;
    }
}

// Returns a new Vector which is a composite of this one and the given one
Vector.prototype.add = function(a, b, c, d) {
    if (b === undefined)
        return new Vector(this.x + a.x, this.y + a.y, this.z + a.z, this.w + a.w);
    else
        return new Vector(this.x + a, this.y + b, this.z + (c === undefined ? 0 : c), this.w + (d === undefined ? 0 : d));
}

// Returns a new Vector which is the difference of this one and the given one
Vector.prototype.sub = function(a, b, c, d) {
    if (b === undefined)
        return new Vector(this.x - a.x, this.y - a.y, this.z - a.z, this.w - a.w);
    else
        return new Vector(this.x - a, this.y - b, this.z - (c === undefined ? 0 : c), this.w - (d === undefined ? 0 : d));
}

// Returns a new Vector which is this Vector scaled by the given scalar
Vector.prototype.scale = function(a) {
    if (!(a instanceof Vector))
        return new Vector(a * this.x, a * this.y, a * this.z, a * this.w);
    else
        return new Vector(a.x * this.x, a.y * this.y, a.z * this.z, a.w * this.w);
}

// Returns a normalized version of this Vector
Vector.prototype.normalize = function() {
    var len = this.len();
    if (len === 0)
        return new Vector(0, 0);
    else
        return new Vector(this.x / len, this.y / len, this.z / len, this.w / len);
}

// Returns the length of this Vector
Vector.prototype.len = function() {
    return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w);
}

// Returns the length^2 of this Vector
Vector.prototype.len2 = function() {
    return this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w;
}

// Returns the distance between this Vector and the given Vector
Vector.prototype.distanceTo = function(vec) {
    return vec.sub(this).len();
}

// Copies the Vector
Vector.prototype.copy = function() {
    return new Vector(this.x, this.y, this.z, this.w);
}
