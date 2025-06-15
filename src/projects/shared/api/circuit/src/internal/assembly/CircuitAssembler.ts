import {Vector} from "Vector";
import {Curve}  from "math/Curve";
import {Rect}   from "math/Rect";

import {None, Option, Some} from "shared/api/circuit/utils/Result";
import {ObservableImpl}     from "shared/api/circuit/utils/Observable";

import {GUID}              from "..";
import {CircuitInternal}   from "../impl/CircuitInternal";

import {Assembler, AssemblerParams, AssemblyReason}    from "./Assembler";
import {AssemblyCache, DepthList, PortPos, ReadonlyAssemblyCache} from "./AssemblyCache";
import {Bounds}                                        from "./PrimBounds";
import {HitTest, IntersectionTest}                                       from "./PrimHitTests";
import {RenderOptions}                                 from "./RenderOptions";

import "shared/api/circuit/utils/Map";
import {IsDefined} from "../../utils/Reducers";


export type CircuitAssemblerEvent = {
    type: "onchange";
}

class DirtyMap<K> {
    private readonly map: Map<K, Set<AssemblyReason>>;

    public constructor() {
        this.map = new Map();
    }

    public add(id: K, ...reasons: AssemblyReason[]): void {
        const set = this.map.getOrInsert(id, () => new Set());
        reasons.forEach((r) => set.add(r));
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
    protected readonly circuit: CircuitInternal;
    protected readonly options: RenderOptions;

    protected cache: AssemblyCache;

    protected readonly dirtyComponents: DirtyMap<GUID>;
    protected readonly dirtyComponentPorts: Map<GUID, DirtyMap<GUID>>;  // parent.id : port.id[]
    protected readonly dirtyWires: DirtyMap<GUID>;
    // protected readonly dirtyPorts: DirtyMap<GUID>;

    protected readonly dirtyComponentOrder: Set<GUID>;

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

            componentOrder: new DepthList(),

            localPortPositions: new Map(),
            portPositions:      new Map(),
            portPrims:          new Map(),
            portLabelPrims:     new Map(),

            wireCurves: new Map(),
            wirePrims:  new Map(),
        };
        this.options = options;

        this.assemblers = assemblers({ circuit, cache: this.cache, options });

        this.dirtyComponents = new DirtyMap();
        this.dirtyComponentPorts = new Map();
        this.dirtyWires = new DirtyMap();

        this.dirtyComponentOrder = new Set();
        // this.dirtyPorts = new DirtyMap();

        this.circuit.subscribe((ev) => {
            const diff = ev.diff;

            // IC prop changed -> size or ports changed
            // we need to mark all instances as dirty (and connected wires)
            for (const icId of ev.diff.changedPropICs) {
                const comps = [...this.circuit.getComps()]
                    .map((c) => this.circuit.getCompByID(c).unwrap())
                    .filter((c) => this.circuit.isIC(c) && c.icId === icId);
                comps.forEach((c) => {
                    this.dirtyComponents.add(c.id, AssemblyReason.TransformChanged, AssemblyReason.PortsChanged);

                    this.circuit.getAllWiresForComponent(c.id).unwrap()
                        .forEach((wireId) => this.dirtyWires.add(wireId, AssemblyReason.TransformChanged));
                });
            }

            // Mark all added/removed component dirty
            for (const compID of diff.addedComponents) {
                this.dirtyComponents.add(compID, AssemblyReason.Added);
                this.dirtyComponentOrder.add(compID);
            }
            for (const compID of diff.removedComponents) {
                this.dirtyComponents.add(compID, AssemblyReason.Removed);
                this.dirtyComponentOrder.add(compID);
            }

            // Mark all components w/ changed ports dirty
            // TODO[]: Does this need to set all wires dirty too since an update to
            //  the port config of a component could theoretically change existing
            //  port locations?
            for (const [compId, newPorts] of diff.addedPorts) {
                this.dirtyComponents.add(compId, AssemblyReason.PortsChanged);

                const existing = this.dirtyComponentPorts.getOrInsert(compId, () => new DirtyMap());
                newPorts.forEach((port) => existing.add(port, AssemblyReason.Added));

                if (!diff.removedComponents.has(compId)) {
                    this.circuit.getAllWiresForComponent(compId).unwrap()
                        .forEach((wireId) => this.dirtyWires.add(wireId, AssemblyReason.TransformChanged));
                }
            }
            for (const [compId, newPorts] of diff.removedPorts) {
                this.dirtyComponents.add(compId, AssemblyReason.PortsChanged);

                const existing = this.dirtyComponentPorts.getOrInsert(compId, () => new DirtyMap());
                newPorts.forEach((port) => existing.add(port, AssemblyReason.Removed));

                if (!diff.removedComponents.has(compId)) {
                    this.circuit.getAllWiresForComponent(compId).unwrap()
                        .forEach((wireId) => this.dirtyWires.add(wireId, AssemblyReason.TransformChanged));
                }
            }

            // Mark all added/removed wires dirty
            for (const wireID of diff.addedWires)
                this.dirtyWires.add(wireID, AssemblyReason.Added);
            for (const wireID of diff.removedWires)
                this.dirtyWires.add(wireID, AssemblyReason.Removed);

            // Mark all changed obj props dirty
            for (const [id, props] of diff.propsChanged) {
                const result = circuit.getObjByID(id);
                if (!result.ok) // Object was deleted
                    continue;
                const obj = result.value;

                // If z-index was set, dirty the component separately since it doesn't
                // need to reassemble, but the component order list needs updating.
                if (obj.baseKind === "Component" && props.has("zIndex")) {
                    props.delete("zIndex");
                    this.dirtyComponentOrder.add(id);
                }

                if (props.size === 0)
                    continue;

                // Ports are weird since they depend almost entirely on their parent component for assembly
                // For now just manual check them for being selected
                if (obj.baseKind === "Port") {
                    const existing = this.dirtyComponentPorts.getOrInsert(obj.parent, () => new DirtyMap());
                    if (props.has("isSelected"))
                        existing.add(id, AssemblyReason.SelectionChanged);
                    existing.add(id, AssemblyReason.PropChanged);
                    continue;
                }

                // Ignore non-assemblable objects
                if (!(obj.kind in this.assemblers))
                    continue;

                const assembler = this.getAssemblerFor(obj.kind);
                const mapping = assembler.getPropMappings();

                const reasons = new Set([...props].map((prop) => mapping[prop]));

                if (obj.baseKind === "Component") {
                    this.dirtyComponents.add(id, AssemblyReason.PropChanged, ...reasons);
                    if (reasons.has(AssemblyReason.TransformChanged)) {
                        this.circuit.getAllWiresForComponent(id).unwrap()
                            .forEach((wireId) => this.dirtyWires.add(wireId, AssemblyReason.TransformChanged));
                    }
                } else if (obj.baseKind === "Wire") {
                    this.dirtyWires.add(id, AssemblyReason.PropChanged, ...reasons);
                }
            }

            this.publish({ type: "onchange" });
        });
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

        // Remove any ports that were deleted and/or re-assemble component with port change reasons
        // TODO[] - do this better, maybe make PortAssemblers separate somehow
        for (const [compId, ports] of this.dirtyComponentPorts) {
            const reasons = new Set<AssemblyReason>();
            for (const [portId, portReasons] of ports) {
                if (!this.circuit.hasPort(portId)) {
                    this.cache.portPositions.delete(portId);
                    this.cache.localPortPositions.delete(portId);
                    continue;
                }
                portReasons.forEach((reason) => reasons.add(reason));
            }

            if (!this.circuit.hasComp(compId) || reasons.size === 0)
                continue;

            const comp = this.circuit.getCompByID(compId).unwrap();
            this.getAssemblerFor(comp.kind).assemble(comp, reasons);
        }
        this.dirtyComponentPorts.clear();

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

        this.updateCompOrdering();
    }

    public get highestZ(): number {
        this.updateCompOrdering();

        return this.cache.componentOrder.highestDepth;
    }

    protected updateCompOrdering() {
        // Update ordering of components
        for (const compId of this.dirtyComponentOrder) {
            if (!this.circuit.hasComp(compId)) {
                this.cache.componentOrder.delete(compId);
                continue;
            }
            const comp = this.circuit.getCompByID(compId).unwrap();
            this.cache.componentOrder.set(compId, (comp.props.zIndex ?? 0));
        }
        this.dirtyComponentOrder.clear();
    }

    protected reassembleComp(compID: GUID) {
        // Reassemble component if dirty
        if (this.dirtyComponents.has(compID)) {
            const comp = this.circuit.getCompByID(compID).unwrap();
            this.getAssemblerFor(comp.kind)
                .assemble(comp, this.dirtyComponents.get(compID)!);
            this.dirtyComponents.delete(compID);
        }
    }
    protected reassembleWire(wireID: GUID) {
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

    // TODO: Reduce search space with some sort of space-paritioning data-structure (QuadTree).
    public findObjsWithin(bounds: Rect, filter: (id: GUID) => boolean = ((_) => true)): GUID[] {
        // Must reassemble to refresh prims in caches
        this.reassemble();

        const ids: GUID[] = [];

        // Loop by REVERSE component order (top first)
        for (let i = this.cache.componentOrder.length - 1; i >= 0; i--) {
            const compId = this.cache.componentOrder.at(i)!;
            const prims = this.cache.componentPrims.get(compId)!;
            // Skip components not in the filter
            if (filter(compId) && prims.some((prim) => IntersectionTest(prim, bounds))) {
                ids.push(compId);
                continue;
            }

            // Hit test component's ports
            for (const [portId, portPrims] of this.cache.portPrims.get(compId) ?? []) {
                if (!filter(portId))
                    continue;
                if (portPrims.some((prim) => IntersectionTest(prim, bounds)))
                    ids.push(portId);
            }
        }

        for (const [id, prims] of this.cache.wirePrims) {
            if (!filter(id)) // Skip things not in the filter
                continue;
            if (prims.some((prim) => IntersectionTest(prim, bounds)))
                ids.push(id);
        }

        return ids;
    }

    public findNearestObj(pos: Vector, filter: (id: GUID) => boolean = ((_) => true)): Option<GUID> {
        // Must reassemble to refresh prims in caches
        this.reassemble();

        // Loop by REVERSE component order (top first)
        for (let i = this.cache.componentOrder.length - 1; i >= 0; i--) {
            const compId = this.cache.componentOrder.at(i)!;
            const prims = this.cache.componentPrims.get(compId)!;
            // Skip components not in the filter
            if (filter(compId) && prims.some((prim) => HitTest(prim, pos)))
                return Some(compId);

            // Hit test component's ports
            for (const [portId, portPrims] of this.cache.portPrims.get(compId) ?? []) {
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
