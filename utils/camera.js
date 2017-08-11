class Camera {
    constructor(designer, startPos, startZoom) {
        this.canvas = designer.renderer.canvas;
        this.pos = (startPos ? startPos : V(0, 0));
        this.zoom = (startZoom ? startZoom : 1);
        this.center = V(0,0);
        this.transform = new Transform(V(0,0), V(0,0), 0, this);
        this.dirty = true;
    }
    resize() {
        this.center = V(this.canvas.width, this.canvas.height).scale(0.5);
    }
    updateMatrix() {
        if (!this.dirty)
            return;
        this.dirty = false;

        this.mat = new Matrix2x3();
        this.mat.translate(this.pos);
        this.mat.scale(V(this.zoom, this.zoom));
        this.inv = this.mat.inverse();

        var p1 = this.getWorldPos(V(0, 0));
        var p2 = this.getWorldPos(V(this.canvas.width, this.canvas.height));
        this.transform.setPos(p2.add(p1).scale(0.5));
        this.transform.setSize(p2.sub(p1));
    }
    translate(dx, dy) {
        this.dirty = true;
        this.pos.x += dx;
        this.pos.y += dy;
    }
    zoomBy(s) {
        this.dirty = true;
        this.zoom *= s;
    }
    cull(transform) {
        // getCurrentContext().getRenderer().save();
        // transform.transformCtx(getCurrentContext().getRenderer().context);
        // getCurrentContext().getRenderer().rect(0, 0, transform.size.x, transform.size.y, '#ff00ff');
        // getCurrentContext().getRenderer().restore();

        return (transformContains(transform, this.getTransform()));
    }
    getTransform() {
        this.updateMatrix();
        return this.transform;
    }
    getMatrix() {
        this.updateMatrix();
        return this.mat;
    }
    getInverseMatrix() {
        this.updateMatrix();
        return this.inv;
    }
    getScreenPos(v) {
        return this.getInverseMatrix().mul(v).add(this.center);
    }
    getWorldPos(v) {
        return this.getMatrix().mul(v.sub(this.center));
    }
}
