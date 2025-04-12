import {Vector} from "Vector";
import {Rect}   from "math/Rect";

import {GUID} from "../../internal";
import {ObjContainer} from "../ObjContainer";

import {CircuitState, CircuitTypes} from "./CircuitState";

import "shared/api/circuit/utils/Array";
import {Schema} from "../../schema";


export class ObjContainerImpl<T extends CircuitTypes> implements ObjContainer {
    protected readonly state: CircuitState<T>;

    protected objs: Set<GUID>;

    protected componentIds?: Set<GUID>;
    protected wireIds?: Set<GUID>;
    protected portIds?: Set<GUID>;

    public constructor(state: CircuitState<T>, objs: Set<GUID>) {
        this.state = state;

        this.objs = objs;
    }

    public get bounds(): Rect {
        return Rect.Bounding(this.all.map((o) => o.bounds));
    }

    public get midpoint(): Vector {
        const pts = [
            ...this.components.map((c) => c.pos),
            ...this.wires.map((w) => w.shape.getPos(0.5)),
        ];
        return Rect.FromPoints(
            Vector.Min(...pts),
            Vector.Max(...pts),
        ).center;
    }

    public get length(): number {
        return this.objs.size;
    }
    public get isEmpty(): boolean {
        return (this.length === 0);
    }

    public get all(): T["Obj[]"] {
        return [...this.components, ...this.wires, ...this.ports];
    }
    public get components(): T["Component[]"] {
        if (!this.componentIds) {
            this.componentIds = new Set([...this.objs]
                .filter((id) => this.state.internal.hasComp(id)));
        }
        return [...this.componentIds]
            .map((id) => this.state.constructComponent(id));
    }
    public get wires(): T["Wire[]"] {
        if (!this.wireIds) {
            this.wireIds = new Set([...this.objs]
                .filter((id) => this.state.internal.hasWire(id)));
        }
        return [...this.wireIds]
            .map((id) => this.state.constructWire(id));
    }
    public get ports(): T["Port[]"] {
        if (!this.portIds) {
            this.portIds = new Set([...this.objs]
                .filter((id) => this.state.internal.hasPort(id)));
        }
        return [...this.portIds]
            .map((id) => this.state.constructPort(id));
    }
    public get ics(): T["IC[]"] {
        const componentKinds = new Set(this.components.map((c) => c.info.kind));
        return [...this.state.internal.getICs()]
            .filter((id) => componentKinds.has(id))
            .map((id) => this.state.constructIC(id));
    }

    public withWiresAndPorts(): ObjContainer {
        const comps = this.components;
        const ports = [
            ...this.ports,
            ...comps.flatMap((comp) => comp.allPorts),
        ];
        const wires = [
            ...this.wires,
            ...ports.flatMap((p) => p.connections),
        ];

        return new ObjContainerImpl<T>(this.state, new Set<GUID>([...comps, ...wires, ...ports].map((o) => o.id)));
    }

    public forEach(f: (obj: T["Obj"], i: number, arr: T["Obj[]"]) => void): void {
        return this.all.forEach(f);
    }
    public filter(f: (obj: T["Obj"], i: number, arr: T["Obj[]"]) => boolean): T["Obj[]"] {
        return this.all.filter(f);
    }
    public every(condition: (obj: T["Obj"], i: number, arr: T["Obj[]"]) => boolean): boolean {
        return this.all.every(condition);
    }

    public toSchema(): Schema.Circuit {
        return {
            metadata: this.state.internal.getMetadata(),
            camera:   {
                x:    0,
                y:    0,
                zoom: 0,
            },
            ics:     this.ics.map((ic) => ic.toSchema()),
            objects: [
                ...this.all.map((obj) => obj.toSchema()),
            ],
        }
    }
}
