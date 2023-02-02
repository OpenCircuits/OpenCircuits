import {Schema} from "core/schema";

import {Port} from "../Port";
import {Wire} from "../Wire";

import {BaseObjectImpl} from "./BaseObject";


export class WireImpl extends BaseObjectImpl implements Wire {
    public readonly baseKind = "Wire";

    protected getObj(): Schema.Wire {
        const obj = this.internal.getWireByID(this.id);
        if (!obj)
            throw new Error(`API Wire: Attempted to get wire with ID ${this.id} could not find it!`);
        return obj;
    }

    public get p1(): Port {
        return this.circuit.constructPort(this.getObj().p1);
    }
    public get p2(): Port {
        return this.circuit.constructPort(this.getObj().p2);
    }
}
