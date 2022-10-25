import {DigitalSim} from "digital/models/sim/DigitalSim";


export class PropagationController {
    private readonly sim: DigitalSim;
    private propagationDelay: number;

    private paused: boolean;

    private queued: boolean;
    private timeoutID: number | undefined;

    public constructor(propagationDelay: number, sim: DigitalSim) {
        this.propagationDelay = propagationDelay;
        this.sim = sim;

        this.paused = false;
        this.queued = false;

        this.sim.subscribe((ev) => {
            if (ev.type === "step")
                this.onStep(ev.queueEmpty);
            else if (ev.type === "queue")
                this.onQueue();
        });
    }

    private doStep(): void {
        this.queued = false;
        this.sim.step();
    }

    private propagate(): void {
        if (this.propagationDelay === 0)
            this.doStep();
        else if (this.propagationDelay > 0)
            this.timeoutID = window.setTimeout(() => this.doStep(), this.propagationDelay);
        // Else if delay < 0, then don't propagate at all
    }

    private onQueue(): void {
        if (this.paused)
            return;
        if (this.queued) // A queue event was already triggered
            return;

        this.queued = true;

        this.propagate();
    }

    private onStep(queueEmpty: boolean): void {
        if (queueEmpty) // No new propagations so we can stop here for now
            return;

        this.propagate();
    }

    public pause(): void {
        this.paused = true;
        if (this.timeoutID !== undefined) {
            window.clearTimeout(this.timeoutID);
            this.timeoutID = undefined;
        }
    }

    public setPropagationDelay(delay: number): void {
        this.propagationDelay = delay;
    }

}
