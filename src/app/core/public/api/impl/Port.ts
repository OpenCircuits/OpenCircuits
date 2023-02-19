import {AddErrE} from "core/utils/MultiError";

import {Schema} from "core/schema";

import {Component} from "../Component";
import {Port}      from "../Port";
import {Wire}      from "../Wire";

import {BaseObjectImpl} from "./BaseObject";
import {CircuitState}   from "./CircuitState";


export class PortImpl<
    ComponentT extends Component = Component,
    WireT extends Wire = Wire,
    PortT extends Port = Port,
    State extends CircuitState<ComponentT, WireT, PortT> = CircuitState<ComponentT, WireT, PortT>
> extends BaseObjectImpl<State> implements Port {
    public readonly baseKind = "Port";

    protected getObj(): Schema.Port {
        return this.internal.getPortByID(this.id)
            .mapErr(AddErrE(`API Port: Attempted to get port with ID ${this.id} could not find it!`))
            .unwrap();
    }

    public get parent(): ComponentT {
        return this.circuit.constructComponent(this.getObj().parent);
    }
    public get group(): string {
        return this.getObj().group;
    }
    public get index(): number {
        return this.getObj().index;
    }

    public canConnectTo(other: PortT): boolean {
        throw new Error("Unimplemented");
    }

    public connectTo(other: PortT): Wire | undefined {
        return this.circuit.connectWire(this, other);
    }
}
