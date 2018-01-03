class Transform {
    constructor(pos, size, angle, camera) {
        this.parent = undefined;
        this.pos = V(pos.x, pos.y);
        this.size = V(size.x, size.y);
        this.angle = angle;
        this.scale = V(1, 1);
        this.corners = [];
        this.localCorners = [];
        this.camera = camera;
        this.dirty = true;
        this.dirtySize = true;
        this.dirtyCorners = true;
        this.updateMatrix();
    }
    updateMatrix(c) {
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
    updateSize() {
        if (!this.dirtySize)
            return;
        this.dirtySize = false;

        this.localCorners = [this.size.scale(V(-0.5, 0.5)), this.size.scale(V(0.5, 0.5)),
                             this.size.scale(V(0.5, -0.5)), this.size.scale(V(-0.5, -0.5))];

        this.radius = Math.sqrt(this.size.x*this.size.x + this.size.y*this.size.y)/2;
    }
    updateCorners() {
        if (!this.dirtyCorners)
            return;
        this.dirtyCorners = false;

        var corners = this.getLocalCorners();
        for (var i = 0; i < 4; i++)
            this.corners[i] = this.toWorldSpace(corners[i]);
    }
    transformCtx(ctx) {
        this.updateMatrix();
        var m = new Matrix2x3(this.matrix);
        var v = this.camera.getScreenPos(V(m.mat[4], m.mat[5]));
        m.mat[4] = v.x, m.mat[5] = v.y;
        m.scale(V(1/this.camera.zoom, 1/this.camera.zoom));
        ctx.setTransform(m.mat[0], m.mat[1], m.mat[2], m.mat[3], m.mat[4], m.mat[5]);
    }
    rotateAbout(a, c) {
        this.setAngle(a);
        this.setPos(this.pos.sub(c));
        var cos = Math.cos(a), sin = Math.sin(a);
        var xx = this.pos.x * cos - this.pos.y * sin;
        var yy = this.pos.y * cos + this.pos.x * sin;
        this.setPos(V(xx, yy).add(c));
        this.dirty = true;
        this.dirtyCorners = true;
    }
    setParent(t) {
        this.parent = t;
        this.dirty = true;
        this.dirtyCorners = true;
    }
    setCamera(c) {
        this.camera = c;
    }
    setPos(p) {
        this.pos.x = p.x;
        this.pos.y = p.y;
        this.dirty = true;
        this.dirtyCorners = true;
    }
    setAngle(a) {
        this.angle = a;
        this.dirty = true;
        this.dirtyCorners = true;
    }
    setScale(s) {
        this.scale.x = s.x;
        this.scale.y = s.y;
        this.dirty = true;
    }
    setSize(s) {
        this.size.x = s.x;
        this.size.y = s.y;
        this.dirtySize = true;
        this.dirtyCorners = true;
    }
    setWidth(w) {
        this.size.x = w;
        this.dirtySize = true;
        this.dirtyCorners = true;
    }
    setHeight(h) {
        this.size.y = h;
        this.dirtySize = true;
        this.dirtyCorners = true;
    }
    toLocalSpace(v) { // v must be in world coords
        return this.getInverseMatrix().mul(v);
    }
    toWorldSpace(v) { // v must be in local coords
        return this.getMatrix().mul(v);
    }
    getPos() {
        return V(this.pos.x, this.pos.y);
    }
    getAngle() {
        return this.angle;
    }
    getScale() {
        return V(this.scale.x, this.scale.y);
    }
    getSize() {
        return this.size;
    }
    getRadius() {
        this.updateSize();
        return this.radius;
    }
    getMatrix() {
        this.updateMatrix();
        return this.matrix;
    }
    getInverseMatrix() {
        this.updateMatrix();
        return this.inverse;
    }
    getBottomLeft() {
        this.updateCorners();
        return this.corners[0];
    }
    getBottomRight() {
        this.updateCorners();
        return this.corners[1];
    }
    getTopRight() {
        this.updateCorners();
        return this.corners[2];
    }
    getTopLeft() {
        this.updateCorners();
        return this.corners[3];
    }
    getCorners() {
        this.updateCorners();
        return this.corners;
    }
    getLocalCorners() {
        this.updateSize();
        return this.localCorners;
    }
    equals(other) {
        if (!(other instanceof Transform))
            return false;

        var m1 = this.getMatrix().mat;
        var m2 = other.getMatrix().mat;
        for (var i = 0; i < m1.length; i++) {
            if (m1[i] !== m2[i])
                return false;
        }
        return true;
    }
    print() {
        this.updateMatrix();
        this.matrix.print();
    }
    copy() {
        var trans = new Transform(this.pos.copy(), this.size.copy(), this.angle, this.camera);
        trans.scale = this.scale.copy();
        trans.dirty = true;
        return trans;
    }
}
