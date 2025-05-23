import {V, Vector} from "Vector";

import {AddErrE}                 from "shared/api/circuit/utils/MultiError";
import {FromConcatenatedEntries} from "shared/api/circuit/utils/Functions";
import {GUID}                    from "shared/api/circuit/internal";
import {Schema}                  from "shared/api/circuit/schema";

import {Component, PortConfig} from "../Component";

import {BaseObjectImpl}             from "./BaseObject";
import {CircuitState, CircuitTypes} from "./CircuitState";


export class ComponentImpl<T extends CircuitTypes> extends BaseObjectImpl<T> implements Component {
    public readonly baseKind = "Component";

    public constructor(state: CircuitState<T>, id: GUID) {
        super(state, id);
    }

    protected getComponent() {
        return this.state.internal.getCompByID(this.id)
            .mapErr(AddErrE(`API Component: Attempted to get component with ID '${this.id}' that doesn't exist!`))
            .unwrap();
    }

    public get info(): T["ComponentInfo"] {
        return this.state.constructComponentInfo(this.kind);
    }

    public override get kind(): string {
        const comp = this.getComponent();
        // API-wise, IC kinds are represented as the icId.
        if (comp.icId)
            return comp.icId;
        return this.state.kinds.asString(comp.kind);
    }

    public set x(val: number) {
        this.state.internal.setPropFor<Schema.Component, "x">(this.id, "x", val);
    }
    public get x(): number {
        return (this.getComponent().props.x ?? 0);
    }
    public set y(val: number) {
        this.state.internal.setPropFor(this.id, "y", val);
    }
    public get y(): number {
        return (this.getComponent().props.y ?? 0);
    }
    public set pos(val: Vector) {
        this.state.internal.beginTransaction();
        this.state.internal.setPropFor<Schema.Component, "x">(this.id, "x", val.x).unwrap();
        this.state.internal.setPropFor<Schema.Component, "y">(this.id, "y", val.y).unwrap();
        this.state.internal.commitTransaction();
    }
    public get pos(): Vector {
        const obj = this.getComponent();
        return V((obj.props.x ?? 0), (obj.props.y ?? 0));
    }
    public set angle(val: number) {
        this.state.internal.setPropFor<Schema.Component, "angle">(this.id, "angle", val);
    }
    public get angle(): number {
        return (this.getComponent().props.angle ?? 0);
    }

    public isNode(): this is T["Node"] {
        return this.state.internal.getComponentAndInfoById(this.id)
            .map(([_, info]) => info.isNode)
            .unwrap();
    }

    public get ports(): Record<string, T["Port[]"]> {
        return FromConcatenatedEntries(this.allPorts.map((p) => [p.group, p]));
    }
    public get allPorts(): T["Port[]"] {
        return [...this.state.internal.getPortsForComponent(this.id).unwrap()]
            .map((id) => this.state.constructPort(id));
    }

    // get connectedComponents(): T["Component[]"] {
    //     throw new Error("Component.connectedComponents: Unimplemented!");
    // },

    public shift(): void {
        this.zIndex = this.state.assembler.highestZ + 1;
    }

    public setPortConfig(cfg: PortConfig): boolean {
        // TODO[model_refactor](leon) revisit this and decide on a functionality
        const curConfig = this.state.internal.getPortConfig(this.id).unwrap();

        const config = {
            ...curConfig,
            ...cfg,
        };
        const [_, info] = this.state.internal.getComponentAndInfoById(this.id).unwrap();

        info.checkPortConfig(config).unwrap();

        this.state.internal.beginTransaction();
        this.state.internal.setPortConfig(this.id, config).unwrap();
        this.state.internal.commitTransaction();
        return true;
    }
    public firstAvailable(group: string): T["Port"] | undefined {
        const ports = this.state.internal.getPortsByGroup(this.id).unwrap();
        if (!(group in ports))
            return undefined;

        for (const portId of ports[group]) {
            const port = this.state.constructPort(portId);
            if (port.isAvailable)
                return port;
        }
        return undefined;
    }
    public delete(): void {
        this.state.internal.beginTransaction();
        this.state.internal.removePortsFor(this.id).unwrap();
        this.state.internal.deleteComponent(this.id).unwrap();
        this.state.internal.commitTransaction();
    }

    public toSchema(): Schema.Component {
        const comp = this.getComponent();
        return ({ ...comp, props: { ...comp.props } });
    }
}
