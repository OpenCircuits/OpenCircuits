import {Schema} from "core/schema";

import {Component} from "../Component";
import {Port}      from "../Port";

import {BaseObjectImpl} from "./BaseObject";
import {ComponentImpl}  from "./Component";


export class PortImpl extends BaseObjectImpl implements Port {
    public readonly baseKind = "Port";

    protected getObj(): Schema.Port {
        const obj = this.circuit.getPortByID(this.id);
        if (!obj)
            throw new Error(`API Port: Attempted to get port with ID ${this.id} could not find it!`);
        return obj;
    }

    public get parent(): Component {
        return new ComponentImpl(this.circuit, this.getObj().parent);
    }
    public get group(): string {
        return this.getObj().group;
    }
    public get index(): number {
        return this.getObj().index;
    }
}
