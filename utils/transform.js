class Transform {
    constructor(pos, size, angle, camera) {
        this.parent = undefined;
        this.pos = V(pos.x, pos.y);
        this.size = V(size.x, size.y);
        this.scale = V(1, 1);
        this.camera = camera;
        this.prevCameraPos = V(this.camera.pos.x, this.camera.pos.y);
        this.prevCameraZoom = this.camera.zoom;
        this.setAngle(angle);
        this.updateMatrix();
    }
    updateMatrix(c) {
        // Update matrix if camera zoomed/moved
        if (this.prevCameraZoom !== this.camera.zoom || this.prevCameraPos.x !== this.camera.pos.x || this.prevCameraPos.y !== this.camera.pos.y)
            this.dirty = true;

        if (!this.dirty)
            return;
        this.dirty = false;

        this.matrix = new Matrix2x3();
        this.matrix.translate(this.pos);
        this.matrix.rotate(this.angle);
        this.matrix.scale(this.scale);

        if (this.parent !== undefined)
            this.matrix = this.parent.getMatrix().mult(this.matrix);

        this.inverse = this.matrix.inverse();

        this.prevCameraPos = V(this.camera.pos.x, this.camera.pos.y);
        this.prevCameraZoom = this.camera.zoom;
    }
    transformCtx(ctx) {
        this.updateMatrix();
        var m = new Matrix2x3(this.matrix);
        var v = this.camera.getScreenPos(V(m.mat[4], m.mat[5]));
        m.mat[4] = v.x, m.mat[5] = v.y;
        m.scale(V(1/this.camera.zoom, 1/this.camera.zoom));
        ctx.setTransform(m.mat[0], m.mat[1], m.mat[2], m.mat[3], m.mat[4], m.mat[5]);
    }
    toLocalSpace(v) { // v must be in world coords
        return this.getInverseMatrix().mul(v);
    }
    toWorldSpace(v) { // v must be in local coords
        return this.getMatrix().mul(v);
    }
    setParent(t) {
        this.parent = t;
        this.dirty = true;
    }
    setCamera(c) {
        this.camera = c;
        this.dirty = true;
    }
    setPos(p) {
        this.pos.x = p.x;
        this.pos.y = p.y;
        this.dirty = true;
    }
    setAngle(a) {
        this.angle = a;
        this.dirty = true;
    }
    rotateAbout(a, c) {
        this.setAngle(a);
        this.setPos(this.pos.sub(c));
        var cos = Math.cos(a), sin = Math.sin(a);
        var xx = this.pos.x * cos - this.pos.y * sin;
        var yy = this.pos.y * cos + this.pos.x * sin;
        this.setPos(V(xx, yy).add(c));
        this.dirty = true;
    }
    setScale(s) {
        this.scale.x = s.x;
        this.scale.y = s.y;
        this.dirty = true;
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
    getMatrix() {
        this.updateMatrix();
        return this.matrix;
    }
    getInverseMatrix() {
        this.updateMatrix();
        return this.inverse;
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
