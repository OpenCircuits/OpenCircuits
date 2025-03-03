import {Vector} from "Vector";

import {Curve} from "math/Curve";

import {AddErrE} from "shared/api/circuit/utils/MultiError";
import {extend}  from "shared/api/circuit/utils/Functions";

import {GUID} from "shared/api/circuit/internal";

import {Circuit} from "../Circuit";
import {Wire}    from "../Wire";

import {BaseObjectImpl}             from "./BaseObject";
import {CircuitState, CircuitTypes} from "./CircuitState";
import {Schema} from "../../schema";


export function WireImpl<T extends CircuitTypes>(
    circuit: Circuit,
    state: CircuitState<T>,
    id: GUID,
    // This method is necessary since how the nodes are configured is project-dependent, so wiring them
    //  needs to be handled on a per-project-basis
    connectNode: (p1: T["Port"], p2: T["Port"], pos: Vector) =>
        { node: T["Node"], wire1: T["Wire"], wire2: T["Wire"] },
) {
    const { internal, assembler, constructPort } = state;

    function getWire() {
        return internal.getWireByID(id)
            .mapErr(AddErrE(`API Wire: Attempted to get wire with ID ${id} that doesn't exist!`))
            .unwrap();
    }

    const base = BaseObjectImpl(state, id);

    return extend(base, {
        baseKind: "Wire",

        get shape(): Curve {
            return assembler.getWireShape(id).unwrap();
        },

        get p1(): T["Port"] {
            return constructPort(getWire().p1);
        },
        get p2(): T["Port"] {
            return constructPort(getWire().p2);
        },

        // TODO[model_refactor_api](leon): Maybe make some Path API object? Could be 'walkable'
        get path(): T["Path"] {
            throw new Error("Wire.get path: Unimplemented!");
        },

        split(): { node: T["Node"], wire1: T["Wire"], wire2: T["Wire"] } {
            // TODO[model_refactor_api](kevin)
            //  Need to make an explicit CircuitInternal operation for splitting wires
            // Need to guarantee that wire1 is connected to the p1 of initial wire and wire2 for p2

            // Default to making the node in the middle of the wire
            const shape = assembler.getWireShape(base.id);
            const pos = shape.unwrap().getPos(0.5);

            internal.beginTransaction();

            // Need to get these properties before deleting this wire
            const { p1, p2 } = this;

            internal.deleteWire(base.id).unwrap();

            const nodeAndWires = connectNode(p1, p2, pos);

            internal.commitTransaction();

            return nodeAndWires;
        },

        delete(): void {
            throw new Error("Wire.delete: Unimplemented!");
        },

        toSchema(): Schema.Wire {
            return ({ ...getWire() });
        },
    } as const) satisfies Wire;
}
