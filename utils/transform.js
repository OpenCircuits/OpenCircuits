class Transform {
    constructor(pos, size, angle) {
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
        this.matrix.translate(camera.getScreenPos(this.pos));
        this.matrix.rotate(this.angle);
        this.matrix.scale(this.scale.scale(1 / camera.zoom));
        this.inverse = this.matrix.inverse();

        this.prevCameraPos = V(camera.pos.x, camera.pos.y);
        this.prevCameraZoom = camera.zoom;
    }
    transformCtx(ctx) {
        ctx.setTransform(this.matrix.mat[0], this.matrix.mat[1], this.matrix.mat[2], this.matrix.mat[3], this.matrix.mat[4], this.matrix.mat[5]);
    }
    toLocalSpace(v) { // v is in screen coords
        return this.getInverseMatrix().mul(v);
    }
    setPos(p) {
        this.pos.x = p.x;
        this.pos.y = p.y;
        this.dirty = true;
    }
    setAngle(theta) {
        this.angle = theta;
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
