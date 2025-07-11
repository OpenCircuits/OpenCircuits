import {Curve} from "math/Curve";

import {AddErrE} from "shared/api/circuit/utils/MultiError";
import {GUID}    from "shared/api/circuit/internal";

import {Wire}    from "../Wire";

import {BaseObjectImpl}             from "./BaseObject";
import {CircuitContext, CircuitTypes} from "./CircuitContext";


export class WireImpl<T extends CircuitTypes> extends BaseObjectImpl<T> implements Wire {
    public readonly baseKind = "Wire";

    public constructor(ctx: CircuitContext<T>, id: GUID, icId?: GUID) {
        super(ctx, id, icId);
    }

    protected getWire() {
        return this.getCircuitInfo()
            .getWireByID(this.id)
            .mapErr(AddErrE(`API Wire: Attempted to get wire with ID '${this.id}' that doesn't exist!`))
            .unwrap();
    }

    public set zIndex(val: number) {
        if (this.icId)
            throw new Error(`BaseObjImpl: Cannot set zIndex for object with ID '${this.id}' in IC ${this.icId}! IC objects are immutable!`);
        this.ctx.internal.setPropFor(this.id, "zIndex", val).unwrap();
    }
    public get zIndex(): number {
        return this.getWire().props["zIndex"] ?? 0;
    }

    public get shape(): Curve {
        if (this.icId)
            throw new Error(`WireImpl: Wire shape cannot be accessed inside an IC! Wire ID: '${this.id}', IC ID: '${this.icId}'`);
        return this.ctx.assembler.getWireShape(this.id).unwrap();
    }

    public get p1(): T["Port"] {
        return this.ctx.factory.constructPort(this.getWire().p1, this.icId);
    }
    public get p2(): T["Port"] {
        return this.ctx.factory.constructPort(this.getWire().p2, this.icId);
    }

    public get path(): T["Path"] {
        const path: T["Path"] = [];

        // Breadth First Search
        const queue: T["Path"] = new Array(this);
        const visited = new Set<string>();

        while (queue.length > 0) {
            const q = queue.shift()!;

            visited.add(q.id);
            path.push(q);
            if (q.baseKind === "Wire") {
                const p1 = q.p1.parent;
                if (p1.isNode() && !visited.has(p1.id))
                    queue.push(p1);

                const p2 = q.p2.parent;
                if (p2.isNode() && !visited.has(p2.id))
                    queue.push(p2);
            } else {
                // Push all of the Node's connecting wires, filtered by if they've been visited
                queue.push(...q.allPorts.flatMap((p) => p.connections).filter((w) => !visited.has(w.id)));
            }
        }

        return path;
    }

    public shift(): void {
        this.zIndex = this.ctx.assembler.highestWireZ + 1;
    }

    public split(): { node: T["Node"], wire1: T["Wire"], wire2: T["Wire"] } {
        if (this.icId)
            throw new Error(`WireImpl: Cannot split wire with ID '${this.id}' in IC ${this.icId}! IC objects are immutable!`);

        // Default to making the node in the middle of the wire
        const pos = this.shape.getPos(0.5);

        this.ctx.internal.beginTransaction();

        const wireInfo = this.ctx.internal.getWireInfo(this.kind).unwrap();

        // Find what type of Node and which ports to connect to (since it's project-dependent)
        const p1Port = this.getCircuitInfo().getPortByID(this.p1.id).unwrap();
        const p2Port = this.getCircuitInfo().getPortByID(this.p2.id).unwrap();
        const { nodeKind, p1Group, p1Idx, p2Group, p2Idx } = wireInfo.getSplitConnections(p1Port, p2Port, this.getWire()).unwrap();

        // Create node
        const info = this.ctx.internal.getComponentInfo(nodeKind).unwrap();        const nodeId = this.ctx.internal.placeComponent(nodeKind, { x: pos.x, y: pos.y }).unwrap();
        this.ctx.internal.setPortConfig(nodeId, info!.defaultPortConfig).unwrap();
        const node = this.ctx.factory.constructComponent(nodeId);
        if (!node.isNode())
            throw new Error(`Failed to construct node when splitting! Id: ${nodeId}`);

        // Need to get the ports before deleting this wire
        const { p1, p2 } = this;

        this.ctx.internal.deleteWire(this.id).unwrap();

        const nodeP1 = node.ports[p1Group][p1Idx], nodeP2 = node.ports[p2Group][p2Idx];

        // TODO: Would be nice to use `info` to guarantee that p1 can connect to nodeP1 (and with p2)
        // But this check is necessary since, in digital, order isn't guaranteed and this makes sure
        // input port connects to the output port.
        const wire1 = p1.canConnectTo(nodeP1) ? p1.connectTo(nodeP1) : p1.connectTo(nodeP2);
        const wire2 = p2.canConnectTo(nodeP2) ? p2.connectTo(nodeP2) : p2.connectTo(nodeP1);
        if (!wire1)
            throw new Error(`Failed to connect p1 to node! ${p1} -> ${node}`);
        if (!wire2)
            throw new Error(`Failed to connect p2 to node! ${p2} -> ${node}`);

        this.ctx.internal.commitTransaction();

        return { node, wire1, wire2 };
    }

    public delete(): void {
        if (this.icId)
            throw new Error(`WireImpl: Cannot delete wire with ID '${this.id}' in IC ${this.icId}! IC objects are immutable!`);

        this.ctx.internal.beginTransaction();
        const path = this.path;
        path.filter((o): o is T["Wire"] => o.baseKind === "Wire")
            .forEach((w) => this.ctx.internal.deleteWire(w.id).unwrap());
        path.filter((o): o is T["Node"] => o.baseKind === "Component")
            .forEach((n) => {
                this.ctx.internal.removePortsFor(n.id).unwrap();
                this.ctx.internal.deleteComponent(n.id).unwrap();
            });
        this.ctx.internal.commitTransaction();
    }
}
