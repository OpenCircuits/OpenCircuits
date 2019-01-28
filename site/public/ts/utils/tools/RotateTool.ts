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

export class RotateTool extends Tool {
    private camera: Camera;

    private objects: Array<IOObject>;
    private midpoint: Vector;

    private rotating: boolean;
    private startAngle: number;
    private prevAngle: number;

    public constructor(camera: Camera) {
        super();

        this.camera = camera;

        this.rotating = false;
    }

    public startRotation(objs: Array<IOObject>, midpoint: Vector, mousePos: Vector): void {
        this.objects = objs;
        this.midpoint = midpoint;
        this.rotating = true;
        this.startAngle = mousePos.sub(midpoint).angle();
        this.prevAngle = this.startAngle;
    }

    public onMouseDrag(input: Input, button: number): boolean {
        if (!this.rotating)
            return false;
        if (button !== LEFT_MOUSE_BUTTON)
            return false;

        let worldMousePos = this.camera.getWorldPos(input.getMousePos());
        let origin = this.midpoint;

        // Rotate each object by a 'delta' angle
        let dAngle = worldMousePos.sub(origin).angle() - this.prevAngle;
        for (let i = 0; i < this.objects.length; i++) {
            let obj = this.objects[i];
            // Only rotate components
            if (obj instanceof Component)
                obj.getTransform().rotateAbout(dAngle, origin);
        }
        this.prevAngle += dAngle;

        return true;
    }

    public onMouseUp(input: Input, button: number): boolean {
        if (!this.rotating)
            return false;
        if (button !== LEFT_MOUSE_BUTTON)
            return false;

        this.rotating = false;

        return true;
    }

    public getMidpoint(): Vector {
        return this.midpoint;
    }

    public getLastAngle(): number {
        return this.prevAngle;
    }

    public getStartAngle(): number {
        return this.startAngle;
    }

    public isRotating(): boolean {
        return this.rotating;
    }

}
