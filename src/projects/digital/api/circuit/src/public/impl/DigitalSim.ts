import {DigitalCircuitContext} from "./DigitalCircuitContext";
import {GUID} from "shared/api/circuit/public";
import {ObservableImpl} from "shared/api/circuit/utils/Observable";
import {DigitalSim, DigitalSimEv} from "../DigitalSim";


export class DigitalSimImpl extends ObservableImpl<DigitalSimEv> implements DigitalSim {
    protected readonly ctx: DigitalCircuitContext;

    public constructor(ctx: DigitalCircuitContext) {
        super();

        this.ctx = ctx;
        this.ctx.sim.subscribe((ev) => {
            if (ev.type === "step")
                this.publish({ type: "step" });
        });
    }

    public set propagationTime(val: number) {
        if (!this.ctx.simRunner)
            return;
        this.ctx.simRunner.propagationTime = val;
        this.publish({ type: "propagationTimeChanged", newTime: val });
    }
    public get propagationTime(): number {
        return this.ctx.simRunner?.propagationTime ?? -1;
    }

    public get isPaused(): boolean {
        return this.ctx.simRunner?.isPaused ?? false;
    }

    public get state() {
        return this.ctx.sim.getSimState().toSchema();
    }

    public resume() {
        if (!this.isPaused)
            return;
        this.ctx.simRunner?.resume();
        this.publish({ type: "resume" });
    }
    public pause() {
        if (this.isPaused)
            return;
        this.ctx.simRunner?.pause();
        this.publish({ type: "pause" });
    }

    public step() {
        this.ctx.sim.step();
    }

    public sync(comps: GUID[]) {
        comps
            .filter((c) => this.ctx.internal.hasComp(c))
            .forEach((id) => this.ctx.sim.resetQueueForComp(id));
    }
}
