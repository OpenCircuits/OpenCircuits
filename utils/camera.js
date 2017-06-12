class Camera {
    constructor(designer, startPos, startZoom) {
        this.canvas = designer.renderer.canvas;
        this.pos = (startPos === undefined ? V(0, 0) : startPos);
        this.zoom = (startZoom === undefined ? 1 : startZoom);
    }
    getScreenPos(v) {
        return v.sub(this.pos).scale(1.0 / this.zoom).add(this.canvas.width/2, this.canvas.height/2);
    }
    getWorldPos(v) {
        return v.sub(this.canvas.width/2, this.canvas.height/2).scale(this.zoom).add(this.pos);
    }
}
