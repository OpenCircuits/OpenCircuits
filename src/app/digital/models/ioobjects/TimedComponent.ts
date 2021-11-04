import {serialize} from "serialeazy";

import {Vector} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {DigitalComponent} from "digital/models/DigitalComponent";


export abstract class TimedComponent extends DigitalComponent {
    @serialize
    protected frequency: number;
    @serialize
    protected paused: boolean;

    private timeout: number;

    public constructor(initialFreq: number, inputPortCount: ClampedValue, outputPortCount: ClampedValue, size: Vector) {
        super(inputPortCount, outputPortCount, size);

        this.frequency = initialFreq;
        this.paused = false;
    }

    private stopTimeout(): void {
        // Clear the timeout if it's currently set
        if (this.timeout !== null) {
            window.clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    protected abstract onTick(): void;

    public tick(): void {
        this.stopTimeout();

        this.onTick();

        // Send an update to the designer
        if (this.designer !== undefined)
            this.designer.forceUpdate();

        // Recursively call `tick` to continuously update
        this.timeout = window.setTimeout(() => {
            this.timeout = null;
            this.tick();
        }, this.frequency);
    }

    public setFrequency(freq: number): void {
        this.frequency = freq;
    }

    public pause(): void {
        this.paused = true;
        this.stopTimeout();
    }

    public resume(): void {
        this.paused = false;
        this.tick();
    }

    public getFrequency(): number {
        return this.frequency;
    }

    public isPaused(): boolean {
        return this.paused;
    }

    // Restart ticking
    public reset(): void {
        if (!this.paused)
            this.tick();
    }
}
