import {Action} from "core/actions/Action";

import {Oscilloscope} from "digital/models/ioobjects/outputs/Oscilloscope";


export class OscilloscopeSamplesChangeAction implements Action {
    private oscilloscope: Oscilloscope;

    private initialSamples: number;
    private targetSamples: number;

    public constructor(oscilloscope: Oscilloscope, targetSamples: number) {
        this.oscilloscope = oscilloscope;

        this.initialSamples = oscilloscope.getNumSamples();
        this.targetSamples = targetSamples;
    }

    public execute(): Action {
        this.oscilloscope.setNumSamples(this.targetSamples);

        return this;
    }

    public undo(): Action {
        this.oscilloscope.setNumSamples(this.initialSamples);

        return this;
    }

    public getName(): string {
        return "Oscilloscope Sample Change"
    }

}
