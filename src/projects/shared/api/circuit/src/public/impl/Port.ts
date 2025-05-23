import {Vector} from "Vector";

import {AddErrE} from "shared/api/circuit/utils/MultiError";
import {GUID}    from "shared/api/circuit/internal";
import {Schema}  from "shared/api/circuit/schema";

import {Port}    from "../Port";

import {BaseObjectImpl}             from "./BaseObject";
import {CircuitState, CircuitTypes} from "./CircuitState";


export abstract class PortImpl<T extends CircuitTypes> extends BaseObjectImpl<T> implements Port {
    public readonly baseKind = "Port";

    public constructor(state: CircuitState<T>, id: GUID) {
        super(state, id);
    }

    protected getPort() {
        return this.state.internal.getPortByID(this.id)
            .mapErr(AddErrE(`API Port: Attempted to get port with ID '${this.id}' that doesn't exist!`))
            .unwrap();
    }

    protected abstract getWireKind(p1: GUID, p2: GUID): number;

    public get parent(): T["Component"] {
        return this.state.constructComponent(this.getPort().parent);
    }
    public get group(): string {
        return this.getPort().group;
    }
    public get index(): number {
        return this.getPort().index;
    }

    public get originPos(): Vector {
        return this.state.assembler.getPortPos(this.id).unwrap().origin;
    }
    public get targetPos(): Vector {
        return this.state.assembler.getPortPos(this.id).unwrap().target;
    }
    public get dir(): Vector {
        return this.targetPos.sub(this.originPos).normalize();
    }

    public get connections(): T["Wire[]"] {
        return [...this.state.internal.getWiresForPort(this.id).unwrap()]
            .map((id) => this.state.constructWire(id));
    }
    public get connectedPorts(): T["Port[]"] {
        return this.connections.map((w) => ((w.p1.id === this.id) ? w.p2 : w.p1));
    }

    public get path(): T["Path"] {
        throw new Error("Port.get path: Unimplemented!");
    }

    public get isAvailable(): boolean {
        const p = this.getPort();
        const curConnections = [...this.state.internal.getPortsForPort(this.id).unwrap()]
            .map((id) => this.state.internal.getPortByID(id).unwrap());
        const [_, parentInfo] = this.state.internal.getComponentAndInfoById(p.parent).unwrap();

        return parentInfo.isPortAvailable(p, curConnections);
    }
    public canConnectTo(other: T["Port"]): boolean {
        const p1 = this.getPort();
        const [_c1, p1Info] = this.state.internal.getComponentAndInfoById(p1.parent).unwrap();
        const p1Connections = this.state.internal.getPortsForPort(p1.id)
            .map((ids) => [...ids].map((id) => this.state.internal.getPortByID(id).unwrap()))
            .unwrap();

        const p2 = this.state.internal.getPortByID(other.id).unwrap();
        const [_c2, p2Info] = this.state.internal.getComponentAndInfoById(p2.parent).unwrap();
        const p2Connections = this.state.internal.getPortsForPort(p2.id)
            .map((ids) => [...ids].map((id) => this.state.internal.getPortByID(id).unwrap()))
            .unwrap();

        return p1Info.checkPortConnectivity(p1, p2, p1Connections)
            .and(p2Info.checkPortConnectivity(p2, p1, p2Connections)).ok;
    }

    public connectTo(other: T["Port"]): T["Wire"] | undefined {
        this.state.internal.beginTransaction();

        const id = this.state.internal.connectWire(
            this.getWireKind(this.id, other.id), this.id, other.id, {}).unwrap();

        this.state.internal.commitTransaction();

        return this.state.constructWire(id);
    }

    public toSchema(): Schema.Port {
        const port = this.getPort();
        return ({ ...port, props: { ...port.props } });
    }
}
