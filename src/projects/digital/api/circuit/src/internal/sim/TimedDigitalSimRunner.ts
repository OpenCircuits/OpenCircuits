import {DigitalSim} from "./DigitalSim";
import {InstantSimRunner} from "./DigitalSimRunner";


export class TimedDigitalSimRunner extends InstantSimRunner {
    protected curTimeout?: number;

    public constructor(sim: DigitalSim, propagationTime: number) {
        super(sim);
        this.propagationTime = propagationTime;
    }

    protected override queueStep(): void {
        if (this.paused)
            return;

        // Already working on requests
        if (this.curTimeout)
            return;

        // Already waiting on a timeout
        this.curTimeout = window.setTimeout(() => {
            this.curTimeout = undefined;
            this.step();
        }, this.propagationTime);
    }
}
