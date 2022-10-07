import {serializable} from "serialeazy";

import {V} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {PressableComponent} from "../PressableComponent";


@serializable("Switch")
export class Switch extends PressableComponent {

    /**
     * Initializes Switch with no input ports, a single output port, and predetermined sizes.
     */
    public constructor() {
        super(new ClampedValue(0),
              new ClampedValue(1),
              V(1.24, 1.54), V(0.96, 1.2));
    }

    /**
     * Toggles Switch.
     */
    public override click(): void {
        this.activate(!this.isOn());
    }

    /**
     * Utility function to check if this Switch is on or not.
     *
     * @returns True if the Switch is toggled, false otherwise.
     */
    public isOn(): boolean {
        return this.outputs.first.getIsOn();
    }

    /**
     * Returns name of Component.
     *
     * @returns The string "Switch".
     */
    public getDisplayName(): string {
        return "Switch";
    }

    public override getImageName(): string | undefined {
        return this.isOn() ? "switchDown.svg" : "switchUp.svg";
    }
}
