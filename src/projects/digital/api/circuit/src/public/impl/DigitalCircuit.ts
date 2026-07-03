import {CircuitImpl} from "shared/api/circuit/public/impl/Circuit";
import {IntegratedCircuitImpl} from "shared/api/circuit/public/impl/IntegratedCircuit";

import {APIToDigital, DigitalCircuit, DigitalIntegratedCircuit, DigitalObjContainer, ReadonlyDigitalCircuit, ReadonlyDigitalObjContainer} from "../DigitalCircuit";
import {DigitalAPITypes, DigitalCircuitContext} from "./DigitalCircuitContext";
import {DigitalSchema} from "digital/api/circuit/schema";
import {GUID, ICInfo, uuid} from "shared/api/circuit/public";
import {DigitalSelectionsImpl} from "./DigitalSelections";
import {MapObjKeys} from "shared/api/circuit/utils/Functions";
import {DigitalSimImpl} from "./DigitalSim";


export class DigitalCircuitImpl extends CircuitImpl<DigitalAPITypes> implements DigitalCircuit {
    protected override readonly ctx: DigitalCircuitContext;

    public readonly sim: DigitalSimImpl;

    public constructor(id: GUID = uuid()) {
        const ctx = new DigitalCircuitContext(id);
        super(ctx, new DigitalSelectionsImpl(ctx));

        this.ctx = ctx;
        this.sim = new DigitalSimImpl(ctx);
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

export class DigitalIntegratedCircuitImpl extends IntegratedCircuitImpl<DigitalAPITypes>
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
