import {Action} from "./Action";
import {Component} from "../../models/ioobjects/Component";
import {IOObject} from "../../models/ioobjects/IOObject";
import {Vector,V} from "../math/Vector";

export class RotateAction implements Action {
    private angle: number;
    private objects: Array<IOObject>;
    private midpoint: Vector;

    public constructor(objects: Array<IOObject>, midpoint: Vector) {
        this.angle = 0;
        this.objects = objects;
        this.midpoint = midpoint;
    }

    public updateAngle(angle: number): void {
        let dAngle = angle - this.angle;
        this.rotateObjects(dAngle);
        this.angle = angle;
    }

    private rotateObjects(angle: number): void {
        // Rotate each object by a 'delta' angle
        for (let i = 0; i < this.objects.length; i++) {
            let obj = this.objects[i];
            // Only rotate components
            if (obj instanceof Component)
                obj.getTransform().rotateAbout(angle, this.midpoint);
        }
    }

    public execute(): void {
        this.rotateObjects(this.angle);
    }

    public undo(): void {
        this.rotateObjects(-this.angle);
    }

    public getAngle(): number {
        return this.angle;
    }
}
