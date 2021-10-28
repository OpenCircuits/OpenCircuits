import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {PressableComponent} from "../PressableComponent";
import {serializable} from "serialeazy";

@serializable("Switch")
export class Switch extends PressableComponent {

    /**
     * Initializes Switch with no input ports, a single output port, and predetermined sizes
     */
    public constructor() {
        super(new ClampedValue(0),
              new ClampedValue(1),
              V(62, 77),
              V(48, 60));
    }

    /**
     * Toggles Switch
     */
    public click(): void {
        this.activate(!this.on);
    }

    /**
     * Activates or deactivates Switch output
     * @param signal Boolean representing on or off
     */
    public activate(signal: boolean): void {
        super.activate(signal, 0);
    }

    /**
     * Returns name of Component
     * @returns "Switch"
     */
    public getDisplayName(): string {
        return "Switch";
    }

    /**
     * Returns name of image file with on state Switch
     * @returns "switchUp.svg"
     */
    public getOffImageName(): string {
        return "switchUp.svg";
    }

    /**
     * Returns name of image file with off state Switch
     * @returns "switchDown.svg"
     */
    public getOnImageName(): string {
        return "switchDown.svg";
    }
}
