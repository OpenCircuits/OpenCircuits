import {serializable} from "serialeazy";

import {V, Vector} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {TimedComponent} from "../TimedComponent";


/**
 * This is a clock tool which allows users to create an input which can change constanly bewteen 1 and 0
 * within a required frequency.
 */
@serializable("Clock")
export class Clock extends TimedComponent {

    /**
     * Constructs a clock object intialed with 1000ms frequency, input of 1 and 2D display of size 60*42.
     * Clock objects will start with 1 and change input to 0 or 1 every 1000ms.
     * Moreover, the constructor will call reset() function once.
     */
    public constructor() {
        super(
            1000, new ClampedValue(0), new ClampedValue(1),
            V(1.2, 0.84), undefined, undefined,
            { "isOn": false }
        );
        this.reset();
    }

    /**
     * This fucntion will set isOn to its opposite value, true to false or false to true,
     * and create inputs changing to 1 or 0 constanly.
     */
    protected onTick(): void {
        this.setProp("isOn", !(this.props["isOn"]));
        super.activate(this.getProp("isOn") as boolean);
    }

    /**
     * This function will be called after constructing a clock object,
     * which intially set the clock off and call for onTick() function to turn on the clock.
     */
    // Reset to off and start ticking
    public override reset(): void {
        this.setProp("isOn", false);
        super.reset();
    }

    /**
     * Get size of offset needed.
     *
     * @returns An empty vector.
     */
    public override getOffset(): Vector {
        return V();
    }

    /**
     * Gets the display name of clock input.
     *
     * @returns The display name of "Clock".
     */
    public getDisplayName(): string {
        return "Clock";
    }

    /**
     * Gets the name of the clock image file.
     *
     * @returns The name of the clock image file.
     */
    public override getImageName(): string {
        return (this.getProp("isOn") ? "clockOn.svg" : "clock.svg");
    }
}
