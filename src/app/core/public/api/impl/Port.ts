import {Vector} from "Vector";

import {AddErrE} from "core/utils/MultiError";

import {Schema} from "core/schema";

import {Component} from "../Component";
import {Port}      from "../Port";
import {Wire}      from "../Wire";

import {BaseObjectImpl} from "./BaseObject";
import {CircuitState}   from "./CircuitState";


export abstract class PortImpl<
    ComponentT extends Component = Component,
    WireT extends Wire = Wire,
    PortT extends Port = Port,
    State extends CircuitState<ComponentT, WireT, PortT> = CircuitState<ComponentT, WireT, PortT>
> extends BaseObjectImpl<State> implements Port {
    public readonly baseKind = "Port";

    protected getObj(): Schema.Port {
        return this.internal.doc.getPortByID(this.id)
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

    public get originPos(): Vector {
        // TODO[model_refactor_api]: This probably needs to be calculated explicitly here ?
        return this.circuit.view!.portPositions.get(this.id)!.origin;
    }
    public get targetPos(): Vector {
        // TODO[model_refactor_api]: This probably needs to be calculated explicitly here ?
        return this.circuit.view!.portPositions.get(this.id)!.target;
    }
    public get dir(): Vector {
        return this.targetPos.sub(this.originPos).normalize();
    }

    public get connections(): WireT[] {
        return [...this.internal.doc.getWiresForPort(this.id).unwrap()]
            .map((id) => this.circuit.constructWire(id));
    }

    public get connectedPorts(): PortT[] {
        return this.connections.map((w) => ((w.p1.id === this.id) ? w.p2 : w.p1) as PortT);
    }

    public canConnectTo(other: PortT): boolean {
        throw new Error("Unimplemented");
    }

    public abstract getLegalWires(): Port.LegalWiresQuery;

    public connectTo(other: PortT): Wire | undefined {
        return this.circuit.connectWire(this, other);
    }
}
