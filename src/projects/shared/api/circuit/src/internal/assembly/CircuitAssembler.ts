import {Vector} from "Vector";

import {None, Option, Some} from "shared/api/circuit/utils/Result";
import {Observable}       from "shared/api/circuit/utils/Observable";

import {GUID}              from "..";
import {CircuitInternal}   from "../impl/CircuitInternal";
import {SelectionsManager} from "../impl/SelectionsManager";

import {Assembler, AssemblyReason}              from "./Assembler";
import {AssemblyCache, PortPos, ReadonlyAssemblyCache} from "./AssemblyCache";
import {BezierCurve} from "math/BezierCurve";
import {HitTest} from "./PrimHitTests";


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
// export class CircuitViewAssetManager<T> extends Observable<{ key: string, val: T }> {
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

export abstract class CircuitAssembler extends Observable<CircuitAssemblerEvent> {
    private readonly circuit: CircuitInternal;
    private readonly selections: SelectionsManager;

    protected cache: AssemblyCache;

    private readonly dirtyComponents: DirtyMap<GUID>;
    private readonly dirtyWires: DirtyMap<GUID>;
    private readonly dirtyPorts: DirtyMap<GUID>;

    public constructor(circuit: CircuitInternal, selections: SelectionsManager) {
        super();

        this.circuit = circuit;
        this.selections = selections;

        this.cache = {
            componentTransforms: new Map(),
            componentPrims:      new Map(),

            localPortPositions: new Map(),
            portPositions:      new Map(),
            portPrims:          new Map(),

            wireCurves: new Map(),
            wirePrims:  new Map(),
        };

        this.dirtyComponents = new DirtyMap();
        this.dirtyWires = new DirtyMap();
        this.dirtyPorts = new DirtyMap();

        this.circuit.subscribe((ev) => {
            // TODO[model_refactor_api](leon) - use events better, i.e. how do we collect the diffs until the next
            //                                  render cycle or query for the dirty object(s)?
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
                if (circuit.doc.hasComp(id)) {
                    // Component transform changed, update connected wires
                    if (props.has("x") || props.has("y") || props.has("angle")) {
                        this.dirtyComponents.add(id, AssemblyReason.TransformChanged);

                        const ports = this.circuit.doc.getPortsForComponent(id);
                        ports.map((ports) => ports.forEach((portID) => {
                            this.circuit.doc.getWiresForPort(portID)
                                .map((wires) => wires.forEach((wireID) =>
                                    this.dirtyWires.add(wireID, AssemblyReason.TransformChanged)))
                        }))
                    } else {
                        this.dirtyComponents.add(id, AssemblyReason.PropChanged);
                    }
                } else if (circuit.doc.hasWire(id)) {
                    this.dirtyWires.add(id, AssemblyReason.PropChanged);
                } else if (circuit.doc.hasPort(id)) {
                    this.dirtyPorts.add(id, AssemblyReason.PropChanged);
                }
            }

            this.publish({ type: "onchange" });
        });

        this.selections.subscribe((ev) => {
            ev.selections.forEach((id) => {
                if (circuit.doc.hasComp(id))
                    this.dirtyComponents.add(id, AssemblyReason.SelectionChanged);
                else if (circuit.doc.hasWire(id))
                    this.dirtyWires.add(id, AssemblyReason.SelectionChanged);
                else if (circuit.doc.hasPort(id))
                    this.dirtyPorts.add(id, AssemblyReason.SelectionChanged);
            });

            this.publish({ type: "onchange" });
        });
    }

    public reassemble() {
        // Update components first
        for (const [compID, reasons] of this.dirtyComponents) {
            // If component doesn't exist, remove it and any associated ports
            if (!this.circuit.doc.hasComp(compID)) {
                this.cache.componentPrims.delete(compID);
                this.cache.componentTransforms.delete(compID);
                this.cache.portPrims.delete(compID);
                continue;
            }
            // Otherwise, update it
            const comp = this.circuit.doc.getCompByID(compID).unwrap();
            this.getAssemblerFor(comp.kind).assemble(comp, reasons);
        }
        this.dirtyComponents.clear();

        // TODO(leon) - does this work? I don't think it does
        //   i.e. I don't think dirtyPorts gets set properly when portAmt changes?
        // Remove any ports that were deleted
        for (const [portID, _reasons] of this.dirtyPorts) {
            if (!this.circuit.doc.hasPort(portID)) {
                this.cache.portPositions.delete(portID);
                this.cache.localPortPositions.delete(portID);
            }
        }
        this.dirtyPorts.clear();

        // Then update wires
        for (const [wireID, reasons] of this.dirtyWires) {
            // If wire doesn't exist, remove it
            if (!this.circuit.doc.hasWire(wireID)) {
                this.cache.wireCurves.delete(wireID);
                this.cache.wirePrims.delete(wireID);
                continue;
            }
            // Otherwise, update it
            const wire = this.circuit.doc.getWireByID(wireID).unwrap();
            this.getAssemblerFor(wire.kind).assemble(wire, reasons);
        }
        this.dirtyWires.clear();
    }

    // TODO[model_refactor_api](leon): Think of a better way to allow access to Prim data and have it auto-update
    //                                 if it is currently dirty
    public getPortPos(portID: GUID): Option<PortPos> {
        if (!this.circuit.doc.hasPort(portID))
            return None();

        const port = this.circuit.doc.getPortByID(portID).unwrap();

        // TODO[model_refactor_api](leon): This is terrible
        if (this.dirtyComponents.has(port.parent)) {
            const comp = this.circuit.doc.getCompByID(port.parent).unwrap();
            this.getAssemblerFor(comp.kind)
                .assemble(comp, this.dirtyComponents.get(port.parent)!);
            this.dirtyComponents.delete(port.parent);
        }

        return Some(this.cache.portPositions.get(portID)!);
    }

    public getWireShape(wireID: GUID): Option<BezierCurve> {
        if (!this.circuit.doc.hasWire(wireID))
            return None();
        return Some(this.cache.wireCurves.get(wireID)!);
    }

    public findNearestObj(pos: Vector, filter: (id: GUID) => boolean = ((_) => true)): Option<GUID> {
        for (const [id, prims] of this.cache.componentPrims) {
            if (!filter(id)) // Skip things not in the filter
                continue;
            if (prims.some((prim) => HitTest(prim, pos)))
                return Some(id);
            // TODO[model_refactor_api](leon): hit test the component's ports as well
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

    protected abstract getAssemblerFor(kind: string): Assembler;
}
