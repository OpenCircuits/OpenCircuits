import {V, Vector} from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {serializable, serialize} from "serialeazy";

import {DigitalComponent} from "digital/models/DigitalComponent";

@serializable("Clock")
export class Clock extends DigitalComponent {
    @serialize
    private frequency: number;

    @serialize
    private isOn: boolean;

    private timeout: number;

    public constructor() {
        super(new ClampedValue(0), new ClampedValue(1), V(60, 42));
        this.frequency = 1000;
        this.isOn = false;
        this.tick();
    }

    // Changing the clock
    public tick(): void {
        if (this.timeout !== null) {
            window.clearTimeout(this.timeout);
            this.timeout = null;
        }

        this.activate(!this.isOn);

        this.timeout = window.setTimeout(() => {
            this.timeout = null;
            this.tick();
        }, this.frequency);
    }

    // Reset to off and start ticking
    public reset(): void {
        this.isOn = false;
        this.tick();
    }

    public setFrequency(freq: number): void {
        this.frequency = freq;
    }

    // Activate changes state and image
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

    public getFrequency(): number {
        return this.frequency;
    }

    public getDisplayName(): string {
        return "Clock";
    }

    public getImageName(): string {
        return (this.isOn ? "clockOn.svg" : "clock.svg");
    }
}
