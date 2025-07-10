import {Vector} from "Vector";

import {AddErrE} from "shared/api/circuit/utils/MultiError";
import {GUID}    from "shared/api/circuit/internal";

import {Port}    from "../Port";

import {BaseObjectImpl}             from "./BaseObject";
import {CircuitContext, CircuitTypes} from "./CircuitContext";


export abstract class PortImpl<T extends CircuitTypes> extends BaseObjectImpl<T> implements Port {
    public readonly baseKind = "Port";

    public constructor(ctx: CircuitContext<T>, id: GUID, icId?: GUID) {
        super(ctx, id, icId);
    }

    protected getPort() {
        return this.getCircuitInfo()
            .getPortByID(this.id)
            .mapErr(AddErrE(`PortImpl: Attempted to get port with ID '${this.id}' that doesn't exist!`))
            .unwrap();
    }

    protected abstract getWireKind(p1: GUID, p2: GUID): string;

    public get defaultName(): string | undefined {
        const port = this.getPort();
        const [_parent, info] = this.getCircuitInfo().getComponentAndInfoByID(port.parent).unwrap();
        return info.getDefaultPortName(port);
    }

    public get parent(): T["Component"] {
        return this.ctx.factory.constructComponent(this.getPort().parent, this.icId);
    }
    public get group(): string {
        return this.getPort().group;
    }
    public get index(): number {
        return this.getPort().index;
    }

    public get originPos(): Vector {
        if (this.icId)
            throw new Error(`PortImpl: Origin Pos cannot be accessed for ports inside an IC! Port ID: '${this.id}', IC ID: '${this.icId}'`);
        return this.ctx.assembler.getPortPos(this.id).unwrap().origin;
    }
    public get targetPos(): Vector {
        if (this.icId)
            throw new Error(`PortImpl: Target Pos cannot be accessed for ports inside an IC! Port ID: '${this.id}', IC ID: '${this.icId}'`);
        return this.ctx.assembler.getPortPos(this.id).unwrap().target;
    }
    public get dir(): Vector {
        if (this.icId)
            throw new Error(`PortImpl: Direction cannot be accessed for ports inside an IC! Port ID: '${this.id}', IC ID: '${this.icId}'`);
        return this.targetPos.sub(this.originPos).normalize();
    }

    public get connections(): T["Wire[]"] {
        return [...this.getCircuitInfo().getWiresForPort(this.id).unwrap()]
            .map((id) => this.ctx.factory.constructWire(id, this.icId));
    }
    public get connectedPorts(): T["Port[]"] {
        return this.connections.map((w) => ((w.p1.id === this.id) ? w.p2 : w.p1));
    }

    public get path(): T["Path"] {
        const wire = this.connections.at(0);
        if (!wire) {
            return [];
        }
        return wire.path;
    }

    public get isAvailable(): boolean {
        const p = this.getPort();
        const curConnections = [...this.getCircuitInfo().getPortsForPort(this.id).unwrap()]
            .map((id) => this.getCircuitInfo().getPortByID(id).unwrap());
        const [_, parentInfo] = this.getCircuitInfo().getComponentAndInfoByID(p.parent).unwrap();

        return parentInfo.isPortAvailable(p, curConnections);
    }
    public canConnectTo(other: T["ReadonlyPort"] | T["Port"]): boolean {
        const p1 = this.getPort();
        const [_c1, p1Info] = this.getCircuitInfo().getComponentAndInfoByID(p1.parent).unwrap();
        const p1Connections = this.getCircuitInfo().getPortsForPort(p1.id)
            .map((ids) => [...ids].map((id) => this.getCircuitInfo().getPortByID(id).unwrap()))
            .unwrap();

        const p2 = this.getCircuitInfo().getPortByID(other.id).unwrap();
        const [_c2, p2Info] = this.getCircuitInfo().getComponentAndInfoByID(p2.parent).unwrap();
        const p2Connections = this.getCircuitInfo().getPortsForPort(p2.id)
            .map((ids) => [...ids].map((id) => this.getCircuitInfo().getPortByID(id).unwrap()))
            .unwrap();

        return p1Info.checkPortConnectivity(p1, p2, p1Connections)
            .and(p2Info.checkPortConnectivity(p2, p1, p2Connections)).ok;
    }

    public connectTo(other: T["Port"]): T["Wire"] | undefined {
        if (this.icId)
            throw new Error(`PortImpl: Cannot create connections for port '${this.id}' in IC ${this.icId}! IC objects are immutable!`);

        this.ctx.internal.beginTransaction();

        const id = this.ctx.internal.connectWire(
            this.getWireKind(this.id, other.id), this.id, other.id, { zIndex: this.ctx.assembler.highestWireZ + 1 }).unwrap();

        this.ctx.internal.commitTransaction();

        return this.ctx.factory.constructWire(id);
    }
}
