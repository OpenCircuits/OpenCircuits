import {Action} from "./Action";
import {Clock} from "../../models/ioobjects/inputs/Clock";

export class ClockFrequencyChangeAction implements Action {
    private clock: Clock;

    private initialFreq: number;
    private targetFreq: number;

    public constructor(clock: Clock, targetFreq: number) {
        this.clock = clock;

        this.initialFreq = clock.getFrequency();
        this.targetFreq = targetFreq;
    }

    public execute(): Action {
        this.clock.setFrequency(this.targetFreq);

        return this;
    }

    public undo(): Action {
        this.clock.setFrequency(this.initialFreq);

        return this;
    }

}
