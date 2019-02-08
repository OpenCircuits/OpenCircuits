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

import {RotateAction} from "../actions/RotateAction";

import {MainDesignerController} from "../../controllers/MainDesignerController";

export class RotateTool extends Tool {
    private camera: Camera;

    private rotating: boolean;
    private midpoint: Vector;
    private startAngle: number;

    private action: RotateAction;

    public constructor(camera: Camera) {
        super();

        this.camera = camera;

        this.rotating = false;
    }

    public startRotation(objs: Array<IOObject>, midpoint: Vector, mousePos: Vector): void {
        this.midpoint = midpoint;
        this.rotating = true;
        this.startAngle = mousePos.sub(midpoint).angle();
        this.action = new RotateAction(objs, midpoint);
    }

    public onMouseDrag(input: Input, button: number): boolean {
        if (!this.rotating)
            return false;
        if (button !== LEFT_MOUSE_BUTTON)
            return false;

        // Rotate each object by a 'delta' angle
        let worldMousePos = this.camera.getWorldPos(input.getMousePos());
        this.action.updateAngle(worldMousePos.sub(this.midpoint).angle() - this.startAngle);

        return true;
    }

    public onMouseUp(input: Input, button: number): boolean {
        if (!this.rotating)
            return false;
        if (button !== LEFT_MOUSE_BUTTON)
            return false;

        this.rotating = false;

        MainDesignerController.GetActionManager().add(this.action);
        return true;
    }

    public getMidpoint(): Vector {
        return this.midpoint;
    }

    public getLastAngle(): number {
        return this.action.getAngle() + this.getStartAngle();
    }

    public getStartAngle(): number {
        return this.startAngle;
    }

    public isRotating(): boolean {
        return this.rotating;
    }

}
