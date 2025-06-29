import {CircuitImpl, IntegratedCircuitImpl} from "shared/api/circuit/public/impl/Circuit";

import {APIToDigital, DigitalCircuit, DigitalIntegratedCircuit, DigitalObjContainer, DigitalSim, ReadonlyDigitalCircuit, ReadonlyDigitalObjContainer} from "../DigitalCircuit";
import {DigitalCircuitState, DigitalTypes} from "./DigitalCircuitState";
import {DigitalSchema} from "digital/api/circuit/schema";
import {GUID, ICInfo, ReadonlyICPin} from "shared/api/circuit/public";
import {DigitalPort} from "../DigitalPort";
import {ErrE, OkVoid, Result} from "shared/api/circuit/utils/Result";
import {DigitalSelectionsImpl} from "./DigitalSelections";
import {MapObjKeys} from "shared/api/circuit/utils/Functions";
import {ObservableImpl} from "shared/api/circuit/utils/Observable";


class DigitalSimImpl extends ObservableImpl<{ type: "step" }> implements DigitalSim {
    protected readonly circuitState: DigitalCircuitState;

    public constructor(circuitState: DigitalCircuitState) {
        super();

        this.circuitState = circuitState;
        this.circuitState.sim.subscribe((ev) => {
            if (ev.type === "step")
                this.publish({ type: "step" });
        });
    }

    public set propagationTime(val: number) {
        if (!this.circuitState.simRunner)
            return;
        this.circuitState.simRunner.propagationTime = val;
    }
    public get propagationTime(): number {
        return this.circuitState.simRunner?.propagationTime ?? -1;
    }

    public get state() {
        return this.circuitState.sim.getSimState().toSchema();
    }

    public resume() {
        this.circuitState.simRunner?.resume();
    }
    public pause() {
        this.circuitState.simRunner?.pause();
    }

    public step() {
        this.circuitState.sim.step();
    }

    public sync(comps: GUID[]) {
        comps
            .filter((c) => this.circuitState.internal.hasComp(c))
            .forEach((id) => this.circuitState.sim.resetQueueForComp(id));
    }
}


export class DigitalCircuitImpl extends CircuitImpl<DigitalTypes> implements DigitalCircuit {
    protected override readonly state: DigitalCircuitState;

    public readonly sim: DigitalSimImpl;

    public constructor(state: DigitalCircuitState) {
        super(state, new DigitalSelectionsImpl(state));

        this.state = state;
        this.sim = new DigitalSimImpl(state);
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
            this.state.sim.loadICState(ic.id, ic.initialSimState);
    }

    public override createIC(info: APIToDigital<ICInfo>, id?: string): DigitalIntegratedCircuit {
        const ic = super.createIC(info, id);

        this.state.sim.loadICState(ic.id, info.circuit.sim.state);

        return ic;
    }

    public override import(
        circuit: ReadonlyDigitalCircuit | ReadonlyDigitalObjContainer,
        opts?: { refreshIds?: boolean, loadMetadata?: boolean }
    ): DigitalObjContainer {
        const isCircuit = (o: ReadonlyDigitalCircuit | ReadonlyDigitalObjContainer): o is ReadonlyDigitalCircuit => (o instanceof DigitalCircuitImpl);

        this.beginTransaction({ batch: true });

        for (const ic of (isCircuit(circuit) ? circuit.getICs() : circuit.ics))
            this.state.sim.loadICState(ic.id, ic.initialSimState);

        if (opts?.loadMetadata && isCircuit(circuit))
            this.sim.propagationTime = circuit.sim.propagationTime;

        const objIdsMap = super.doImport(circuit, opts);

        const newState = isCircuit(circuit) ? circuit.sim.state : circuit.simState;

        // If `refreshIds` was set to true, we need to map the states to the new IDs
        this.state.sim.loadState({
            signals:  MapObjKeys(newState.signals,  ([oldId]) => objIdsMap.get(oldId)!),
            states:   MapObjKeys(newState.states,   ([oldId]) => objIdsMap.get(oldId)!),
            icStates: MapObjKeys(newState.icStates, ([oldId]) => objIdsMap.get(oldId)!),
        });

        this.commitTransaction("Imported Circuit");

        return this.state.constructObjContainer(new Set(objIdsMap.values()));
    }
}

export class DigitalIntegratedCircuitImpl extends IntegratedCircuitImpl<DigitalTypes>
                                          implements DigitalIntegratedCircuit {
    protected override readonly state: DigitalCircuitState;

    public constructor(state: DigitalCircuitState, id: GUID) {
        super(state, id);

        this.state = state;
    }

    public get initialSimState(): DigitalSchema.DigitalSimState {
        return this.state.sim.getInitialICSimState(this.id)!;
    }
}
