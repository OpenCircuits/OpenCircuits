import {serializable, serialize} from "serialeazy";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {TimedComponent} from "../TimedComponent";


@serializable("Oscilloscope")
export class Oscilloscope extends TimedComponent {
    @serialize
    private numSamples: number;
    @serialize
    private signals: boolean[];

    public constructor() {
        super(100, new ClampedValue(1), new ClampedValue(0), V(400, 200));

        this.numSamples = 100;
        this.reset();
    }

    protected onTick(): void {
        // Add signal
        this.signals.push(this.inputs.first.getIsOn());
        if (this.signals.length > this.numSamples)
            this.signals.splice(0, (this.signals.length-this.numSamples));
    }

    public setNumSamples(num: number): void {
        this.numSamples = num;
    }

    public reset(): void {
        this.signals = [];
        super.reset();
    }

    public getNumSamples(): number {
        return this.numSamples;
    }

    public getSignals(): boolean[] {
        return this.signals.slice(0, this.numSamples);
    }

    public getDisplayName(): string {
        return "Oscilloscope";
    }
}
