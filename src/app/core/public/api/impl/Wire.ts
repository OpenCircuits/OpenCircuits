import {AddErrE} from "core/utils/MultiError";

import {Schema} from "core/schema";

import {Component} from "../Component";
import {Port}      from "../Port";
import {Wire}      from "../Wire";

import {BaseObjectImpl} from "./BaseObject";
import {CircuitState}   from "./CircuitState";
import {V}              from "Vector";


export abstract class WireImpl<
    ComponentT extends Component = Component,
    WireT extends Wire = Wire,
    PortT extends Port = Port,
    State extends CircuitState<ComponentT, WireT, PortT> = CircuitState<ComponentT, WireT, PortT>
> extends BaseObjectImpl<State> implements Wire {
    public readonly baseKind = "Wire";

    protected getObj(): Schema.Wire {
        return this.internal.doc.getWireByID(this.id)
            .mapErr(AddErrE(`API Wire: Attempted to get wire with ID ${this.id} could not find it!`))
            .unwrap();
    }

    // TODO[model_refactor_api](leon) - Potentially make a `WireInfo` object and move this there
    protected abstract get nodeKind(): string;

    // This method is necessary since how the nodes are configured is project-dependent, so wiring them
    //  needs to be handled on a per-project-basis.
    protected abstract connectNode(p1: PortT, p2: PortT, node: ComponentT): { wire1: WireT, wire2: WireT };

    public get p1(): PortT {
        return this.circuit.constructPort(this.getObj().p1);
    }
    public get p2(): PortT {
        return this.circuit.constructPort(this.getObj().p2);
    }

    public split(): { node: ComponentT, wire1: WireT, wire2: WireT } {
        // TODO[model_refactor_api](kevin)
        //  Need to make an explicit CircuitInternal operation for splitting wires

        // Default to making the node in the middle of the wire
        const shape = this.circuit.view?.wireCurves.get(this.id);
        const pos = (shape?.getPos(0.5) ?? V(0, 0));

        this.circuit.beginTransaction();

        const node = this.circuit.placeComponentAt(pos, this.nodeKind) as ComponentT;

        // Need to get these properties before deleting this wire
        const { p1, p2 } = this;

        this.internal.deleteWire(this.id).unwrap();

        const { wire1, wire2 } = this.connectNode(p1, p2, node);

        this.circuit.commitTransaction();

        return { node, wire1, wire2 };
    }
}
