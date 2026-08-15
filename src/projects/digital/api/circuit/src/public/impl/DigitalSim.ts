import { GUID } from "shared/api/circuit/public";
import { ObservableImpl } from "shared/api/circuit/utils/Observable";

import { DigitalSim, DigitalSimEv } from "../DigitalSim";
import { Scheduler } from "../Scheduler";
import type { DigitalCircuitContext } from "./DigitalCircuitContext";

export class DigitalSimImpl extends ObservableImpl<DigitalSimEv> implements DigitalSim {
    protected readonly ctx: DigitalCircuitContext;

    protected propTime?: number;
    protected paused: boolean;
    public scheduler?: Scheduler;

    public constructor(ctx: DigitalCircuitContext) {
        super();

        this.ctx = ctx;
        this.paused = false;

        this.ctx.sim.subscribe((ev) => {
            if (ev.type === "queue") {
                this.queueStep();
            } else if (ev.type === "step") {
                this.publish({ type: "step" });
                if (!ev.queueEmpty) {
                    this.queueStep();
                }
            }
        });
    }

    protected queueStep(): void {
        if (this.paused || this.propTime === undefined) {
            return;
        }

        if (this.propTime === 0) {
            this.ctx.sim.step();
            return;
        }

        if (this.propTime > 0) {
            this.scheduler?.schedule(() => {
                this.ctx.sim.step();
            }, this.propTime);
        }
    }

    public set propagationTime(val: number | undefined) {
        this.propTime = val;

        this.scheduler?.cancel();
        this.queueStep();
        this.publish({ type: "propagationTimeChanged", newTime: val });
    }
    public get propagationTime(): number | undefined {
        return this.propTime;
    }

    public setScheduler(scheduler: Scheduler | undefined): void {
        this.scheduler?.cancel();
        this.scheduler = scheduler;
        this.queueStep();
    }

    public get isPaused(): boolean {
        return this.paused;
    }

    public get state() {
        return this.ctx.sim.getSimState().toSchema();
    }

    public resume(): void {
        if (!this.paused) {
            return;
        }
        this.paused = false;
        this.queueStep();
        this.publish({ type: "resume" });
    }
    public pause(): void {
        if (this.paused) {
            return;
        }
        this.paused = true;
        this.scheduler?.cancel();
        this.publish({ type: "pause" });
    }

    public step(): void {
        this.ctx.sim.step();
    }

    public sync(comps: GUID[]): void {
        comps.filter((c) => this.ctx.internal.hasComp(c)).forEach((id) => this.ctx.sim.resetQueueForComp(id));
    }
}
