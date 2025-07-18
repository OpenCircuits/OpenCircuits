import {GUID} from "shared/api/circuit/public";
import {FilterObj} from "shared/api/circuit/utils/Functions";
import {ObjContainerImpl} from "shared/api/circuit/public/impl/ObjContainer";

import {DigitalObjContainer} from "../DigitalCircuit";
import {ReadonlySimState}    from "../DigitalSim";

import {DigitalAPITypes, DigitalCircuitContext} from "./DigitalCircuitContext";


export class DigitalObjContainerImpl extends ObjContainerImpl<DigitalAPITypes> implements DigitalObjContainer {
    protected override readonly ctx: DigitalCircuitContext;

    public constructor(ctx: DigitalCircuitContext, objs: Set<GUID>, icId?: GUID) {
        super(ctx, objs, icId);

        this.ctx = ctx;
    }

    public get simState(): ReadonlySimState {
        const state = this.ctx.sim.getSimState().toSchema();
        return {
            signals:  FilterObj(state.signals,  ([id, _]) => (this.objs.has(id))),
            states:   FilterObj(state.states,   ([id, _]) => (this.objs.has(id))),
            icStates: FilterObj(state.icStates, ([id, _]) => (this.objs.has(id))),
        };
    }
}
