
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

    public updateAngle(angle: number, shift: boolean): void {
        let component = this.objects[0];

        let dAngle = angle - this.angle;
        if (component instanceof Component)
            dAngle = angle - component.getAngle();

        this.rotateObjects(dAngle,shift);
        this.angle = angle;
    }

    private rotateObjects(angle: number, shift:boolean): void {
        // Rotate each object by a 'delta' angle
        for (let i = 0; i < this.objects.length; i++) {
            let obj = this.objects[i];
            // Only rotate components
            if (obj instanceof Component){
                let newAngle = obj.getAngle() + angle;
                if (shift)
                    newAngle = Math.floor(newAngle/(Math.PI/4))*Math.PI/4;
                obj.getTransform().setRotationAbout(newAngle, this.midpoint);
            }
        }
    }

    public execute(): void {
        this.rotateObjects(this.angle, false);
    }

    public undo(): void {
        this.rotateObjects(-this.angle,false);
    }

    public getAngle(): number {
        return this.angle;
    }
}
