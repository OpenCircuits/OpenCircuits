import {GUID} from "core/schema/GUID";

import {Schema}      from "../../schema";
import {assertNever} from "../utils/TypeEnforcement";

import {CircuitOp} from "./CircuitOps";

// eslint-disable-next-line import/no-restricted-paths
import {} from "core/utils/Map"


// FastCircuitDiff is a simple, coarse description of how a circuit changed, primarily for invalidating objects computed
// from circuit objects, namely the view.  This avoids the potentially complex logic of CircuitDiff for high-throughput
// scenarios, like selecting many items and moving them around with the mouse.
export interface FastCircuitDiff {
    // Components
    addedComponents: ReadonlySet<GUID>;
    removedComponents: ReadonlySet<GUID>;
    portsChanged: ReadonlySet<GUID>;

    // Wires
    addedWires: ReadonlySet<GUID>;
    removedWires: ReadonlySet<GUID>;

    // All props on all objects that may have changed
    propsChanged: ReadonlyMap<GUID, Set<string>>;
}

export class FastCircuitDiffBuilder {
    // Components
    private readonly addedComponents: Set<GUID>;
    private readonly removedComponents: Set<GUID>;
    private readonly portsChanged: Set<GUID>;

    // Wires
    private readonly addedWires: Set<GUID>;
    private readonly removedWires: Set<GUID>;

    // All objects that may have a prop changed
    private readonly propsChanged: Map<GUID, Set<string>>;

    private getOrCreatePropSet(id: GUID): Set<string> {
        return this.propsChanged.getOrInsert(id, () => new Set());
    }

    public constructor() {
        this.addedComponents   = new Set();
        this.removedComponents = new Set();
        this.portsChanged      = new Set();
        this.addedWires        = new Set();
        this.removedWires      = new Set();
        this.propsChanged      = new Map();
    }

    // Discard this after calling
    public build(): FastCircuitDiff {
        return {
            addedComponents:   this.addedComponents,
            removedComponents: this.removedComponents,
            portsChanged:      this.portsChanged,
            addedWires:        this.addedWires,
            removedWires:      this.removedWires,
            propsChanged:      this.propsChanged,
        };
    }

    public applyOp(op: CircuitOp) {
        switch (op.kind) {
            case "PlaceComponentOp":
                if (op.inverted) {
                    this.addedComponents.delete(op.c.id);
                    this.removedComponents.add(op.c.id);
                } else {
                    this.removedComponents.delete(op.c.id);
                    this.addedComponents.add(op.c.id);
                }
                break;
            case "ReplaceComponentOp":
                this.addedComponents.add(op.component);
                break;
            case "SetComponentPortsOp":
                this.portsChanged.add(op.component);
                if (op.inverted) {
                    op.deadWires.forEach((w) => {
                        this.addedWires.delete(w.id)
                        this.removedWires.add(w.id);
                    });
                } else {
                    op.deadWires.forEach((w) => {
                        this.removedWires.delete(w.id);
                        this.addedWires.add(w.id);
                    });
                }
                break;
            case "ConnectWireOp":
                if (op.inverted) {
                    this.addedWires.delete(op.w.id);
                    this.removedWires.add(op.w.id);
                } else {
                    this.removedWires.delete(op.w.id);
                    this.addedWires.add(op.w.id);
                }
                break;
            case "SplitWireOp":
                throw new Error("Unimplemented");
            case "SetPropertyOp":
                this.getOrCreatePropSet(op.id).add(op.key);
                break;
            default:
                assertNever(op);
        }
    }

    public applyDiff(diff: FastCircuitDiff) {
        const merge = <T>(from: ReadonlySet<T>, into: Set<T>) => from.forEach((v) => into.add(v));
        merge(diff.addedComponents,   this.addedComponents);
        merge(diff.removedComponents, this.removedComponents);
        merge(diff.portsChanged,      this.portsChanged);
        merge(diff.addedWires,        this.addedWires);
        merge(diff.removedWires,      this.removedWires);
        diff.propsChanged.forEach((v, k) => merge(v, this.getOrCreatePropSet(k)));
    }
}


export interface ComponentPortDiff {
    added: Map<GUID, Schema.Port>;
    removed: Map<GUID, Schema.Port>;
}

type PropDiff = {oldVal?: Schema.Prop, newVal?: Schema.Prop};
export type PropsDiff = Map<string, PropDiff>;

// CircuitDiff accumulates the net difference from a known-legal sequence of CircuitOps.  This is useful when a minimal
// complete diff is desirable, such as when displaying in a History view.  For example, a sequence of CircuitOps like
// "delete C0; place C0; set C0.x 20" should appear as just a prop change on "C0.x".
// NOTE: This logic may be moved to a higher level.
export interface CircuitDiff {
    //
    // Graph changes.  These contain NO "props".
    //
    addedComponents: ReadonlyMap<GUID, Schema.Component>;
    removedComponents: ReadonlyMap<GUID, Schema.Component>;

    addedWires: ReadonlyMap<GUID, Schema.Wire>;
    removedWires: ReadonlyMap<GUID, Schema.Wire>;

    //
    // Port changes.  Includes components that were added/removed.
    //
    portDiff: ReadonlyMap<GUID, ComponentPortDiff>;

    //
    // Property changes.  Includes objects that were added/removed.
    //
    changedComponents: ReadonlyMap<GUID, { oldKind?: string, newKind?: string }>;
    propsDiff: ReadonlyMap<GUID, PropsDiff>;
}

export class CircuitDiffBuilder {
    // Graph changes
    private readonly addedComponents: Map<GUID, Schema.Component>;
    private readonly removedComponents: Map<GUID, Schema.Component>;

    private readonly addedWires: Map<GUID, Schema.Wire>;
    private readonly removedWires: Map<GUID, Schema.Wire>;

    // Port changes
    private readonly portDiff: Map<GUID, ComponentPortDiff>;

    // Property changes
    private readonly changedComponents: Map<GUID, { oldKind?: string, newKind?: string }>;
    private readonly propsDiff: Map<GUID, PropsDiff>;

    public constructor() {
        this.addedComponents   = new Map();
        this.removedComponents = new Map();
        this.addedWires        = new Map();
        this.removedWires      = new Map();
        this.portDiff          = new Map();
        this.changedComponents = new Map();
        this.propsDiff         = new Map();
    }

    // Iterate all portions of the diff to remove any net-0 changes
    public build(): CircuitDiff {
        // All added components that were also removed are only changed.  If the remove occurred after the add, then the
        // component would have been removed from the "added" list already (see "remove[Component|Wire]" below).
        this.addedComponents.forEach((_, id) => {
            if (this.removedComponents.has(id)) {
                this.addedComponents.delete(id);
                this.removedComponents.delete(id);
            }
        });
        this.addedWires.forEach((_, id) => {
            if (this.removedWires.has(id)) {
                this.addedWires.delete(id);
                this.removedWires.delete(id);
            }
        });

        // Ports are already handled incrementally
        // this.portDiff.forEach(...)

        // Remove no-op component kind changes
        this.changedComponents.forEach(({ oldKind, newKind }, id) => {
            if (oldKind === newKind)
                this.changedComponents.delete(id);
        });

        // Remove props where old === new
        this.propsDiff.forEach((props, id) => {
            props.forEach(({ oldVal, newVal }, key) => {
                if (oldVal === newVal)
                    props.delete(key);
            });
            if (props.size === 0)
                this.propsDiff.delete(id);
        });

        return {
            addedComponents:   this.addedComponents,
            removedComponents: this.removedComponents,
            addedWires:        this.addedWires,
            removedWires:      this.removedWires,
            portDiff:          this.portDiff,
            changedComponents: this.changedComponents,
            propsDiff:         this.propsDiff,
        };
        // TODO: re-add "reset" behavior
    }

    private addComponent(c: Schema.Component) {
        // Keep the oldest removed component object
        // this.removedComponents.delete(id);

        // Keep the newest "add"
        this.addedComponents.set(c.id, { ...c, props: {} });

        this.updatePropsForAdd(c.id, c.props);
        this.changeComponentKind(c.id, undefined, c.kind);
    }

    private removeComponent(c: Schema.Component) {
        // Remove always supercedes add
        this.addedComponents.delete(c.id);

        // Keep the oldest "remove"
        if (!this.removedComponents.has(c.id))
            this.removedComponents.set(c.id, { ...c, props: {} });

        // Ports are handled separately because they are a separate op
        // this.portDiff.delete(c.id);

        this.updatePropsForRemove(c.id, c.props);
        this.changeComponentKind(c.id, c.kind, undefined);
    }

    private updatePorts(
        id: GUID,
        addedPorts?: Schema.Port[],
        removedPorts?: Schema.Port[]
    ) {
        const currDiff = this.portDiff.getOrInsert(id, () => ({ added: new Map(), removed: new Map() }));

        if (removedPorts)
            removedPorts.forEach((p) => currDiff.removed.delete(p.id));
        if (addedPorts)
            addedPorts.forEach((p) => currDiff.added.set(id, p));
    }

    // Parallels logic of "addComponent"
    private addWire(w: Schema.Wire) {
        this.addedWires.set(w.id, w);
        this.updatePropsForAdd(w.id, w.props);
    }

    // Parallels logic of "removeComponent"
    private removeWire(w: Schema.Wire) {
        // Remove always supercedes add
        this.addedWires.delete(w.id);

        // Keep the oldest "remove"
        if (!this.removedWires.has(w.id))
            this.removedWires.set(w.id, w);

        this.updatePropsForRemove(w.id, w.props);
    }

    private changeComponentKind(id: GUID, oldKind?: string, newKind?: string) {
        // Only copy the "newKind" so the oldest "oldKind" is kept.
        this.changedComponents.upsert(id, (_, d) => ({ newKind, ...d }), () => ({ newKind, oldKind }));
    }

    private updatePropsForAdd(id: GUID, props: Record<string, Schema.Prop>) {
        // If an object is added, all of its props are added.
        const propDiff = new Map();
        for (const key in props)
            propDiff.set(key, { newVal: props[key] });
        this.updateProps(id, propDiff);
    }

    private updatePropsForRemove(id: GUID, props: Record<string, Schema.Prop>) {
        // If an object is deleted, all of its props are removed.
        const propDiffs = new Map();
        for (const key in props)
            propDiffs.set(key, { oldVal: props[key] });
        this.updateProps(id, propDiffs);
    }

    private updateProps(id: GUID, propUpdates: PropsDiff) {
        const props = this.propsDiff.getOrInsert(id, () => new Map());
        propUpdates.forEach(({ oldVal, newVal }, key) => {
            // Only save the "newVal" so the oldest "oldVal" is kept.
            props.upsert(key, (_, d) => ({ newVal, ...d }), () => ({ oldVal, newVal }));
        });
    }

    // Appends an op to the diff.  Assumes "op" has already passed validation, either by being accepted by the remote
    // server, or by going through CircuitDocument.  Otherwise, the resulting CircuitDiff may be incoherant.
    public applyOp(op: CircuitOp): void {
        switch (op.kind) {
            case "PlaceComponentOp": {
                op.inverted ? this.removeComponent(op.c) : this.addComponent(op.c);
                break;
            }
            case "ReplaceComponentOp": {
                this.changeComponentKind(op.component, op.oldKind, op.newKind);
                break;
            }
            case "SetComponentPortsOp": {
                if (op.inverted) {
                    this.updatePorts(op.component, op.removedPorts, op.addedPorts);
                    op.deadWires.forEach((w) => this.addWire(w));
                } else {
                    this.updatePorts(op.component, op.addedPorts, op.removedPorts);
                    op.deadWires.forEach((w) => this.removeWire(w));
                }
                break;
            }
            case "ConnectWireOp": {
                op.inverted ? this.removeWire(op.w) : this.addWire(op.w);
                break;
            }
            case "SplitWireOp": {
                throw new Error("Unimplemented");
            }
            case "SetPropertyOp": {
                const d: PropDiff = op;
                this.updateProps(op.id, new Map([[op.key, d]]));
                break;
            }
            default:
                assertNever(op);
        }
    }
}
