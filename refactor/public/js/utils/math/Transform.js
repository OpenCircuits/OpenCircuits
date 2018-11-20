// @flow
var Vector = require("./Vector");
var Matrix2x3 = require("./Matrix");
var V = Vector.V;

/**
 * Class representing a Transform.
 * A Transform holds all the spacial information about an object.
 * (ex. position, rotating, size, etc.)
 *
 * For performance reasons the transform also stores a list of corners
 *  to be able to quickly apply intersection testing.
 */
class Transform {
    parent: ?Transform;
    pos: Vector;
    scale: Vector;
    angle: number;
    size: Vector;

    corners: Array<Vector>;
    localCorners: Array<Vector>;

    dirty: boolean;
    dirtySize: boolean;
    dirtyCorners: boolean;

    matrix: Matrix2x3;
    inverse: Matrix2x3;
    radius: number;

    /**
     * Constructs a new Transform object
     *
     * @param  {Vector} pos     The initial position of the transform
     * @param  {Vector} size    The initial size of the transform
     * @param  {number} angle   The initial angle of the transform
     */
    constructor(pos: Vector, size: Vector, angle: number = 0) {
        this.parent = undefined;
        this.pos = V(pos.x, pos.y);
        this.size = V(size.x, size.y);
        this.angle = angle;
        this.scale = V(1, 1);
        this.corners = [];
        this.localCorners = [];
        this.dirty = true;
        this.dirtySize = true;
        this.dirtyCorners = true;
        this.updateMatrix();
    }
    updateMatrix(): void {
        if (!this.dirty)
            return;
        this.dirty = false;

        this.matrix = new Matrix2x3();
        this.matrix.translate(this.pos);
        this.matrix.rotate(this.angle);
        this.matrix.scale(this.scale);

        if (this.parent != undefined)
            this.matrix = this.parent.getMatrix().mult(this.matrix);

        this.inverse = this.matrix.inverse();
    }
    updateSize(): void {
        if (!this.dirtySize)
            return;
        this.dirtySize = false;

        this.localCorners = [this.size.scale(V(-0.5, 0.5)), this.size.scale(V(0.5, 0.5)),
                             this.size.scale(V(0.5, -0.5)), this.size.scale(V(-0.5, -0.5))];

        this.radius = Math.sqrt(this.size.x*this.size.x + this.size.y*this.size.y)/2;
    }
    updateCorners(): void {
        if (!this.dirtyCorners)
            return;
        this.dirtyCorners = false;

        var corners = this.getLocalCorners();
        for (var i = 0; i < 4; i++)
            this.corners[i] = this.toWorldSpace(corners[i]);
    }

    /**
     * Rotates this transform 'a' radians about the axis 'c'
     *
     * @param {number} a The angle to rotate
     * @param {number} c The axis to rotate about
     */
    rotateAbout(a: number, c: Vector): void {
        this.setAngle(a);
        this.setPos(this.pos.sub(c));
        var cos = Math.cos(a), sin = Math.sin(a);
        var xx = this.pos.x * cos - this.pos.y * sin;
        var yy = this.pos.y * cos + this.pos.x * sin;
        this.setPos(V(xx, yy).add(c));
        this.dirty = true;
        this.dirtyCorners = true;
    }

    setParent(t: Transform): void {
        this.parent = t;
        this.dirty = true;
        this.dirtyCorners = true;
    }
    setPos(p: Vector): void {
        this.pos.x = p.x;
        this.pos.y = p.y;
        this.dirty = true;
        this.dirtyCorners = true;
    }
    setAngle(a: number): void {
        this.angle = a;
        this.dirty = true;
        this.dirtyCorners = true;
    }
    setScale(s: Vector): void {
        this.scale.x = s.x;
        this.scale.y = s.y;
        this.dirty = true;
    }
    setSize(s: Vector): void {
        this.size.x = s.x;
        this.size.y = s.y;
        this.dirtySize = true;
        this.dirtyCorners = true;
    }
    setWidth(w: number): void {
        this.size.x = w;
        this.dirtySize = true;
        this.dirtyCorners = true;
    }
    setHeight(h: number): void {
        this.size.y = h;
        this.dirtySize = true;
        this.dirtyCorners = true;
    }

    /**
     * Converts the given Vector, v, to local space relative
     *  to this transform
     *
     * @param {Vector} v    The vector to transform
     *                      Must be in world coordinates
     *
     * @return {Vector}     The local space vector
     */
    toLocalSpace(v: Vector): Vector { // v must be in world coords
        return this.getInverseMatrix().mul(v);
    }

    /**
     * Converts the given Vector, v, to world space relative
     *  to this transform
     *
     * @param {Vector} v    The vector to transform
     *                      Must be in local coordinates
     *
     * @return {Vector}     The world space vector
     */
    toWorldSpace(v: Vector): Vector {
        return this.getMatrix().mul(v);
    }

    getParent(): ?Transform {
        return this.parent;
    }
    getPos(): Vector {
        return V(this.pos.x, this.pos.y);
    }
    getAngle(): number {
        return this.angle;
    }
    getScale(): Vector {
        return V(this.scale.x, this.scale.y);
    }
    getSize(): Vector {
        return this.size;
    }
    getRadius(): number {
        this.updateSize();
        return this.radius;
    }
    getMatrix(): Matrix2x3 {
        this.updateMatrix();
        return this.matrix;
    }
    getInverseMatrix(): Matrix2x3 {
        this.updateMatrix();
        return this.inverse;
    }
    getBottomLeft(): Vector {
        this.updateCorners();
        return this.corners[0];
    }
    getBottomRight(): Vector {
        this.updateCorners();
        return this.corners[1];
    }
    getTopRight(): Vector {
        this.updateCorners();
        return this.corners[2];
    }
    getTopLeft(): Vector {
        this.updateCorners();
        return this.corners[3];
    }
    getCorners(): Array<Vector> {
        this.updateCorners();
        return this.corners;
    }
    getLocalCorners(): Array<Vector> {
        this.updateSize();
        return this.localCorners;
    }

    copy(): Transform {
        var trans = new Transform(this.pos.copy(), this.size.copy(), this.angle);
        trans.scale = this.scale.copy();
        trans.dirty = true;
        return trans;
    }
}

module.exports = Transform;
