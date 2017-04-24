class Transform {
    constructor(pos, size, angle) {
        this.parent = undefined;
        this.pos = V(pos.x, pos.y);
        this.size = V(size.x, size.y);
        this.scale = V(1, 1);
        this.prevCameraPos = V(0,0);
        this.prevCameraZoom = 0;
        this.setAngle(angle);
        this.updateMatrix();
    }
    updateMatrix() {
        // Update matrix if camera moved/zoomed
        if (this.prevCameraPos.x !== camera.pos.x || this.prevCameraPos.y !== camera.pos.y || this.prevCameraZoom !== camera.zoom)
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

        this.prevCameraPos = V(camera.pos.x, camera.pos.y);
        this.prevCameraZoom = camera.zoom;
    }
    transformCtx(ctx) {
        this.updateMatrix();
        var m = new Matrix2x3(this.matrix);
        var v = camera.getScreenPos(V(m.mat[4], m.mat[5]));
        m.mat[4] = v.x, m.mat[5] = v.y;
        m.scale(V(1/camera.zoom, 1/camera.zoom));
        ctx.setTransform(m.mat[0], m.mat[1], m.mat[2], m.mat[3], m.mat[4], m.mat[5]);
    }
    toLocalSpace(v) { // v must be in world coords
        return this.getInverseMatrix().mul(v);
    }
    setParent(t) {
        this.parent = t;
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
    setScale(s) {
        this.scale.x = s.x;
        this.scale.y = s.y;
        this.dirty = true;
    }
    getPos() {
        return V(this.x, this.y);
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
}
