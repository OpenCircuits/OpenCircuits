import {Vector} from "Vector";

import {Action} from "core/actions/Action";
import {Component} from "core/models/Component";

/*
 * Implementation of Action interface for rotating components
 */
export class RotateAction implements Action {
    private objects: Array<Component>;

    private midpoint: Vector;

    private initialAngles: Array<number>;
    private finalAngles: Array<number>;

    /*
     * Creates a rotation for a group of components
     */
    public constructor(objects: Array<Component>, midpoint: Vector, initialAngles: Array<number>, finalAngles: Array<number>) {
        this.objects = objects;
        this.midpoint = midpoint;
        this.initialAngles = initialAngles;
        this.finalAngles = finalAngles;
    }

    /*
     * Rotates a component or group of components.
     */
    private setAngles(angles: Array<number>): void {
        for (let i = 0; i < this.objects.length; i++) {
            const obj = this.objects[i];
            obj.setRotationAbout(angles[i], this.midpoint);
        }
    }

    /*
     * Rotates a component or group of components from the initial angle
     * to the final angle.
     */
    public execute(): Action {
        this.setAngles(this.finalAngles);

        return this;
    }

    /*
     * Reverts the RotateAction object's angles to the original
     * angles it was set to, putting the components back in their initial
     * orientation.
     */
    public undo(): Action {
        this.setAngles(this.initialAngles);

        return this;
    }

}
