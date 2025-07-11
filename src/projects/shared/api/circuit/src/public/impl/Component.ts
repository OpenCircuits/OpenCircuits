import {V, Vector} from "Vector";

import {AddErrE} from "shared/api/circuit/utils/MultiError";
import {MapObj}  from "shared/api/circuit/utils/Functions";
import {GUID}    from "shared/api/circuit/internal";
import {Schema}  from "shared/api/circuit/schema";

import {Component, Node, PortConfig} from "../Component";

import {BaseObjectImpl}             from "./BaseObject";
import {CircuitContext, CircuitTypes} from "./CircuitContext";
import {Wire} from "../Wire";


export class ComponentImpl<T extends CircuitTypes> extends BaseObjectImpl<T> implements Component, Node {
    public readonly baseKind = "Component";

    public constructor(ctx: CircuitContext<T>, id: GUID, icId?: GUID) {
        super(ctx, id, icId);
    }

    protected getComponent() {
        return this.getCircuitInfo()
            .getCompByID(this.id)
            .mapErr(AddErrE(`ComponentImpl: Attempted to get component with ID '${this.id}' that doesn't exist!`))
            .unwrap();
    }

    public get info(): T["ComponentInfo"] {
        return this.ctx.factory.constructComponentInfo(this.kind);
    }

    public override get kind(): string {
        const comp = this.getComponent();
        // API-wise, IC kinds are represented as the icId.
        if (comp.kind === "IC")
            return comp.icId!;
        return comp.kind;
    }

    public set x(val: number) {
        if (this.icId)
            throw new Error(`ComponentImpl: Cannot set 'x' for component with ID '${this.id}' in IC ${this.icId}! IC objects are immutable!`);
        this.ctx.internal.setPropFor<Schema.Component, "x">(this.id, "x", val);
    }
    public get x(): number {
        return (this.getComponent().props.x ?? 0);
    }
    public set y(val: number) {
        if (this.icId)
            throw new Error(`ComponentImpl: Cannot set 'y' for component with ID '${this.id}' in IC ${this.icId}! IC objects are immutable!`);
        this.ctx.internal.setPropFor(this.id, "y", val);
    }
    public get y(): number {
        return (this.getComponent().props.y ?? 0);
    }
    public set pos(val: Vector) {
        if (this.icId)
            throw new Error(`ComponentImpl: Cannot set position for component with ID '${this.id}' in IC ${this.icId}! IC objects are immutable!`);
        this.ctx.internal.beginTransaction();
        this.ctx.internal.setPropFor<Schema.Component, "x">(this.id, "x", val.x).unwrap();
        this.ctx.internal.setPropFor<Schema.Component, "y">(this.id, "y", val.y).unwrap();
        this.ctx.internal.commitTransaction();
    }
    public get pos(): Vector {
        const obj = this.getComponent();
        return V((obj.props.x ?? 0), (obj.props.y ?? 0));
    }
    public set angle(val: number) {
        if (this.icId)
            throw new Error(`ComponentImpl: Cannot set 'angle' for component with ID '${this.id}' in IC ${this.icId}! IC objects are immutable!`);
        this.ctx.internal.setPropFor<Schema.Component, "angle">(this.id, "angle", val);
    }
    public get angle(): number {
        return (this.getComponent().props.angle ?? 0);
    }
    public set zIndex(val: number) {
        if (this.icId)
            throw new Error(`BaseObjImpl: Cannot set zIndex for object with ID '${this.id}' in IC ${this.icId}! IC objects are immutable!`);
        this.ctx.internal.setPropFor(this.id, "zIndex", val).unwrap();
    }
    public get zIndex(): number {
        return this.getComponent().props["zIndex"] ?? 0;
    }

    public isNode(): this is T["Node"] {
        return this.getCircuitInfo()
            .getComponentAndInfoByID(this.id)
            .map(([_, info]) => info.isNode)
            .mapErr(AddErrE(`ComponentImpl: Attempted to get component with ID '${this.id}' that doesn't exist!`))
            .unwrap();
    }
    public isIC(): boolean {
        return this.ctx.internal.hasIC(this.kind);
    }

    public get ports(): Record<string, T["Port[]"]> {
        // Guarantees order of ports in each group to be by port.index in increasing order.
        return MapObj(
            this.getCircuitInfo().getPortConfig(this.id).unwrap(),
            ([group, _]) => [...this.getCircuitInfo().getPortsForGroup(this.id, group).unwrap()]
                .map((id) => this.ctx.factory.constructPort(id, this.icId))
                .sort((p1, p2) => (p1.index - p2.index)));
    }
    public get allPorts(): T["Port[]"] {
        return Object.values(this.ports).flat();
    }

    // get connectedComponents(): T["Component[]"] {
    //     throw new Error("Component.connectedComponents: Unimplemented!");
    // },

    public shift(): void {
        this.zIndex = this.ctx.assembler.highestZ + 1;
    }

    public setPortConfig(cfg: PortConfig): boolean {
        if (this.icId)
            throw new Error(`ComponentImpl: Cannot set port config for component with ID '${this.id}' in IC ${this.icId}! IC objects are immutable!`);

        const curConfig = this.ctx.internal.getPortConfig(this.id).unwrap();

        const config = {
            ...curConfig,
            ...cfg,
        };
        const [_, info] = this.ctx.internal.getComponentAndInfoById(this.id).unwrap();

        info.checkPortConfig(config).unwrap();

        this.ctx.internal.beginTransaction();
        this.ctx.internal.setPortConfig(this.id, config).unwrap();
        this.ctx.internal.commitTransaction();
        return true;
    }
    public firstAvailable(group: string): T["Port"] | undefined {
        const ports = this.getCircuitInfo().getPortsByGroup(this.id).unwrap();
        if (!(group in ports))
            return undefined;

        for (const portId of ports[group]) {
            const port = this.ctx.factory.constructPort(portId, this.icId);
            if (port.isAvailable)
                return port;
        }
        return undefined;
    }
    public replaceWith(newKind: string): void {
        if (this.icId)
            throw new Error(`ComponentImpl: Cannot replace component with ID '${this.id}' in IC ${this.icId}! IC objects are immutable!`);

        this.ctx.internal.beginTransaction();
        this.ctx.internal.replaceComponent(this.id, newKind).unwrap();
        this.ctx.internal.commitTransaction();
    }
    public delete(): void {
        if (this.icId)
            throw new Error(`ComponentImpl: Cannot delete component with ID '${this.id}' in IC ${this.icId}! IC objects are immutable!`);
        this.ctx.internal.beginTransaction();
        if (this.isNode() as boolean) {
            // Wire deletion will delete the whole path, including the node
            this.allPorts[0].connections[0].delete();
        }
        else {
            this.ctx.internal.removePortsFor(this.id).unwrap();
            this.ctx.internal.deleteComponent(this.id).unwrap();
        }
        this.ctx.internal.commitTransaction();
    }

    // Node methods
    public get path(): Array<T["Node"] | T["Wire"]> {
        // Nodes are guarantee to always have wires connecting them, so get path from a wire
        return this.allPorts[0].connections[0].path;
    }

    public snip(): Wire {
        if (this.icId)
            throw new Error(`ComponentImpl: Cannot snip component with ID '${this.id}' in IC ${this.icId}! IC objects are immutable!`);

        const wires = this.allPorts.flatMap((p) => p.connections);
        if (wires.length !== 2) {
            this.ctx.internal.cancelTransaction();
            throw new Error(`ComponentImpl.snip: Cannot snip a Node with not exactly 2 wires! Node: ${this.id}`);
        }

        this.ctx.internal.beginTransaction();
        // Get the other ports that the wires are connecting to that aren't this Node's ports.
        const [p1, p2] = wires.flatMap((w) => [w.p1, w.p2]).filter((p) => (p.parent.id !== this.id));
        wires.forEach((w) => this.ctx.internal.deleteWire(w.id));
        const wire = p1.connectTo(p2);
        if (!wire) {
            this.ctx.internal.cancelTransaction();
            throw new Error(`ComponentImpl.snip: Failed to snip node! Connections failed! Node: ${this.id}`);
        }
        this.ctx.internal.removePortsFor(this.id).unwrap();
        this.ctx.internal.deleteComponent(this.id).unwrap();
        this.ctx.internal.commitTransaction();


        return wire;
    }
}
