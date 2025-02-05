import {Vector} from "Vector";

import {None,Option,Some} from "core/utils/Result";
import {Observable}       from "core/utils/Observable";

import {GUID}              from "..";
import {CircuitInternal}   from "../impl/CircuitInternal";
import {SelectionsManager} from "../impl/SelectionsManager";

import {Assembler}              from "./Assembler";
import {AssemblyCache, PortPos, ReadonlyAssemblyCache} from "./AssemblyCache";
import {BezierCurve} from "math/BezierCurve";


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

export abstract class CircuitAssembler extends Observable<CircuitAssemblerEvent> {
    private readonly circuit: CircuitInternal;
    private readonly selections: SelectionsManager;

    protected cache: AssemblyCache;

    private readonly dirtyComponents: Set<GUID>;
    private readonly dirtyWires: Set<GUID>;
    private readonly dirtyPorts: Set<GUID>;

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

        this.dirtyComponents = new Set();
        this.dirtyWires = new Set();
        this.dirtyPorts = new Set();

        this.circuit.subscribe((ev) => {
            // TODO[model_refactor_api](leon) - use events better, i.e. how do we collect the diffs until the next
            //                                  render cycle or query for the dirty object(s)?
            const diff = ev.diff;

            // Mark all added/removed component dirty
            for (const compID of diff.addedComponents)
                this.dirtyComponents.add(compID);
            for (const compID of diff.removedComponents)
                this.dirtyComponents.add(compID);

            // Mark all components w/ changed ports dirty
            for (const compID of diff.portsChanged)
                this.dirtyComponents.add(compID);

            // Mark all added/removed wires dirty
            for (const wireID of diff.addedWires)
                this.dirtyWires.add(wireID);
            for (const wireID of diff.removedWires)
                this.dirtyWires.add(wireID);

            // Mark all changed obj props dirty
            for (const [id, props] of diff.propsChanged) {
                if (circuit.doc.hasComp(id)) {
                    this.dirtyComponents.add(id);

                    // Component transform changed, update connected wires
                    if (props.has("x") || props.has("y") || props.has("angle")) {
                        const ports = this.circuit.doc.getPortsForComponent(id);
                        ports.map((ports) => ports.forEach((portID) => {
                            this.circuit.doc.getWiresForPort(portID)
                                .map((wires) => wires.forEach((wireID) => this.dirtyWires.add(wireID)))
                        }))
                    }
                } else if (circuit.doc.hasWire(id)) {
                    this.dirtyWires.add(id);
                } else if (circuit.doc.hasPort(id)) {
                    this.dirtyPorts.add(id);
                }
            }

            this.publish({ type: "onchange" });
        });

        // this.selections.subscribe((ev) => {
        //     ev.selections.forEach((id) => {
        //         if (circuit.doc.hasComp(id))
        //             this.dirtyComponents.add(id);
        //         else if (circuit.doc.hasWire(id))
        //             this.dirtyWires.add(id);
        //         else if (circuit.doc.hasPort(id))
        //             this.dirtyPorts.add(id);
        //     });

        //     this.publish({ type: "onchange" });
        // });
    }

    public reassemble() {
        // Update components first
        for (const compID of this.dirtyComponents) {
            // If component doesn't exist, remove it and any associated ports
            if (!this.circuit.doc.hasComp(compID)) {
                this.cache.componentPrims.delete(compID);
                this.cache.componentTransforms.delete(compID);
                this.cache.portPrims.delete(compID);
                continue;
            }
            // Otherwise, update it
            const comp = this.circuit.doc.getCompByID(compID).unwrap();
            // TODO[model_refactor_api](leon) - figure out `ev` param
            this.getAssemblerFor(comp.kind).assemble(comp, {});
        }
        this.dirtyComponents.clear();

        // Remove any ports that were deleted
        for (const portID of this.dirtyPorts) {
            if (!this.circuit.doc.hasPort(portID)) {
                this.cache.portPositions.delete(portID);
                this.cache.localPortPositions.delete(portID);
            }
        }
        this.dirtyPorts.clear();

        // Then update wires
        for (const wireID of this.dirtyWires) {
            // If wire doesn't exist, remove it
            if (!this.circuit.doc.hasWire(wireID)) {
                this.cache.wireCurves.delete(wireID);
                this.cache.wirePrims.delete(wireID);
                continue;
            }
            // Otherwise, update it
            const wire = this.circuit.doc.getWireByID(wireID).unwrap();
            // TODO[model_refactor_api](leon) - figure out `ev` param
            this.getAssemblerFor(wire.kind).assemble(wire, {});
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
            this.getAssemblerFor(comp.kind).assemble(comp, {});
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
            if (prims.some((prim) => prim.hitTest(pos)))
                return Some(id);
            // TODO[model_refactor_api](leon): hit test the component's ports as well
        }
        for (const [id, prims] of this.cache.wirePrims) {
            if (!filter(id)) // Skip things not in the filter
                continue;
            if (prims.some((prim) => prim.hitTest(pos)))
                return Some(id);
        }
        return None();
    }

    public getCache(): ReadonlyAssemblyCache {
        return this.cache;
    }

    protected abstract getAssemblerFor(kind: string): Assembler;
}
