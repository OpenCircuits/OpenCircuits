import {Action} from "core/actions/Action";

import {Component} from "core/models/Component";


/**
 * Implementation of Action interface for rotating components.
 */
class RotateAction implements Action {

    /**
     * The selected component.
     */
    private readonly obj: Component;

    /**
     * The initial angle of the selected component.
     */
    private readonly initialAngle: number;

    /**
     * The final angle the selected component.
     */
    private readonly finalAngle: number;

    /**
     * Creates a rotation action for a component.
     *
     * @param obj        Initializes the action with an Array of the selected component(s).
     * @param finalAngle Inititalizes the action an Array of the final angles the selected component(s)
     *             will be placed at.
     */
    public constructor(obj: Component, finalAngle: number) {
        this.obj = obj;
        this.initialAngle = obj.getAngle();
        this.finalAngle = finalAngle;

        this.execute();
    }

    /**
     * Rotates a component from the initial angle o the final angle.
     *
     * @returns An Action where the rotation is executed.
     */
    public execute(): Action {
        this.obj.setAngle(this.finalAngle);

        return this;
    }

    /**
     * Reverts the RotateAction object's angle to the original angle,
     *  putting the component back in its initial orientation.
     *
     * @returns An Action where the rotation is undone.
     */
    public undo(): Action {
        this.obj.setAngle(this.initialAngle);

        return this;
    }

    public getName(): string {
        return "Rotate";
    }

    public getCustomInfo(): string[] {
        const deg = String.fromCodePoint(176);
        const a0 = Math.round(this.initialAngle * 180 / Math.PI);
        const a1 = Math.round(this.finalAngle   * 180 / Math.PI);
        return [`${this.obj.getName()}: rotated from ${a0}${deg} to ${a1}${deg}`];
    }
}

export function Rotate(obj: Component, angle: number) {
    return new RotateAction(obj, angle);
}
