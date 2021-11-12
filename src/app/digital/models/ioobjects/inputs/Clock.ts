import {serializable, serialize} from "serialeazy";

import {V, Vector} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {TimedComponent} from "../TimedComponent";

/** 
 * This is a clock tool which allows users to create an input which can change constanly bewteen 1 and 0 within a required frequency.
 */
@serializable("Clock")
export class Clock extends TimedComponent {
    /**
     * This is a private boolean properties inside clock class, which determines whether the clock is on or off.
     */
    @serialize
    private isOn: boolean;

    /**
     * Constructs a clock object intialed with 1000ms frequency, input of 1 and 2D display of size 60*42. Clock objects will start with 1
     * and change input to 0 or 1 every 1000ms. Moreover, the constructor will call reset() function once.
     */
    public constructor() {
        super(1000, new ClampedValue(0), new ClampedValue(1), V(60, 42));
        this.reset();
    }

    /**
     * This fucntion will set isOn to its opposite value, true to false or false to true, and create inputs changing to 1 or 0 constanly.
     */
    protected onTick(): void {
        this.isOn = !this.isOn;
        super.activate(this.isOn);
    }

    /**
     * This function will be called after constructing a clock object, which intially set the clock off and call for onTick() function to turn 
     * on the clock.
     */
    // Reset to off and start ticking
    public reset(): void {
        this.isOn = false;
        super.reset();
    }

    /**
     * Get size of offset needed.
     * @returns An empty vector.
     */
    // @Override
    public getOffset(): Vector {
        return V();
    }

    /**
     * Gets the display name of clock input.
     * @returns The display name of "Clock".
     */
    public getDisplayName(): string {
        return "Clock";
    }

    /**
     * Gets the name of the clock image file.
     * @returns The name of the clock image file.
     */
    public getImageName(): string {
        return (this.isOn ? "clockOn.svg" : "clock.svg");
    }
}
