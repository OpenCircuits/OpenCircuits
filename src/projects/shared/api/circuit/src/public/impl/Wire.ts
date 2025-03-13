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

    protected abstract getNodeKind(): string;

    // This method is necessary since how the nodes are configured is project-dependent, so wiring them
    //  needs to be handled on a per-project-basis
    protected abstract connectNode(node: T["Node"], p1: T["Port"], p2: T["Port"]):
        { wire1: T["Wire"] | undefined, wire2: T["Wire"] | undefined };

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
        throw new Error("Wire.delete: Unimplemented!");
    }

    public toSchema(): Schema.Wire {
        return ({ ...this.getWire() });
    }
}
