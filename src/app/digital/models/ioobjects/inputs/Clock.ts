import {V, Vector} from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {serializable, serialize} from "serialeazy";

import {DigitalComponent} from "digital/models/DigitalComponent";

/** This is clock objects. When you use this object, the input you get will be changed
    * between 1 and 0 constantly in certain amount of time.
    */

@serializable("Clock")
export class Clock extends DigitalComponent {
    
    /** This is how often the clock changes input
        */
    @serialize
    private frequency: number;

    /** This is current input of the clock, isOn is True or False
        */
    @serialize
    private isOn: boolean;

    /** This is constructor of clock. This will automatically set the beginning state to
        * false and begin to "tick", and the frequency to 1000ms.
        */
    
    public constructor() {
        super(new ClampedValue(0), new ClampedValue(1), V(60, 42));
        this.frequency = 1000;
        this.isOn = false;
        this.tick();
    }

    // Changing the clock
    public tick(): void {
        this.activate(!this.isOn);
        setTimeout(() => this.tick(), this.frequency);
    }

    /** Changing the clock's frequency
        */
    public setFrequency(freq: number): void {
        this.frequency = freq;
    }

    /** Activate changes state and image
        */
    public activate(bool: boolean): void {
        super.activate(bool);
        this.isOn = bool;
        if (this.designer !== undefined)
            this.designer.forceUpdate();
    }

    // @Override
    public getOffset(): Vector {
        return V();
    }

    /** @returns return current frequency of the clock
      */
    public getFrequency(): number {
        return this.frequency;
    }

    // @returns return the name of the clock
    public getDisplayName(): string {
        return "Clock";
    }
    
    // @returns return different image of the clock accroding to current input
    public getImageName(): string {
        return (this.isOn ? "clockOn.svg" : "clock.svg");
    }
}
