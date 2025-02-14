import {GUID} from "shared/api/circuit/schema/GUID";

import {Schema}      from "../../schema";
import {assertNever} from "../utils/TypeEnforcement";

import {CircuitOp} from "./CircuitOps";

import "shared/api/circuit/utils/Map";


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
