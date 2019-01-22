import {ROTATION_CIRCLE_R1,
        ROTATION_CIRCLE_R2,
        SHIFT_KEY,
        LEFT_MOUSE_BUTTON} from "../Constants";

import {Vector,V} from "../math/Vector";
import {Input} from "../Input";
import {Camera} from "../Camera";
import {Tool} from "./Tool";

import {IOObject} from "../../models/ioobjects/IOObject";
import {Component} from "../../models/ioobjects/Component";

export class TranslateTool extends Tool {
    private camera: Camera;

    private objects: Array<IOObject>;

    private dragging: boolean;
    private prevPos: Vector;

    public constructor(camera: Camera) {
        super();

        this.camera = camera;

        this.dragging = false;
    }

    public startDragging(objs: Array<IOObject>, mousePos: Vector, pressedObj: IOObject): void {
        this.objects = objs;
        this.dragging = true;
        this.prevPos = mousePos;
    }

    public onMouseDrag(input: Input, button: number): boolean {
        if (!this.dragging)
            return false;
        if (button !== LEFT_MOUSE_BUTTON)
            return false;

        let worldMousePos = this.camera.getWorldPos(input.getMousePos());

        // Translate each object by a 'delta' position
        let dPos = worldMousePos.sub(this.prevPos);
        for (let i = 0; i < this.objects.length; i++) {
            let obj = this.objects[i];
            // Only translate components
            if (obj instanceof Component)
                obj.setPos(obj.getPos().add(dPos))
        }
        this.prevPos.translate(dPos);

        return true;
    }

    public onMouseUp(input: Input, button: number): boolean {
        if (!this.dragging)
            return false;
        if (button !== LEFT_MOUSE_BUTTON)
            return false;

        this.dragging = false;

        return true;
    }

    public isDragging(): boolean {
        return this.dragging;
    }

}
