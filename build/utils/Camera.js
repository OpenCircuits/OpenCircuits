"use strict";

var Vector = require("./math/Vector");
var V = Vector.V;
var Transform = require("./math/Transform");
var Matrix2x3 = require("./math/Matrix");
var TransformContains = require("./math/MathUtils").TransformContains;

class Camera {

    constructor(width, height, startPos = V(0, 0), startZoom = 1) {
        this.width = width;
        this.height = height;
        this.pos = startPos;
        this.zoom = startZoom;
        this.center = V(0, 0);
        this.transform = new Transform(V(0, 0), V(0, 0), 0);
        this.dirty = true;
    }
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.center = V(this.width, this.height).scale(0.5);
    }
    updateMatrix() {
        if (!this.dirty) return;
        this.dirty = false;

        this.mat = new Matrix2x3();
        this.mat.translate(this.pos);
        this.mat.scale(V(this.zoom, this.zoom));
        this.inv = this.mat.inverse();

        var p1 = this.getWorldPos(V(0, 0));
        var p2 = this.getWorldPos(V(this.width, this.height));
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

        return TransformContains(transform, this.getTransform());
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

module.exports = Camera;