import {Vector} from "Vector";

import {Curve} from "math/Curve";

import {AddErrE} from "shared/api/circuit/utils/MultiError";
import {GUID}    from "shared/api/circuit/internal";
import {Schema}  from "shared/api/circuit/schema";

import {Wire}    from "../Wire";

import {BaseObjectImpl}             from "./BaseObject";
import {CircuitState, CircuitTypes} from "./CircuitState";


export abstract class WireImpl<T extends CircuitTypes> extends BaseObjectImpl<T> implements Wire {
    public readonly baseKind = "Wire";

    public constructor(state: CircuitState<T>, id: GUID) {
        super(state, id);
    }

    protected getWire() {
        return this.state.internal.getWireByID(this.id)
            .mapErr(AddErrE(`API Wire: Attempted to get wire with ID '${this.id}' that doesn't exist!`))
            .unwrap();
    }

    // This method is necessary since how the nodes are configured is project-dependent, so wiring them
    //  needs to be handled on a per-project-basis
    protected abstract connectNode(p1: T["Port"], p2: T["Port"], pos: Vector):
        { node: T["Node"], wire1: T["Wire"], wire2: T["Wire"] };

    public get shape(): Curve {
        return this.state.assembler.getWireShape(this.id).unwrap();
    }

    public get p1(): T["Port"] {
        return this.state.constructPort(this.getWire().p1);
    }
    public get p2(): T["Port"] {
        return this.state.constructPort(this.getWire().p2);
    }

    // TODO[model_refactor_api](leon): Maybe make some Path API object? Could be 'walkable'
    public get path(): T["Path"] {
        throw new Error("Wire.get path: Unimplemented!");
    }

    public split(): { node: T["Node"], wire1: T["Wire"], wire2: T["Wire"] } {
        // TODO[model_refactor_api](kevin)
        //  Need to make an explicit CircuitInternal operation for splitting wires
        // Need to guarantee that wire1 is connected to the p1 of initial wire and wire2 for p2

        // Default to making the node in the middle of the wire
        const pos = this.shape.getPos(0.5);

        this.state.internal.beginTransaction();

        // Need to get these properties before deleting this wire
        const { p1, p2 } = this;

        this.state.internal.deleteWire(this.id).unwrap();

        const nodeAndWires = this.connectNode(p1, p2, pos);

        this.state.internal.commitTransaction();

        return nodeAndWires;
    }

    public delete(): void {
        throw new Error("Wire.delete: Unimplemented!");
    }

    public toSchema(): Schema.Wire {
        return ({ ...this.getWire() });
    }
}
