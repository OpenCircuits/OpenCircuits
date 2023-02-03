import {AddErrE} from "core/utils/MultiError";

import {GetDebugInfo} from "core/internal/utils/Debug";
import {Schema}       from "core/schema";

import {Port} from "../Port";
import {Wire} from "../Wire";

import {BaseObjectImpl} from "./BaseObject";
import {PortImpl}       from "./Port";


export class WireImpl extends BaseObjectImpl implements Wire {
    public readonly baseKind = "Wire";

    protected getObj(): Schema.Wire {
        return this.circuit.getWireByID(this.id)
            .mapErr(AddErrE(`API Wire: Attempted to get wire with ID ${this.id} could not find it!`))
            .unwrap();
    }

    public get p1(): Port {
        return new PortImpl(this.state, this.getObj().p1);
    }
    public get p2(): Port {
        return new PortImpl(this.state, this.getObj().p2);
    }
}
