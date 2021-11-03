import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {serializable, serialize} from "serialeazy";

import {DigitalComponent} from "digital/models/DigitalComponent";


@serializable("Oscilloscope")
export class Oscilloscope extends DigitalComponent {
    @serialize
    private numSamples: number;
    @serialize
    private frequency: number;
    @serialize
    private signals: boolean[];
    @serialize
    private paused: boolean;

    private timeout: number;

    public constructor() {
        super(new ClampedValue(1),
            new ClampedValue(0),
            V(400, 200));

        this.numSamples = 100;
        this.signals = [];
        this.frequency = 100;

        this.paused = false;

        this.tick();
    }

    private resetTimeout(): void {
        // Clear the timeout if it's currently set
        if (this.timeout !== null) {
            window.clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    public tick(): void {
        this.resetTimeout();

        // Add signal
        this.signals.push(this.inputs.first.getIsOn());
        if (this.signals.length > this.numSamples)
            this.signals.splice(0, 1);

        // Send an update to the designer
        if (this.designer !== undefined)
            this.designer.forceUpdate();

        // Call tick again after `frequency` time
        this.timeout = window.setTimeout(() => {
            this.timeout = null;
            this.tick();
        }, this.frequency);
    }

    public setNumSamples(num: number): void {
        this.numSamples = num;
        if (this.numSamples < this.signals.length)
            this.signals.splice(0, (this.signals.length-this.numSamples));
    }

    public setFrequency(freq: number): void {
        this.frequency = freq;
    }

    public reset(): void {
        this.signals = [];
        if (!this.paused)
            this.tick();
    }

    public pause(): void {
        this.paused = true;
        this.resetTimeout();
    }

    public resume(): void {
        this.paused = false;
        this.tick();
    }

    public isPaused(): boolean {
        return this.paused;
    }

    public getFrequency(): number {
        return this.frequency;
    }

    public getNumSamples(): number {
        return this.numSamples;
    }

    public getSignals(): boolean[] {
        return this.signals.slice();
    }

    public getDisplayName(): string {
        return "Oscilloscope";
    }
}
