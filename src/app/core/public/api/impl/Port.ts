import {AddErrE} from "core/utils/MultiError";

import {Schema} from "core/schema";

import {Component} from "../Component";
import {Port}      from "../Port";

import {BaseObjectImpl} from "./BaseObject";
import {ComponentImpl}  from "./Component";


export class PortImpl extends BaseObjectImpl implements Port {
    public readonly baseKind = "Port";

    protected getObj(): Schema.Port {
        return this.circuit.getPortByID(this.id)
            .mapErr(AddErrE(`API Port: Attempted to get port with ID ${this.id} could not find it!`))
            .unwrap();
    }

    public get parent(): Component {
        return new ComponentImpl(this.state, this.getObj().parent);
    }
    public get group(): string {
        return this.getObj().group;
    }
    public get index(): number {
        return this.getObj().index;
    }
}
