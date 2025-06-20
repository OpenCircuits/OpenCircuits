import {Curve} from "math/Curve";

import {AddErrE} from "shared/api/circuit/utils/MultiError";
import {GUID}    from "shared/api/circuit/internal";

import {Wire}    from "../Wire";

import {BaseObjectImpl}             from "./BaseObject";
import {CircuitState, CircuitTypes} from "./CircuitState";


export abstract class WireImpl<T extends CircuitTypes> extends BaseObjectImpl<T> implements Wire {
    public readonly baseKind = "Wire";

    public constructor(state: CircuitState<T>, id: GUID, icId?: GUID) {
        super(state, id, icId);
    }

    protected getWire() {
        return this.getCircuitInfo()
            .getWireByID(this.id)
            .mapErr(AddErrE(`API Wire: Attempted to get wire with ID '${this.id}' that doesn't exist!`))
            .unwrap();
    }

    protected abstract getNodeKind(): string;

    // This method is necessary since how the nodes are configured is project-dependent, so wiring them
    //  needs to be handled on a per-project-basis
    protected abstract connectNode(node: T["Node"], p1: T["Port"], p2: T["Port"]):
        { wire1: T["Wire"] | undefined, wire2: T["Wire"] | undefined };

    public get shape(): Curve {
        if (this.icId)
            throw new Error(`WireImpl: Wire shape cannot be accessed inside an IC! Wire ID: '${this.id}', IC ID: '${this.icId}'`);
        return this.state.assembler.getWireShape(this.id).unwrap();
    }

    public get p1(): T["Port"] {
        return this.state.constructPort(this.getWire().p1, this.icId);
    }
    public get p2(): T["Port"] {
        return this.state.constructPort(this.getWire().p2, this.icId);
    }

    // TODO[model_refactor_api](leon): Maybe make some Path API object? Could be 'walkable'
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

    public split(): { node: T["Node"], wire1: T["Wire"], wire2: T["Wire"] } {
        if (this.icId)
            throw new Error(`WireImpl: Cannot split wire with ID '${this.id}' in IC ${this.icId}! IC objects are immutable!`);

        // TODO[model_refactor_api](kevin)
        //  Need to make an explicit CircuitInternal operation for splitting wires
        // Need to guarantee that wire1 is connected to the p1 of initial wire and wire2 for p2

        // Default to making the node in the middle of the wire
        const pos = this.shape.getPos(0.5);

        this.state.internal.beginTransaction();

        // Need to get these properties before deleting this wire
        const { p1, p2 } = this;

        // Create node
        const kind = this.getNodeKind();
        const info = this.state.internal.getComponentInfo(kind).unwrap();
        const nodeId = this.state.internal.placeComponent(kind, { x: pos.x, y: pos.y }).unwrap();
        this.state.internal.setPortConfig(nodeId, info!.defaultPortConfig).unwrap();
        const node = this.state.constructComponent(nodeId);
        if (!node.isNode())
            throw new Error(`Failed to construct node when splitting! Id: ${nodeId}`);

        this.state.internal.deleteWire(this.id).unwrap();

        const { wire1, wire2 } = this.connectNode(node, p1, p2);
        if (!wire1)
            throw new Error(`Failed to connect p1 to node! ${p1} -> ${node}`);
        if (!wire2)
            throw new Error(`Failed to connect p2 to node! ${p2} -> ${node}`);

        this.state.internal.commitTransaction();

        return { node, wire1, wire2 };
    }

    public delete(): void {
        if (this.icId)
            throw new Error(`WireImpl: Cannot delete wire with ID '${this.id}' in IC ${this.icId}! IC objects are immutable!`);

        this.state.internal.beginTransaction();
        const path = this.path;
        path.filter((o): o is T["Wire"] => o.baseKind === "Wire")
            .forEach((w) => this.state.internal.deleteWire(w.id).unwrap());
        path.filter((o): o is T["Node"] => o.baseKind === "Component")
            .forEach((n) => {
                this.state.internal.removePortsFor(n.id).unwrap();
                this.state.internal.deleteComponent(n.id).unwrap();
            });
        this.state.internal.commitTransaction();
    }
}
