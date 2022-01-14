import {Action} from "core/actions/Action";

import {TimedComponent} from "digital/models/ioobjects/TimedComponent";


export class FrequencyChangeAction implements Action {
    /**
     * The time component of the action
     */
    private component: TimedComponent;

    /**
     * The initial frequency of this Action
     */
    private initialFreq: number;
     /**
     * The target frequency of this Action
     */
    private targetFreq: number;

    /**
     * Initialize a FrequencyChangeAction with the component and 
     * target frequency given.
     * 
     * @param component The component that we need to change the frequency
     * @param targetFreq The frequency that we want the clock change to
     */
    public constructor(component: TimedComponent, targetFreq: number) {
        this.component = component;

        
        this.initialFreq = component.getFrequency();
        this.targetFreq = targetFreq;
    }

    /**
     * Set the frequency of the component to the target ferquency.
     * 
     * @returns This action
     */
    public execute(): Action {
        this.component.setFrequency(this.targetFreq);

        return this;
    }

    /**
     * Undo the changing action, back the frequency of the clock to initialFreq
     * 
     * @returns This action
     */
    public undo(): Action {
        this.component.setFrequency(this.initialFreq);

        return this;
    }

    public getName(): string {
        return "Frequency Change"
    }

}
