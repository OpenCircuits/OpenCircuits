import {DigitalSim} from "./DigitalSim";


export class DigitalSimRunner {
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
    }

    // By default, steps instantly
    protected queueStep(): void {
        if (this.paused)
            return;

        this.sim.step();
    }
}
