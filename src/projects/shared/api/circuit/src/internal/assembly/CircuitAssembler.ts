import {Vector} from "Vector";
import {Curve}  from "math/Curve";
import {Rect}   from "math/Rect";

import {None, Option, Some} from "shared/api/circuit/utils/Result";
import {ObservableImpl}     from "shared/api/circuit/utils/Observable";

import {GUID}              from "..";
import {CircuitInternal}   from "../impl/CircuitInternal";

import {Assembler, AssemblerParams, AssemblyReason}    from "./Assembler";
import {AssemblyCache, PortPos, ReadonlyAssemblyCache} from "./AssemblyCache";
import {Bounds}                                        from "./PrimBounds";
import {HitTest}                                       from "./PrimHitTests";
import {RenderOptions}                                 from "./RenderOptions";

import "shared/api/circuit/utils/Map";
import {IsDefined} from "../../utils/Reducers";


export type CircuitAssemblerEvent = {
    type: "onchange";
}

// /**
//  * Utility class to manage assets for the circuit view.
//  *
//  * Specifically used over a Map so that it can be observed so that when an
//  * asset is updated (i.e. set for the first time), dependencies of that
//  * assets can be notified and update accordingly.
//  */
// export class CircuitViewAssetManager<T> extends ObservableImpl<{ key: string, val: T }> {
//     private readonly assets: Map<string, T>;

//     public constructor() {
//         super();

//         this.assets = new Map();
//     }

//     public has(key: string): boolean {
//         return this.assets.has(key);
//     }
//     public get(key: string): T | undefined {
//         return this.assets.get(key);
//     }
//     public set(key: string, val: T) {
//         this.assets.set(key, val);
//         this.publish({ key, val });
//     }
// }


class DirtyMap<K> {
    private readonly map: Map<K, Set<AssemblyReason>>;

    public constructor() {
        this.map = new Map();
    }

    public add(id: K, reason: AssemblyReason): void {
        this.map.getOrInsert(id, () => new Set())
            .add(reason);
    }

    public has(id: K): boolean {
        return this.map.has(id);
    }

    public get(id: K): Set<AssemblyReason> | undefined {
        return this.map.get(id);
    }

    public delete(id: K): boolean {
        return this.map.delete(id);
    }

    public clear(): void {
        this.map.clear();
    }

    public isEmpty(): boolean {
        return this.map.size === 0;
    }

    public get length(): number {
        return this.map.size;
    }


    public *[Symbol.iterator]() {
        for (const item of this.map) {
            yield item;
        }
    }
}

export class CircuitAssembler extends ObservableImpl<CircuitAssemblerEvent> {
    private readonly circuit: CircuitInternal;
    private readonly options: RenderOptions;

    protected cache: AssemblyCache;

    private readonly dirtyComponents: DirtyMap<GUID>;
    private readonly dirtyWires: DirtyMap<GUID>;
    private readonly dirtyPorts: DirtyMap<GUID>;

    protected readonly assemblers: Record<string, Assembler>;

    public constructor(
        circuit: CircuitInternal,
        options: RenderOptions,
        assemblers: (params: AssemblerParams) => Record<string, Assembler>,
    ) {
        super();

        this.circuit = circuit;

        this.cache = {
            componentTransforms: new Map(),
            componentPrims:      new Map(),

            localPortPositions: new Map(),
            portPositions:      new Map(),
            portPrims:          new Map(),

            wireCurves: new Map(),
            wirePrims:  new Map(),
        };
        this.options = options;

        this.assemblers = assemblers({ circuit, cache: this.cache, options });

        this.dirtyComponents = new DirtyMap();
        this.dirtyWires = new DirtyMap();
        this.dirtyPorts = new DirtyMap();

        this.circuit.subscribe((ev) => {
            const diff = ev.diff;

            // Mark all added/removed component dirty
            for (const compID of diff.addedComponents)
                this.dirtyComponents.add(compID, AssemblyReason.Added);
            for (const compID of diff.removedComponents)
                this.dirtyComponents.add(compID, AssemblyReason.Removed);

            // Mark all components w/ changed ports dirty
            for (const compID of diff.portsChanged)
                this.dirtyComponents.add(compID, AssemblyReason.PortsChanged);

            // Mark all added/removed wires dirty
            for (const wireID of diff.addedWires)
                this.dirtyWires.add(wireID, AssemblyReason.Added);
            for (const wireID of diff.removedWires)
                this.dirtyWires.add(wireID, AssemblyReason.Removed);

            // Mark all changed obj props dirty
            for (const [id, props] of diff.propsChanged) {
                if (circuit.hasComp(id)) {
                    if (props.has("isSelected"))
                        this.dirtyComponents.add(id, AssemblyReason.SelectionChanged);

                    // Component transform changed, update connected wires
                    if (props.has("x") || props.has("y") || props.has("angle")) {
                        this.dirtyComponents.add(id, AssemblyReason.TransformChanged);

                        const ports = this.circuit.getPortsForComponent(id);
                        ports.map((ports) => ports.forEach((portID) => {
                            this.circuit.getWiresForPort(portID)
                                .map((wires) => wires.forEach((wireID) =>
                                    this.dirtyWires.add(wireID, AssemblyReason.TransformChanged)))
                        }))
                    } else {
                        this.dirtyComponents.add(id, AssemblyReason.PropChanged);
                    }
                } else if (circuit.hasWire(id)) {
                    if (props.has("isSelected"))
                        this.dirtyWires.add(id, AssemblyReason.SelectionChanged);
                    this.dirtyWires.add(id, AssemblyReason.PropChanged);
                } else if (circuit.hasPort(id)) {
                    if (props.has("isSelected"))
                        this.dirtyPorts.add(id, AssemblyReason.SelectionChanged);
                    this.dirtyPorts.add(id, AssemblyReason.PropChanged);
                }
            }

            this.publish({ type: "onchange" });
        });
    }

    public addAssembler(kind: string, getAssembler: (params: AssemblerParams) => Assembler) {
        this.assemblers[kind] = getAssembler({ circuit: this.circuit, cache: this.cache, options: this.options });
    }
    public removeAssembler(kind: string) {
        delete this.assemblers[kind];
    }

    public reassemble() {
        // Update components first
        for (const [compID, reasons] of this.dirtyComponents) {
            // If component doesn't exist, remove it and any associated ports
            if (!this.circuit.hasComp(compID)) {
                this.cache.componentPrims.delete(compID);
                this.cache.componentTransforms.delete(compID);
                this.cache.portPrims.delete(compID);
                continue;
            }
            // Otherwise, update it
            const comp = this.circuit.getCompByID(compID).unwrap();
            this.getAssemblerFor(comp.kind).assemble(comp, reasons);
        }
        this.dirtyComponents.clear();

        // TODO(leon) - does this work? I don't think it does
        //   i.e. I don't think dirtyPorts gets set properly when portAmt changes?
        // Remove any ports that were deleted
        for (const [portID, _reasons] of this.dirtyPorts) {
            if (!this.circuit.hasPort(portID)) {
                this.cache.portPositions.delete(portID);
                this.cache.localPortPositions.delete(portID);
            }
        }
        this.dirtyPorts.clear();

        // Then update wires
        for (const [wireID, reasons] of this.dirtyWires) {
            // If wire doesn't exist, remove it
            if (!this.circuit.hasWire(wireID)) {
                this.cache.wireCurves.delete(wireID);
                this.cache.wirePrims.delete(wireID);
                continue;
            }
            // Otherwise, update it
            const wire = this.circuit.getWireByID(wireID).unwrap();
            this.getAssemblerFor(wire.kind).assemble(wire, reasons);
        }
        this.dirtyWires.clear();
    }

    private reassembleComp(compID: GUID) {
        // Reassemble component if dirty
        if (this.dirtyComponents.has(compID)) {
            const comp = this.circuit.getCompByID(compID).unwrap();
            this.getAssemblerFor(comp.kind)
                .assemble(comp, this.dirtyComponents.get(compID)!);
            this.dirtyComponents.delete(compID);
        }
    }
    private reassembleWire(wireID: GUID) {
        if (this.dirtyWires.has(wireID)) {
            // Also may need to reassemble the ports, meaning we need to reassemble the parent components
            const wire = this.circuit.getWireByID(wireID).unwrap();
            const p1 = this.circuit.getPortByID(wire.p1).unwrap(),
                  p2 = this.circuit.getPortByID(wire.p2).unwrap();
            this.reassembleComp(p1.parent);
            this.reassembleComp(p2.parent);

            this.getAssemblerFor(wire.kind)
                .assemble(wire, this.dirtyWires.get(wireID)!);
            this.dirtyWires.delete(wireID);
        }
    }

    public getBoundsFor(objID: GUID): Option<Rect> {
        if (this.circuit.hasComp(objID)) {
            this.reassembleComp(objID);
            return Some(Rect.Bounding(this.cache.componentPrims.get(objID)?.map(Bounds).filter(IsDefined) ?? []));
        }
        if (this.circuit.hasWire(objID)) {
            this.reassembleWire(objID);
            return Some(Rect.Bounding(this.cache.wirePrims.get(objID)?.map(Bounds).filter(IsDefined) ?? []));
        }
        if (this.circuit.hasPort(objID)) {
            const port = this.circuit.getPortByID(objID).unwrap();
            this.reassembleComp(port.parent);
            return Some(Rect.Bounding(
                this.cache.portPrims.get(port.parent)?.get(objID)?.map(Bounds).filter(IsDefined) ?? []));
        }
        return None();
    }

    // TODO[model_refactor_api](leon): Think of a better way to allow access to Prim data and have it auto-update
    //                                 if it is currently dirty
    public getPortPos(portID: GUID): Option<PortPos> {
        if (!this.circuit.hasPort(portID))
            return None();

        const port = this.circuit.getPortByID(portID).unwrap();

        // Reassemble comp if it's dirty
        this.reassembleComp(port.parent);

        return Some(this.cache.portPositions.get(portID)!);
    }

    public getWireShape(wireID: GUID): Option<Curve> {
        if (!this.circuit.hasWire(wireID))
            return None();

        // Reassemble wire if it's dirty
        this.reassembleWire(wireID);

        return Some(this.cache.wireCurves.get(wireID)!);
    }

    public findNearestObj(pos: Vector, filter: (id: GUID) => boolean = ((_) => true)): Option<GUID> {
        // Must reassemble to refresh prims in caches
        this.reassemble();

        // TODO[model_refactor](leon): sort by zIndex
        for (const [id, prims] of this.cache.componentPrims) {
            // Skip components not in the filter
            if (filter(id) && prims.some((prim) => HitTest(prim, pos)))
                return Some(id);

            // Hit test component's ports
            for (const [portId, portPrims] of this.cache.portPrims.get(id) ?? []) {
                if (!filter(portId))
                    continue;
                if (portPrims.some((prim) => HitTest(prim, pos)))
                    return Some(portId);
            }
        }
        for (const [id, prims] of this.cache.wirePrims) {
            if (!filter(id)) // Skip things not in the filter
                continue;
            if (prims.some((prim) => HitTest(prim, pos)))
                return Some(id);
        }
        return None();
    }

    public getCache(): ReadonlyAssemblyCache {
        return this.cache;
    }

    protected getAssemblerFor(kind: string): Assembler {
        if (!(kind in this.assemblers))
            throw new Error(`CircuitAssembler: Failed to get assembler for kind ${kind}! Unmapped!`);
        return this.assemblers[kind];
    }
}
