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

import {TranslateAction} from "../actions/TranslateAction";

import {MainDesignerController} from "../../controllers/MainDesignerController";

export class TranslateTool extends Tool {
    private camera: Camera;

    private dragging: boolean;
    private action: TranslateAction;
    private startPos: Vector;

    public constructor(camera: Camera) {
        super();

        this.camera = camera;

        this.dragging = false;
    }

    public startDragging(objs: Array<IOObject>, mousePos: Vector, pressedObj: IOObject): void {
        this.dragging = true;
        this.startPos = mousePos;
        this.action = new TranslateAction(objs);
    }

    public onMouseDrag(input: Input, button: number): boolean {
        if (!this.dragging)
            return false;
        if (button !== LEFT_MOUSE_BUTTON)
            return false;

        let mousePosOffset = this.camera.getWorldPos(input.getMousePos()).sub(this.startPos)
        this.action.updateOffset(mousePosOffset);

        return true;
    }

    public onMouseUp(input: Input, button: number): boolean {
        if (!this.dragging)
            return false;
        if (button !== LEFT_MOUSE_BUTTON)
            return false;

        this.dragging = false;

        MainDesignerController.GetActionManager().add(this.action);

        return true;
    }

    public isDragging(): boolean {
        return this.dragging;
    }

}
