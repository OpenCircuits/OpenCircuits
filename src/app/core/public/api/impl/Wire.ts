import {AddErrE} from "core/utils/MultiError";

import {Schema} from "core/schema";

import {Component} from "../Component";
import {Port}      from "../Port";
import {Wire}      from "../Wire";

import {BaseObjectImpl} from "./BaseObject";
import {CircuitState}   from "./CircuitState";


export class WireImpl<
    ComponentT extends Component = Component,
    WireT extends Wire = Wire,
    PortT extends Port = Port,
    State extends CircuitState<ComponentT, WireT, PortT> = CircuitState<ComponentT, WireT, PortT>
> extends BaseObjectImpl<State> implements Wire {
    public readonly baseKind = "Wire";

    protected getObj(): Schema.Wire {
        return this.internal.getWireByID(this.id)
            .mapErr(AddErrE(`API Wire: Attempted to get wire with ID ${this.id} could not find it!`))
            .unwrap();
    }

    public get p1(): PortT {
        return this.circuit.constructPort(this.getObj().p1);
    }
    public get p2(): PortT {
        return this.circuit.constructPort(this.getObj().p2);
    }
}
