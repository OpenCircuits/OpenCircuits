import {Vector} from "Vector";

import {Action} from "core/actions/Action";

import {Component} from "core/models/Component";


/**
 * Implementation of Action interface for rotating component(s).
 */
export class RotateAction implements Action {

    /**
     * An Array of the selected component(s).
     */
    private objects: Component[];

    /**
     * An Array of the x, y coordinates for each component of the selected component(s) to be rotated around.
     */
    private midpoints: Vector[];

    /**
     * An Array of the initial angles the selected component(s) are placed at.
     */
    private initialAngles: number[];

    /**
     * An Array of the final angles the selected component(s) will be placed at.
     */
    private finalAngles: number[];

    /**
     * Creates a rotation action for a component or a group of components.
     *
     * @param objects       Initializes the action with an Array of the selected component(s).
     * @param midpoints     Inititalizes the action with the x, y coordinates of the points to rotate
     *                the selected component(s) around.
     * @param initialAngles Inititalizes the action an Array of the initial angles the selected component(s)
     *                are placed at.
     * @param finalAngles   Inititalizes the action an Array of the final angles the selected component(s)
     *                will be placed at.
     */
    public constructor(objects: Component[], midpoints: Vector[], initialAngles: number[], finalAngles: number[]) {
        this.objects = objects;
        this.midpoints = midpoints;
        this.initialAngles = initialAngles;
        this.finalAngles = finalAngles;
    }

    /**
     * Rotates a component or group of components.
     *
     * @param angles The final angle(s) the component(s) will be set as.
     */
    private setAngles(angles: number[]): void {
        for (let i = 0; i < this.objects.length; i++) {
            const obj = this.objects[i];
            obj.setRotationAbout(angles[i], this.midpoints[i]);
        }
    }

    /**
     * Rotates a component or group of components from the initial angle(s)
     * to the final angle(s).
     *
     * @returns An Action where the rotation is executed.
     */
    public execute(): Action {
        this.setAngles(this.finalAngles);

        return this;
    }

    /**
     * Reverts the RotateAction object's angles to the original angles it was
     * set to, putting the components back in their initial orientation.
     *
     * @returns An Action where the rotation is undone.
     */
    public undo(): Action {
        this.setAngles(this.initialAngles);

        return this;
    }

    public getName(): string {
        return "Rotate";
    }

    public getCustomInfo(): string[] {
        const deg = String.fromCodePoint(176);
        return [...this.objects].map(
            (obj, i) =>
                `${obj.getName()}: rotated from ${Math.round(this.initialAngles[i] * (180 / Math.PI))}${deg}
                                            to ${Math.round(this.finalAngles[i] * (180 / Math.PI))}${deg}`
        );
    }
}
