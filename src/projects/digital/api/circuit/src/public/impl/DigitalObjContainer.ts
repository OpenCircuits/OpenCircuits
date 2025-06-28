import {GUID} from "shared/api/circuit/public";

import {DigitalCircuitState, DigitalTypes} from "./DigitalCircuitState";
import {ObjContainerImpl} from "shared/api/circuit/public/impl/ObjContainer";
import {DigitalObjContainer, ReadonlySimState} from "../DigitalCircuit";
import {FilterObj} from "shared/api/circuit/utils/Functions";


export class DigitalObjContainerImpl extends ObjContainerImpl<DigitalTypes> implements DigitalObjContainer {
    protected override readonly state: DigitalCircuitState;

    public constructor(state: DigitalCircuitState, objs: Set<GUID>, icId?: GUID) {
        super(state, objs, icId);

        this.state = state;
    }

    public get simState(): ReadonlySimState {
        const state = this.state.sim.getSimState().toSchema();
        return {
            signals:  FilterObj(state.signals,  ([id, _]) => (this.objs.has(id))),
            states:   FilterObj(state.states,   ([id, _]) => (this.objs.has(id))),
            icStates: FilterObj(state.icStates, ([id, _]) => (this.objs.has(id))),
        };
    }
}
