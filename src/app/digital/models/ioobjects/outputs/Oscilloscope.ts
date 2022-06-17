import {serializable, serialize} from "serialeazy";

import {V, Vector} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {TimedComponent} from "../TimedComponent";
import {ConstantSpacePositioner} from "core/models/ports/positioners/ConstantSpacePositioner";
import {InputPort} from "digital/models";


@serializable("Oscilloscope")
export class Oscilloscope extends TimedComponent {
    @serialize
    private numSamples: number;
    @serialize
    private signals: boolean[][];
    @serialize
    private displaySize: Vector;

    public constructor() {
        super(100, new ClampedValue(1, 1, 8), new ClampedValue(0), V(400, 200),
              new ConstantSpacePositioner<InputPort>("left", 400));

        this.numSamples = 100;
        this.displaySize = V(400, 200);
        this.signals = [[]];

        this.reset();
    }

    protected onTick(): void {
        // Add signals
        for (let i = 0; i < this.numInputs(); i++) {
            this.signals[i].push(this.inputs.get(i).getIsOn());
            if (this.signals[i].length > this.numSamples)
                this.signals[i].splice(0, (this.signals[i].length-this.numSamples));
        }
    }

    // @Override
    public setInputPortCount(val: number): void {
        // Update size (first so that ports update positions properly)
        super.setSize(this.displaySize.scale(V(1, val)));

        super.setInputPortCount(val);

        while (val > this.signals.length)
            this.signals.push(this.signals[0].map(_ => false));
        while (val < this.signals.length)
            this.signals.pop();
    }

    public setNumSamples(num: number): void {
        this.numSamples = num;
    }

    public setDisplaySize(size: Vector): void {
        this.displaySize = size;

        super.setSize(this.displaySize.scale(V(1, this.numInputs())));

        // Update spacing amount for port-positioner
        (this.inputs.getPositioner() as ConstantSpacePositioner<InputPort>).spacing = size.y*2;

        this.inputs.updatePortPositions();
    }

    public reset(): void {
        for (let i = 0; i < this.signals.length; i++)
            this.signals[i] = [];
        super.reset();
    }

    public getNumSamples(): number {
        return this.numSamples;
    }

    public getSignals(): boolean[][] {
        return this.signals.slice();
    }

    public getDisplaySize(): Vector {
        return V(this.displaySize);
    }

    public getDisplayName(): string {
        return "Oscilloscope";
    }
}
