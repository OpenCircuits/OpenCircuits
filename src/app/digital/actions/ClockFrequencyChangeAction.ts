import {Action} from "core/actions/Action";
import {Clock} from "digital/models/ioobjects/inputs/Clock";

export class ClockFrequencyChangeAction implements Action {
    /**
     * The clock component of this Action
     */
    private clock: Clock;
    
    /**
     * The initial frequency of this Action
     */
    private initialFreq: number;
    
    /**
     * The target frequency of this Action
     */
    private targetFreq: number;
   
    /**
     * Initialize a ClockFrequencyChangeAction with the clock and 
     * target frequency given.
     * @param clock The clock that we need to change the frequency
     * @param targetFreq The frequency that we want the clock change to
     */
    public constructor(clock: Clock, targetFreq: number) {
        this.clock = clock;

        this.initialFreq = clock.getFrequency();
        this.targetFreq = targetFreq;
    }
    /**
     * Set the frequency of the clock to the target ferquency.
     * @returns This action
     */
    public execute(): Action {
        this.clock.setFrequency(this.targetFreq);

        return this;
    }
    /**
     * Undo the changing action, back the frequency of the clock to initialFreq
     * @returns This action
     */
    public undo(): Action {
        this.clock.setFrequency(this.initialFreq);

        return this;
    }

}
