import {DigitalSim} from "./DigitalSim";


export interface DigitalSimRunner {
    resume(): void;
    pause(): void;
    step(): void;
}

export class InstantSimRunner implements DigitalSimRunner {
    protected readonly sim: DigitalSim;

    protected paused: boolean;

    public constructor(sim: DigitalSim) {
        this.sim = sim;

        this.paused = false;

        sim.subscribe((ev) => {
            if (ev.type === "queue") {
                this.queueStep();
            } else if (ev.type === "step") {
                if (ev.queueEmpty)
                    return;
                this.queueStep();
            }
        });

        this.queueStep();
    }

    // By default, steps instantly
    protected queueStep(): void {
        if (this.paused)
            return;

        this.sim.step();
    }

    public resume(): void {
        this.paused = false;
        this.queueStep();
    }
    public pause(): void {
        this.paused = true;
    }
    public step(): void {
        this.sim.step();
    }
}
