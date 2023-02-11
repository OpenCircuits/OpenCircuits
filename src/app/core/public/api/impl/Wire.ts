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
        const obj = this.internal.getWireByID(this.id);
        if (!obj)
            throw new Error(`API Wire: Attempted to get wire with ID ${this.id} could not find it!`);
        return obj;
    }

    public get p1(): PortT {
        return this.circuit.constructPort(this.getObj().p1);
    }
    public get p2(): PortT {
        return this.circuit.constructPort(this.getObj().p2);
    }
}
