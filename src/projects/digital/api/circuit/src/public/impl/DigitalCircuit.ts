import {CircuitImpl, IntegratedCircuitImpl} from "shared/api/circuit/public/impl/Circuit";

import {APIToDigital, DigitalCircuit, DigitalIntegratedCircuit, DigitalObjContainer, DigitalSim, DigitalSimEv, ReadonlyDigitalCircuit, ReadonlyDigitalObjContainer} from "../DigitalCircuit";
import {DigitalCircuitContext, DigitalTypes} from "./DigitalCircuitContext";
import {DigitalSchema} from "digital/api/circuit/schema";
import {GUID, ICInfo, ReadonlyICPin, uuid} from "shared/api/circuit/public";
import {DigitalPort} from "../DigitalPort";
import {ErrE, OkVoid, Result} from "shared/api/circuit/utils/Result";
import {DigitalSelectionsImpl} from "./DigitalSelections";
import {MapObjKeys} from "shared/api/circuit/utils/Functions";
import {ObservableImpl} from "shared/api/circuit/utils/Observable";


class DigitalSimImpl extends ObservableImpl<DigitalSimEv> implements DigitalSim {
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


export class DigitalCircuitImpl extends CircuitImpl<DigitalTypes> implements DigitalCircuit {
    protected override readonly ctx: DigitalCircuitContext;

    public readonly sim: DigitalSimImpl;

    public constructor(id: GUID = uuid()) {
        const ctx = new DigitalCircuitContext(id);
        super(ctx, new DigitalSelectionsImpl(ctx));

        this.ctx = ctx;
        this.sim = new DigitalSimImpl(ctx);
    }

    public override checkIfPinIsValid(_pin: ReadonlyICPin, port: DigitalPort): Result {
        if (port.isOutputPort && port.parent.kind !== "InputPin")
            return ErrE(`DigitalCircuit.checkIfPinIsValid: Pin with output-port must be apart of an 'InputPin'! Found: '${port.parent.kind}' instead!`);
        if (port.isInputPort && port.parent.kind !== "OutputPin")
            return ErrE(`DigitalCircuit.checkIfPinIsValid: Pin with input-port must be apart of an 'OutputPin'! Found: '${port.parent.kind}' instead!`);
        return OkVoid();
    }

    public override importICs(ics: DigitalIntegratedCircuit[]): void {
        super.importICs(ics);

        for (const ic of ics)
            this.ctx.sim.loadICState(ic.id, ic.initialSimState);
    }

    public override createIC(info: APIToDigital<ICInfo>, id?: string): DigitalIntegratedCircuit {
        const ic = super.createIC(info, id);

        this.ctx.sim.loadICState(ic.id, info.circuit.sim.state);

        return ic;
    }

    public override import(
        circuit: ReadonlyDigitalCircuit | ReadonlyDigitalObjContainer,
        opts?: { refreshIds?: boolean, loadMetadata?: boolean }
    ): DigitalObjContainer {
        const isCircuit = (o: ReadonlyDigitalCircuit | ReadonlyDigitalObjContainer): o is ReadonlyDigitalCircuit => (o instanceof DigitalCircuitImpl);

        this.beginTransaction({ batch: true });

        for (const ic of (isCircuit(circuit) ? circuit.getICs() : circuit.ics))
            this.ctx.sim.loadICState(ic.id, ic.initialSimState);

        if (opts?.loadMetadata && isCircuit(circuit))
            this.sim.propagationTime = circuit.sim.propagationTime;

        const objIdsMap = super.doImport(circuit, opts);

        const newState = isCircuit(circuit) ? circuit.sim.state : circuit.simState;

        // If `refreshIds` was set to true, we need to map the states to the new IDs
        this.ctx.sim.loadState({
            signals:  MapObjKeys(newState.signals,  ([oldId]) => objIdsMap.get(oldId)!),
            states:   MapObjKeys(newState.states,   ([oldId]) => objIdsMap.get(oldId)!),
            icStates: MapObjKeys(newState.icStates, ([oldId]) => objIdsMap.get(oldId)!),
        });

        this.commitTransaction("Imported Circuit");

        return this.ctx.factory.constructObjContainer(new Set(objIdsMap.values()));
    }
}

export class DigitalIntegratedCircuitImpl extends IntegratedCircuitImpl<DigitalTypes>
                                          implements DigitalIntegratedCircuit {
    protected override readonly ctx: DigitalCircuitContext;

    public constructor(ctx: DigitalCircuitContext, id: GUID) {
        super(ctx, id);

        this.ctx = ctx;
    }

    public get initialSimState(): DigitalSchema.DigitalSimState {
        return this.ctx.sim.getInitialICSimState(this.id)!;
    }
}
