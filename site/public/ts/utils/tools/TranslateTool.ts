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

import {Action} from "../actions/Action";
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

    public activate(currentTool: Tool, event: string, input: Input, button?: number): boolean {
        if (!(currentTool instanceof SelectionTool))
            return false;
        if (!(event == "mousedrag"))
            return false;

        let worldMousePos = this.camera.getWorldPos(input.getMousePos());

        let selections = currentTool.getSelections();
        let currentPressedObj = currentTool.getCurrentlyPressedObj();
        if (currentPressedObj != undefined) {
            let objects = [currentPressedObj];

            // Translate multiple objects if they are all selected
            if (selections.length > 0 && selections.includes(objects[0]))
                objects = selections

            this.dragging = true;
            this.startPos = worldMousePos;
            this.action = new TranslateAction(objects);

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

    public getAction(): Action {
        return this.action;
    }

    public isDragging(): boolean {
        return this.dragging;
    }

}
