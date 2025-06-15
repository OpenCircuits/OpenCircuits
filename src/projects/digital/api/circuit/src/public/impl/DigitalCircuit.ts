import {CircuitImpl, IntegratedCircuitImpl} from "shared/api/circuit/public/impl/Circuit";

import {APIToDigital, DigitalCircuit, DigitalIntegratedCircuit, DigitalObjContainer, ReadonlyDigitalCircuit, ReadonlyDigitalObjContainer} from "../DigitalCircuit";
import {DigitalCircuitState, DigitalTypes} from "./DigitalCircuitState";
import {DigitalSchema} from "digital/api/circuit/schema";
import {GUID, ICInfo} from "shared/api/circuit/public";


export class DigitalCircuitImpl extends CircuitImpl<DigitalTypes> implements DigitalCircuit {
    protected override readonly state: DigitalCircuitState;

    public constructor(state: DigitalCircuitState) {
        super(state);

        this.state = state;
    }

    public set propagationTime(val: number) {
        // TODO[model_refactor_api] - put this somewhere else?
        if (!this.state.simRunner)
            return;
        this.state.simRunner.propagationTime = val;
    }
    public get propagationTime(): number {
        return this.state.simRunner?.propagationTime ?? -1;
    }

    public override importICs(ics: DigitalIntegratedCircuit[]): void {
        super.importICs(ics);

        for (const ic of ics)
            this.state.sim.loadICState(ic.id, ic.initialSimState);
    }

    public override createIC(info: APIToDigital<ICInfo>, id?: string): DigitalIntegratedCircuit {
        const ic = super.createIC(info, id);

        this.state.sim.loadICState(ic.id, info.circuit.simState);

        return ic;
    }

    public get simState(): DigitalSchema.DigitalSimState {
        return this.state.sim.getSimState().toSchema();
    }

    // TODO[model_refactor_api](leon) - revisit this
    public step() {
        this.state.sim.step();
    }

    public override import(
        circuit: ReadonlyDigitalCircuit | ReadonlyDigitalObjContainer,
        opts?: { refreshIds?: boolean, loadMetadata?: boolean }
    ): DigitalObjContainer {
        const isCircuit = (o: ReadonlyDigitalCircuit | ReadonlyDigitalObjContainer): o is ReadonlyDigitalCircuit => (o instanceof DigitalCircuitImpl);

        for (const ic of (isCircuit(circuit) ? circuit.getICs() : circuit.ics))
            this.state.sim.loadICState(ic.id, ic.initialSimState);

        if (opts?.loadMetadata && isCircuit(circuit))
            this.propagationTime = circuit.propagationTime;

        const objs = super.import(circuit, opts);

        // TODO[model_refactor_api] - load circuit state from set of objects too (and unit test this)
        if (isCircuit(circuit))
            this.state.sim.loadState(circuit.simState);

        return objs;
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
