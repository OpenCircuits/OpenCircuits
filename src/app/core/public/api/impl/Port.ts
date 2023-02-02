import {Schema} from "core/schema";

import {Component} from "../Component";
import {Port}      from "../Port";
import {Wire}      from "../Wire";

import {BaseObjectImpl} from "./BaseObject";
import {CircuitState}   from "./CircuitState";


export class PortImpl<State extends CircuitState = CircuitState> extends BaseObjectImpl<State> implements Port {
    public readonly baseKind = "Port";

    protected getObj(): Schema.Port {
        const obj = this.internal.getPortByID(this.id);
        if (!obj)
            throw new Error(`API Port: Attempted to get port with ID ${this.id} could not find it!`);
        return obj;
    }

    public get parent(): ReturnType<State["constructComponent"]> {
        return this.circuit.constructComponent(this.getObj().parent) as ReturnType<State["constructComponent"]>;
    }
    public get group(): string {
        return this.getObj().group;
    }
    public get index(): number {
        return this.getObj().index;
    }

    public canConnectTo(other: Port): boolean {
        throw new Error("Unimplemented");
    }

    public connectTo(other: Port): Wire | undefined {
        return this.circuit.connectWire(this, other);
    }
}
