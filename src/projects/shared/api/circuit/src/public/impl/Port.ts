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
    getWireKind: (p1: GUID, p2: GUID) => string,
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

        get isAvailable(): boolean {
            const p = getPort();
            const curConnections = [...internal.getPortsForPort(base.id).unwrap()]
                .map((id) => internal.getPortByID(id).unwrap());
            const parent = internal.getCompByID(p.parent).unwrap();

            return internal.getComponentInfo(parent.kind).unwrap()
                .isPortAvailable(p, curConnections);
        },
        canConnectTo(other: T["Port"]): boolean {
            const p1 = getPort();
            const p1Info = internal.getCompByID(p1.parent)
                .andThen((p) => internal.getComponentInfo(p.kind))
                .unwrap();
            const p1Connections = internal.getPortsForPort(p1.id)
                .map((ids) => [...ids].map((id) => internal.getPortByID(id).unwrap()))
                .unwrap();

            const p2 = internal.getPortByID(other.id).unwrap();
            const p2Info = internal.getCompByID(p2.parent)
                .andThen((p) => internal.getComponentInfo(p.kind)).unwrap();
            const p2Connections = internal.getPortsForPort(p2.id)
                .map((ids) => [...ids].map((id) => internal.getPortByID(id).unwrap()))
                .unwrap();

            return p1Info.checkPortConnectivity(p1, p2, p1Connections)
                .and(p2Info.checkPortConnectivity(p2, p1, p2Connections)).ok;
        },

        connectTo(other: T["Port"]): T["Wire"] | undefined {
            internal.beginTransaction();

            const id = internal.connectWire(getWireKind(base.id, other.id), base.id, other.id, {}).unwrap();

            internal.commitTransaction();

            return constructWire(id);
        },

        toSchema(): Schema.Port {
            return ({ ...getPort() });
        },
    } as const) satisfies Port;
}
