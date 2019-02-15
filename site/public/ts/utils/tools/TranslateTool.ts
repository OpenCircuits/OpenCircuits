import {ROTATION_CIRCLE_R1,
        ROTATION_CIRCLE_R2,
        SHIFT_KEY,
        LEFT_MOUSE_BUTTON} from "../Constants";

import {Vector,V} from "../math/Vector";
import {Input} from "../Input";
import {Camera} from "../Camera";
import {Tool} from "./Tool";

import {SelectionTool} from "./SelectionTool";

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

    public activate(currentTool: Tool, event: string, input: Input, button?: number): boolean {
        if (!(currentTool instanceof SelectionTool))
            return false;
        if (!(event == "mousedrag"))
            return false;

        let worldMousePos = this.camera.getWorldPos(input.getMousePos());

        let selections = currentTool.getSelections();
        let currentPressedObj = currentTool.getCurrentlyPressedObj();
        if (currentPressedObj != undefined) {
            this.objects = [currentPressedObj];

            // Translate multiple objects if they are all selected
            if (selections.length > 0 && selections.includes(this.objects[0]))
                this.objects = selections

            this.dragging = true;
            this.prevPos = worldMousePos;

            return true;
        }
        return false;
    }

    public deactivate(event: string, input: Input, button?: number): boolean {
        return (event == "mouseup");
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
