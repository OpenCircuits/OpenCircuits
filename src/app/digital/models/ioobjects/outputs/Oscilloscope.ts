import {serializable, serialize} from "serialeazy";

import {V, Vector} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {GenPropInfo} from "core/utils/PropInfoUtils";

import {Prop} from "core/models/PropInfo";

import {ConstantSpacePositioner} from "core/models/ports/positioners/ConstantSpacePositioner";

import {InputPort} from "digital/models";

import {TimedComponent} from "../TimedComponent";


const [Info, InitialProps] = GenPropInfo({
    infos: {
        "samples": {
            type:  "int",
            label: "Samples",

            initial: 100, min: 10, max: 400, step: 10,
        },
        "displaySize": {
            type:    "veci",
            label:   "Display Size",
            initial: V(8, 4),
            min:     V(2, 1),
            max:     V(20, 10),
            step:    V(1, 1),
        },
    },
});

@serializable("Oscilloscope")
export class Oscilloscope extends TimedComponent {
    @serialize
    private signals: boolean[][];

    public constructor() {
        super(100, new ClampedValue(1, 1, 8), new ClampedValue(0), V(8, 4),
              new ConstantSpacePositioner<InputPort>("left", 8), undefined,
              InitialProps);

        this.signals = [[]];

        this.reset();
    }

    protected onTick(): void {
        const numSamples = this.props["samples"] as number;
        // Add signals
        for (let i = 0; i < this.numInputs(); i++) {
            this.signals[i].push(this.inputs.get(i).getIsOn());
            if (this.signals[i].length > numSamples)
                this.signals[i].splice(0, (this.signals[i].length-numSamples));
        }
    }

    // @Override
    public override setInputPortCount(val: number): void {
        // Update size (first so that ports update positions properly)
        super.setSize((this.props["displaySize"] as Vector).scale(V(1, val)));

        super.setInputPortCount(val);

        while (val > this.signals.length)
            this.signals.push(this.signals[0].map((_) => false));
        while (val < this.signals.length)
            this.signals.pop();
    }

    public override setProp(key: string, val: Prop): void {
        super.setProp(key, val);

        if (key === "displaySize") {
            const size = val as Vector;

            super.setSize(size.scale(V(1, this.numInputs())));

            // Update spacing amount for port-positioner
            (this.inputs.getPositioner() as ConstantSpacePositioner<InputPort>).spacing = size.y*2;

            this.inputs.updatePortPositions();
        }
    }

    public override reset(): void {
        for (let i = 0; i < this.signals.length; i++)
            this.signals[i] = [];
        super.reset();
    }

    public override getPropInfo(key: string) {
        return Info[key] ?? super.getPropInfo(key);
    }

    public getSignals(): boolean[][] {
        return [...this.signals];
    }

    public getDisplayName(): string {
        return "Oscilloscope";
    }
}
