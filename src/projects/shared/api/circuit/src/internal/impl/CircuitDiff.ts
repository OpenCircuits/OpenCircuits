import {GUID, Schema} from "shared/api/circuit/schema";
import {assertNever} from "../utils/TypeEnforcement";

import {CircuitOp} from "./CircuitOps";

import "core/utils/Map";


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

// Mutable version of the Circuit Diff for use in the diff builder
// TODO[master](leon) - Maybe make a `Mutable` type util if a case like this comes up again
type MutableCircuitDiff = {
    [Prop in keyof CircuitDiff]:
        CircuitDiff[Prop] extends ReadonlyMap<infer K, infer V>
            ? Map<K, V> :
            CircuitDiff[Prop]
}

export class CircuitDiffBuilder {
    private readonly diff: MutableCircuitDiff;

    public constructor() {
        this.diff = {
            addedComponents:   new Map(),
            removedComponents: new Map(),
            addedWires:        new Map(),
            removedWires:      new Map(),
            portDiff:          new Map(),
            changedComponents: new Map(),
            propsDiff:         new Map(),
        };
    }

    // Iterate all portions of the diff to remove any net-0 changes
    public build(): CircuitDiff {
        // All added components that were also removed are only changed.  If the remove occurred after the add, then the
        // component would have been removed from the "added" list already (see "remove[Component|Wire]" below).
        this.diff.addedComponents.forEach((_, id) => {
            if (this.diff.removedComponents.has(id)) {
                this.diff.addedComponents.delete(id);
                this.diff.removedComponents.delete(id);
            }
        });
        this.diff.addedWires.forEach((_, id) => {
            if (this.diff.removedWires.has(id)) {
                this.diff.addedWires.delete(id);
                this.diff.removedWires.delete(id);
            }
        });

        // Ports are already handled incrementally
        // this.portDiff.forEach(...)

        // Remove no-op component kind changes
        this.diff.changedComponents.forEach(({ oldKind, newKind }, id) => {
            if (oldKind === newKind)
                this.diff.changedComponents.delete(id);
        });

        // Remove props where old === new
        this.diff.propsDiff.forEach((props, id) => {
            props.forEach(({ oldVal, newVal }, key) => {
                if (oldVal === newVal)
                    props.delete(key);
            });
            if (props.size === 0)
                this.diff.propsDiff.delete(id);
        });

        return { ...this.diff };
        // TODO[model_refactor_api](kevin): re-add "reset" behavior
    }

    private addComponent(c: Schema.Component) {
        // Keep the oldest removed component object
        // this.removedComponents.delete(id);

        // Keep the newest "add"
        this.diff.addedComponents.set(c.id, { ...c, props: {} });

        this.updatePropsForAdd(c.id, c.props);
        this.changeComponentKind(c.id, undefined, c.kind);
    }

    private removeComponent(c: Schema.Component) {
        // Remove always supercedes add
        this.diff.addedComponents.delete(c.id);

        // Keep the oldest "remove"
        if (!this.diff.removedComponents.has(c.id))
            this.diff.removedComponents.set(c.id, { ...c, props: {} });

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
        const currDiff = this.diff.portDiff.getOrInsert(id, () => ({ added: new Map(), removed: new Map() }));

        if (removedPorts)
            removedPorts.forEach((p) => currDiff.removed.delete(p.id));
        if (addedPorts)
            addedPorts.forEach((p) => currDiff.added.set(id, p));
    }

    // Parallels logic of "addComponent"
    private addWire(w: Schema.Wire) {
        this.diff.addedWires.set(w.id, w);
        this.updatePropsForAdd(w.id, w.props);
    }

    // Parallels logic of "removeComponent"
    private removeWire(w: Schema.Wire) {
        // Remove always supercedes add
        this.diff.addedWires.delete(w.id);

        // Keep the oldest "remove"
        if (!this.diff.removedWires.has(w.id))
            this.diff.removedWires.set(w.id, w);

        this.updatePropsForRemove(w.id, w.props);
    }

    private changeComponentKind(id: GUID, oldKind?: string, newKind?: string) {
        // Only copy the "newKind" so the oldest "oldKind" is kept.
        this.diff.changedComponents.emplace(id, {
            insert: ()  => ({ newKind, oldKind }),
            update: (d) => ({ ...d, newKind }),
        });
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
        const props = this.diff.propsDiff.getOrInsert(id, () => new Map());
        propUpdates.forEach(({ oldVal, newVal }, key) => {
            // Only save the "newVal" so the oldest "oldVal" is kept.
            props.emplace(key, {
                insert: ()  => ({ oldVal, newVal }),
                update: (d) => ({ ...d, newVal }),
            });
        });
    }

    // Appends an op to the diff.  Assumes "op" has already passed validation, either by being accepted by the remote
    // server, or by going through CircuitDocument.  Otherwise, the resulting CircuitDiff may be incoherant.
    public applyOp(op: CircuitOp): void {
        switch (op.kind) {
            case "PlaceComponentOp": {
                if (op.inverted)
                    this.removeComponent(op.c);
                else
                    this.addComponent(op.c);
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
                if (op.inverted)
                    this.removeWire(op.w);
                else
                    this.addWire(op.w);
                break;
            }
            case "SplitWireOp": {
                throw new Error("Unimplemented");
            }
            case "SetPropertyOp": {
                this.updateProps(op.id, new Map([[op.key, op]]));
                break;
            }
            default:
                assertNever(op);
        }
    }
}
