import {Vector} from "Vector";

import {AddErrE} from "shared/api/circuit/utils/MultiError";
import {extend}  from "shared/api/circuit/utils/Functions";
import {GUID}    from "shared/api/circuit/internal";

import {Port}    from "../Port";
import {Circuit} from "../Circuit";

import {BaseObjectImpl}             from "./BaseObject";
import {CircuitState, CircuitTypes} from "./CircuitState";
import {Schema} from "../../schema";


export function PortImpl<T extends CircuitTypes>(
    circuit: Circuit,
    state: CircuitState<T>,
    id: GUID,
) {
    const { internal, assembler, constructComponent, constructWire } = state;

    function getPort() {
        return internal.getPortByID(id)
            .mapErr(AddErrE(`API Port: Attempted to get port with ID ${id} that doesn't exist!`))
            .unwrap();
    }

    const base = BaseObjectImpl(state, id);

    return extend(base, {
        baseKind: "Port",

        get parent(): T["Component"] {
            return constructComponent(getPort().parent);
        },
        get group(): string {
            return getPort().group;
        },
        get index(): number {
            return getPort().index;
        },

        get originPos(): Vector {
            return assembler.getPortPos(id).unwrap().origin;
        },
        get targetPos(): Vector {
            return assembler.getPortPos(id).unwrap().target;
        },
        get dir(): Vector {
            return this.targetPos.sub(this.originPos).normalize();
        },

        get connections(): T["Wire[]"] {
            return [...internal.getWiresForPort(base.id).unwrap()]
                .map((id) => constructWire(id));
        },
        get connectedPorts(): T["Port[]"] {
            return this.connections.map((w) => ((w.p1.id === base.id) ? w.p2 : w.p1));
        },

        get path(): T["Path"] {
            throw new Error("Port.get path: Unimplemented!");
        },

        toSchema(): Schema.Port {
            return ({ ...getPort() });
        },
    } as const) satisfies Omit<Port, "getLegalWires" | "connectTo">;
}
