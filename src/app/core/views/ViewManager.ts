import {Vector} from "Vector";

import {Rect}      from "math/Rect";
import {Transform} from "math/Transform";

import {GetDebugInfo} from "core/utils/Debug";
import {GUID}         from "core/utils/GUID";

import {AnyObj} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";

import {BaseView, RenderInfo, ViewCircuitInfo} from "./BaseView";


const LAYER_OFFSET = 100;


class DepthMap<T> {
    // TODO: MAKE THIS MORE EFFICIENT WITH BINARY SEARCH
    private readonly depths: Array<Set<T>>;

    public constructor() {
        this.depths = [];
    }

    // Allows this to be iterable.
    //  Iterates in order of depth.
    public *[Symbol.iterator]() {
        for (const vals of this.depths) {
            if (!vals)
                continue;
            for (const val of vals)
                yield val;
        }
    }

    public addEntry(t: T, depth: number) {
        if (!this.depths[depth])
            this.depths[depth] = new Set();
        this.depths[depth].add(t);
    }

    public editEntry(t: T, oldDepth: number, newDepth: number) {
        this.removeEntry(t, oldDepth);
        this.addEntry(t, newDepth);
    }

    public removeEntry(t: T, depth: number) {
        this.depths[depth].delete(t);
    }

    public getMinDepth() {
        // Return 1st non-empty depth entry
        for (let i = 0; i < this.depths.length; i++) {
            if (this.depths[i]?.size > 0)
                return i;
        }
        return 0;
    }
    public getMaxDepth() {
        // Return 1st non-empty depth entry in reverse order
        for (let i = this.depths.length-1; i >= 0; i--) {
            if (this.depths[i]?.size > 0)
                return i;
        }
        return 0;
    }
}

export type ViewFactory<
    Obj extends AnyObj,
    Info extends ViewCircuitInfo<CircuitController> = ViewCircuitInfo<CircuitController>,
> =
    (info: Info, o: Obj) => BaseView<Obj, Info>;

export type ViewRecord<
    Obj extends AnyObj,
    Info extends ViewCircuitInfo<CircuitController> = ViewCircuitInfo<CircuitController>,
> = {
    [O in Obj as O["kind"]]: ViewFactory<O, Info>;
}

export class ViewManager<
    Obj extends AnyObj,
    Info extends ViewCircuitInfo<CircuitController> = ViewCircuitInfo<CircuitController>,
> {
    protected readonly genView: ViewFactory<Obj, Info>;

    protected readonly info: Info;
    protected readonly circuit: Info["circuit"];

    protected views: Map<GUID, BaseView<Obj, Info>>;

    // Array of depth maps, sorted by layer.
    //  So depthMap[1] is depth map at layer = 1
    // Wires and Components/Port by default live on separate layers
    //  so that wires are always drawn undernearth Components/Ports.
    // The depth map itself is then a sorted map of each object ID by their zIndex.
    protected depthMap: Array<DepthMap<GUID>>;

    // It's assumed that this circuit has no objects yet
    public constructor(info: Info, genView: ViewFactory<Obj, Info>) {
        this.info = info;
        this.circuit = info.circuit;
        this.genView = genView;
        this.views = new Map();
        this.depthMap = [];
    }

    private addObj(m: Obj) {
        const view = this.genView(this.info, m);

        // Register to view map
        this.views.set(m.id, view);

        // Register to depthMap
        const layer = view.getLayer() + LAYER_OFFSET; // Shift so we can have "negative" depths
        if (layer < 0)
            throw new Error(`ViewManager: Received layer of ${layer} from view for ${GetDebugInfo(m)}!`);
        // Add layer if it doesn't exist
        if (!(layer in this.depthMap))
            this.depthMap[layer] = new DepthMap();
        // Add this obj to the layer
        this.depthMap[layer].addEntry(m.id, m.zIndex);
    }

    public reset(c?: ReturnType<Info["circuit"]["getRawModel"]>): void {
        this.views.clear();
        this.depthMap = [];

        if (c)
            Object.values(c.objects).forEach((o: Obj) => this.addObj(o));
    }

    public onAddObj(m: Obj) {
        this.addObj(m);

        // If added a port, let sibling ports know to update
        if (m.baseKind === "Port") {
            const siblings = this.circuit.getSiblingPorts(m).filter((p) => this.views.has(p.id));
            siblings.forEach((p) => this.onEditObj(p as Obj, "portConfig", ""));
        }
    }

    public onEditObj(m: Obj, key: string, val: string | number | boolean) {
        // Update the view for the object
        const v = this.getView(m.id);
        v.onPropChange(key);

        if (key === "zIndex")
            this.depthMap[v.getLayer() + LAYER_OFFSET].editEntry(m.id, m.zIndex, val as number);

        // Also, if the object is a component, update it's ports too
        if (m.baseKind === "Component") {
            this.circuit.getPortsFor(m).forEach((p) => this.onEditObj(p as Obj, key, val));
            return;
        }

        // And if the object is a port, then update it's wires
        if (m.baseKind === "Port") {
            this.circuit.getWiresFor(m).forEach((w) => this.onEditObj(w as Obj, key, val));
        }
    }

    public onRemoveObj(m: Obj) {
        const view = this.views.get(m.id);
        if (!view)
            throw new Error(`ViewManager: Failed to remove view for ${GetDebugInfo(m)}! No view found!`);
        // Remove from view map
        this.views.delete(m.id);

        // Remove from depthMap
        this.depthMap[view.getLayer() + LAYER_OFFSET].removeEntry(m.id, m.zIndex);

        // If remove a port, let sibling ports know to update
        if (m.baseKind === "Port") {
            const siblings = this.circuit.getPortsFor(this.circuit.getPortParent(m))
                .filter((p) => ((p !== m) && this.views.has(p.id)));
            siblings.forEach((p) => this.onEditObj(p as Obj, "portConfig", ""));
        }
    }

    public render(info: RenderInfo) {
        // Render by layer: lower layers rendered before higher ones since
        //  a higher layer indicates it should be on-top
        this.depthMap.forEach((layer) => {
            for (const id of layer) {
                const view = this.views.get(id);
                if (!view)
                    throw new Error(`ViewManager: Failed to find view for ${id} on layer ${layer}`);
                view.render(info);
            }
        });
    }

    public getView(id: GUID) {
        const view = this.views.get(id);
        if (!view)
            throw new Error(`ViewManager: Failed to get view for [${id}]! Not found!`);
        return view;
    }

    // Allow `this` to be iterable, and iterate through each view
    //  in order from top-bottom, so that the views on top are iterated before
    //  the views on the bottom.
    public *[Symbol.iterator]() {
        // Reverse order so that we loop through the top-most layers first
        for (let i = this.depthMap.length-1; i >= 0; i--) {
            const layer = this.depthMap[i];
            if (!layer)
                continue;
            const ids = [...layer].reverse();
            for (const id of ids)
                yield this.views.get(id)!;
            // // Reverse order so we loop through top-most views first
            // for (const [_, view] of [...layer.entries()].reverse())
            //     yield view;
        }
    }

    public findNearestObj(
        pos: Vector,
        filter = (_: Obj) => true,
    ): undefined | Obj {
        // Loop through each view
        for (const view of this) {
            if (!filter(view.getObj()))
                continue;
            if (view.contains(pos))
                return view.getObj();
        }
    }

    public findObjects(bounds: Transform): Obj[] {
        const objs: Obj[] = [];
        for (const view of this) {
            if (view.isWithinBounds(bounds))
                objs.push(this.circuit.getObj(view.getObj().id)! as Obj);
        }
        // // Reverse order so that we loop through the top-most layers first
        // for (let i = this.views.length-1; i >= 0; i--) {
        //     const layer = this.views[i];
        //     if (!layer)
        //         continue;
        //     // Reverse order so we loop through top-most views first
        //     for (const [id, view] of [...layer.entries()].reverse()) {
        //         if (view.isWithinBounds(bounds))
        //             objs.push(this.circuit.getObj(id)!);
        //     }
        // }
        return objs;
    }

    public calcBoundsOf(objs: Obj[]): Rect {
        return Rect.Bounding(
            // Get views from each obj
            objs.map((o) => this.getView(o.id))
            // Then get their bounds
            .map((v) => v.getBounds())
        );
    }

    public getTopDepth() {
        return this.depthMap.reduce((cur, d) => Math.max(cur, d.getMaxDepth()), 0);
    }
}
