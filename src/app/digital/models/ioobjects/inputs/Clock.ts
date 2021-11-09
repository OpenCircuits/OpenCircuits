import {serializable, serialize} from "serialeazy";

import {V, Vector} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {TimedComponent} from "../TimedComponent";


@serializable("Clock")
export class Clock extends TimedComponent {
    @serialize
    private isOn: boolean;

    public constructor() {
        super(1000, new ClampedValue(0), new ClampedValue(1), V(60, 42));
        this.reset();
    }

    protected onTick(): void {
        this.isOn = !this.isOn;
        super.activate(this.isOn);
    }

    // Reset to off and start ticking
    public reset(): void {
        this.isOn = false;
        super.reset();
    }

    // @Override
    public getOffset(): Vector {
        return V();
    }

    public getDisplayName(): string {
        return "Clock";
    }

    public getImageName(): string {
        return (this.isOn ? "clockOn.svg" : "clock.svg");
    }
}
