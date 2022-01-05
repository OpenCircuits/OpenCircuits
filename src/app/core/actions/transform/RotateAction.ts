import {Vector} from "Vector";

import {Action} from "core/actions/Action";
import {Component} from "core/models/Component";


/**
 * Implementation of Action interface for rotating component(s)
 */
export class RotateAction implements Action {

    /**
     * an Array of the selected component(s)
     */
    private objects: Array<Component>;

    /**
     * the x, y coordinates of the midpoint between the selected component(s)
     */
    private midpoint: Vector;

    /**
     * an Array of the initial angles the selected component(s) are placed at
     */
    private initialAngles: Array<number>;

    /**
     * an Array of the final angles the selected component(s) will be placed at
     */
    private finalAngles: Array<number>;

    /**
     * Creates a rotation action for a component or a group of components
     *
     * @param objects Initializes the action with an Array of the selected component(s)
     * @param midpoint Inititalizes the action with the x, y coordinates of the midpoint between the selected component(s)
     * @param initialAngles Inititalizes the action an Array of the initial angles the selected component(s) are placed at
     * @param finalAngles Inititalizes the action an Array of the final angles the selected component(s) will be placed at
     */
    public constructor(objects: Array<Component>, midpoint: Vector, initialAngles: Array<number>, finalAngles: Array<number>) {
        this.objects = objects;
        this.midpoint = midpoint;
        this.initialAngles = initialAngles;
        this.finalAngles = finalAngles;
    }

    /**
     * Rotates a component or group of components.
     *
     * @param angles the final angle(s) the component(s) will be set as
     */
    private setAngles(angles: Array<number>): void {
        for (let i = 0; i < this.objects.length; i++) {
            const obj = this.objects[i];
            obj.setRotationAbout(angles[i], this.midpoint);
        }
    }

    /**
     * Rotates a component or group of components from the initial angle(s)
     * to the final angle(s).
     *
     * @returns an Action where the rotation is executed
     */
    public execute(): Action {
        this.setAngles(this.finalAngles);

        return this;
    }

    /**
     * Reverts the RotateAction object's angles to the original angles it was
     * set to, putting the components back in their initial orientation.
     *
     * @returns an Action where the rotation is undone
     */
    public undo(): Action {
        this.setAngles(this.initialAngles);

        return this;
    }

    public getName(): string {
        return "Rotate";
    }

}
