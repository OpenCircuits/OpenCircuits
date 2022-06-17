import {serialize} from "serialeazy";

import {Vector} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {DigitalComponent} from "digital/models/DigitalComponent";
import {Positioner} from "core/models/ports/positioners/Positioner";

import {InputPort, OutputPort} from "..";


export abstract class TimedComponent extends DigitalComponent {
    @serialize
    protected frequency: number;
    @serialize
    protected paused: boolean;

    private timeout?: number;

    public constructor(initialFreq: number, inputPortCount: ClampedValue, outputPortCount: ClampedValue, size: Vector,
                       inputPositioner?: Positioner<InputPort>, outputPositioner?: Positioner<OutputPort>) {
        super(inputPortCount, outputPortCount, size, inputPositioner, outputPositioner);

        this.frequency = initialFreq;
        this.paused = false;
    }

    private stopTimeout(): void {
        // Clear the timeout if it's currently set
        if (this.timeout !== undefined) {
            window.clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }

    protected abstract onTick(): void;

    public tick(): void {
        this.stopTimeout();

        if (this.paused)
            return;

        this.onTick();

        // Send an update to the designer
        if (this.designer !== undefined)
            this.designer.forceUpdate();

        // Recursively call `tick` to continuously update
        this.timeout = window.setTimeout(() => {
            this.timeout = undefined;
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
