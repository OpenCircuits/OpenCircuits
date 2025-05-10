import {Vector} from "Vector";
import {Rect}   from "math/Rect";
import {CalculateMidpoint} from "math/MathUtils";

import {GUID} from "../../internal";
import {ObjContainer} from "../ObjContainer";

import {CircuitState, CircuitTypes} from "./CircuitState";

import "shared/api/circuit/utils/Array";


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
        const compAndWirePts = [
            ...this.components.map((c) => c.pos),
            ...this.wires.map((w) => w.shape.getPos(0.5)),
        ];
        // If there aren't any components or wires, use port positions instead
        const pts = (compAndWirePts.length === 0
            ? [...this.ports.map((p) => p.targetPos)]
            : compAndWirePts);

        return CalculateMidpoint(pts);

        // TODO[master] -- Maybe one day revisit this option
        //  It used the bounding box of all the points to determine the center
        //  which had the benefit of not 'weighting' the average, and felt more like
        //  a visual center, i.e. if you had 100 objects overlapping and 1 object to
        //  the right, a straight average would have the midpoint really close to just
        //  the 100 overlapping objects, while a bounding box midpoint would have
        //  it in the center.
        //  The big problem with this is that the bounding box changes as you, i.e. rotate
        //  since rotating a rectangle can change where the min/max points are in a non-continuous way
        //  What we really need is the 'centroid' of the polygon created by all the points
        //  See https://gist.github.com/HarryStevens/37287b23b345f394f8276dc87a9c2bc6
        // return Rect.FromPoints(
        //     Vector.Min(...pts),
        //     Vector.Max(...pts),
        // ).center;
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

    public withWiresAndPorts(): T["ObjContainerT"] {
        const comps = this.components;
        const ports = [
            ...this.ports,
            ...comps.flatMap((comp) => comp.allPorts),
        ];

        const portIds = new Set(ports.map((p) => p.id));
        // Only get connections that are connected to components that are BOTH in this set.
        const wires = [
            ...this.wires,
            ...ports.flatMap((p) => p.connections),
        ].filter((w) => portIds.has(w.p1.id) && portIds.has(w.p2.id));

        return new ObjContainerImpl<T>(this.state, new Set<GUID>([...comps, ...wires, ...ports].map((o) => o.id)));
    }

    public shift(): void {
        this.state.internal.beginTransaction();
        // Need to keep the zIndices the same relative to eachother
        // We can do that by sorting the set by their current zIndex
        // and then set their new zIndex to be the new highest z + the relative index.
        const highestZ = this.state.assembler.highestZ;
        const cs = this.components.sort((a, b) => (a.zIndex - b.zIndex));
        cs.forEach((c, i) =>
            c.zIndex = highestZ + i + 1);
        this.state.internal.commitTransaction();
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
}
