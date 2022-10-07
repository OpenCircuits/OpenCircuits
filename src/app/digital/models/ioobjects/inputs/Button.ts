import {serializable} from "serialeazy";

import {V, Vector} from "Vector";

import {ClampedValue}   from "math/ClampedValue";
import {CircleContains} from "math/MathUtils";

import {PressableComponent} from "../PressableComponent";

/**
 * An input that acts as a button. While pressed down by the mouse button, it outputs a signal. When you
 * release the mouse button, the signal is no longer outputted. The red portion is the clickable
 * portion. Clicking anywhere else on the button (ie. the corners) will give you the settings for the
 * button.
 */
@serializable("Button")
export class Button extends PressableComponent {
    /**
     * Creates a button. The button has 0 inputs, 1 output, and a size of 50.
     */
    public constructor() {
        super(new ClampedValue(0),
              new ClampedValue(1),
              V(1, 1), V(1, 1));
    }

    /**
     * Determines whether or not a point is within
     *  this component's "pressable" bounds, in this case the inner red circle.
     *
     * @param v The point.
     * @returns   True if the point is within this component,
     *    false otherwise.
     */
    public override isWithinPressBounds(v: Vector): boolean {
        return CircleContains(this.getPos(), this.getSize().x/2, v);
    }

    /**
     * Utility function to check if this Button is on or not.
     *
     * @returns True if the Button is toggled, false otherwise.
     */
    public isOn(): boolean {
        return this.outputs.first.getIsOn();
    }

    /**
     * Activates the button (makes the output true) by calling activate.
     */
    public override press(): void {
        this.activate(true);
    }

    /**
     * Deactivates the button (makes the output false) by calling activate.
     */
    public override release(): void {
        this.activate(false);
    }

    /**
     * Returns the name of the object.
     *
     * @returns The string "Button".
     */
    public override getDisplayName(): string {
        return "Button";
    }

    public override getImageName(): string | undefined {
        return this.isOn() ? "buttonDown.svg" : "buttonUp.svg";
    }
}
