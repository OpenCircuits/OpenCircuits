import {Action} from "core/actions/Action";

import {TimedComponent} from "digital/models/ioobjects/TimedComponent";


export class FrequencyChangeAction implements Action {
    private component: TimedComponent;

    private initialFreq: number;
    private targetFreq: number;

    public constructor(component: TimedComponent, targetFreq: number) {
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
