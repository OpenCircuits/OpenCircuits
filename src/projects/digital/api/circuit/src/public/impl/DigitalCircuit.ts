import {CircuitImpl, IntegratedCircuitImpl} from "shared/api/circuit/public/impl/Circuit";

import {APIToDigital, DigitalCircuit, DigitalIntegratedCircuit} from "../DigitalCircuit";
import {DigitalCircuitState, DigitalTypes} from "./DigitalCircuitState";
import {Schema} from "../../schema";
import {DigitalComponent} from "../DigitalComponent";
import {DigitalPort} from "../DigitalPort";
import {DigitalWire} from "../DigitalWire";
import {GUID, ICInfo, IntegratedCircuit} from "shared/api/circuit/public";
import {ObjContainer} from "shared/api/circuit/public/ObjContainer";


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

    public override importICs(ics: Array<APIToDigital<IntegratedCircuit>>): void {
        super.importICs(ics);

        for (const ic of ics)
            this.state.sim.loadICState(ic.id, ic.toSchema().initialSimState);
    }

    public override createIC(info: APIToDigital<ICInfo>, id?: string): APIToDigital<IntegratedCircuit> {
        const ic = super.createIC(info, id);

        this.state.sim.loadICState(ic.id, info.circuit.toSchema().simState);

        return ic;
    }

    // TODO[model_refactor_api](leon) - revisit this
    public step() {
        this.state.sim.step();
    }

    public override loadSchema(
        schema: Schema.DigitalCircuit,
        opts?: { refreshIds?: boolean, loadMetadata?: boolean }
    ): Array<DigitalComponent | DigitalWire | DigitalPort> {
        // TODO[] - might need it like this
        // this.beginTransaction();

        // schema.ics
        //     .filter((ic) => !this.state.internal.hasIC(ic.metadata.id))
        //     .forEach((ic) => {
        //         this.state.internal.createIC(ic).unwrap();
        //         this.state.sim.loadICState(ic.metadata.id, ic.initialSimState);
        //     });

        // const objs = this.state.internal.importObjs(schema.objects, refreshIds).unwrap();
        // this.state.sim.loadState(schema.simState);

        // this.commitTransaction();

        // return objs.map((id) => this.getObj(id)!);

        for (const ic of schema.ics)
            this.state.sim.loadICState(ic.metadata.id, ic.initialSimState);

        const objs = super.loadSchema(schema, opts);

        // this.state.simRunner.propagationTime = schema.propagationTime
        this.state.sim.loadState(schema.simState);

        return objs;
    }

    public override toSchema(container?: ObjContainer): Schema.DigitalCircuit {
        return {
            // TODO[] - cleanup type cast maybe
            ...super.toSchema(container) as Schema.Core.Circuit & { ics: Schema.DigitalIntegratedCircuit[] },

            propagationTime: -1, // TODO[model_refactor_api],

            simState: this.state.sim.getSimState().toSchema(container),
        };
    }
}

export class DigitalIntegratedCircuitImpl extends IntegratedCircuitImpl<DigitalTypes>
                                          implements DigitalIntegratedCircuit {
    protected override readonly state: DigitalCircuitState;

    public constructor(state: DigitalCircuitState, id: GUID) {
        super(state, id);

        this.state = state;
    }

    public override toSchema(): Schema.DigitalIntegratedCircuit {
        return {
            ...super.toSchema(),

            initialSimState: this.state.sim.getInitialICSimState(this.id)!,
        }
    }
}
