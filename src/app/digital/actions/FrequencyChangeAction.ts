import {Action} from "core/actions/Action";

import {Clock} from "digital/models/ioobjects/inputs/Clock";
import {Oscilloscope} from "digital/models/ioobjects/outputs/Oscilloscope";


export class FrequencyChangeAction implements Action {
    private component: Clock | Oscilloscope;

    private initialFreq: number;
    private targetFreq: number;

    public constructor(component: Clock | Oscilloscope, targetFreq: number) {
        this.component = component;

        this.initialFreq = component.getFrequency();
        this.targetFreq = targetFreq;
    }

    public execute(): Action {
        this.component.setFrequency(this.targetFreq);

        return this;
    }

    public undo(): Action {
        this.component.setFrequency(this.initialFreq);

        return this;
    }

}
