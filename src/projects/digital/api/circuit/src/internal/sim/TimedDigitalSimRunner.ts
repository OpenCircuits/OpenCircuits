import {DigitalSim} from "./DigitalSim";
import {InstantSimRunner} from "./DigitalSimRunner";


export class TimedDigitalSimRunner extends InstantSimRunner {
    protected curTimeout?: number;

    protected propTime: number;

    public constructor(sim: DigitalSim, propagationTime: number) {
        super(sim);
        this.propTime = propagationTime;
    }

    public override set propagationTime(newTime: number) {
        this.propTime = newTime;

        if (this.curTimeout) {
            window.clearTimeout(this.curTimeout);
            this.queueStep();
        }
    }
    public override get propagationTime(): number {
        return this.propTime;
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
