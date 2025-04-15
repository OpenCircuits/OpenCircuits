import {GUID} from "shared/api/circuit/schema/GUID";

import {Schema}      from "../../schema";
import {assertNever} from "../utils/TypeEnforcement";

import {CircuitOp} from "./CircuitOps";

import "shared/api/circuit/utils/Map";


// FastCircuitDiff is a simple, coarse description of how a circuit changed, primarily for invalidating objects computed
// from circuit objects, namely the view.  This avoids the potentially complex logic of CircuitDiff for high-throughput
// scenarios, like selecting many items and moving them around with the mouse.
export interface FastCircuitDiff {
    // ICs
    addedICs: ReadonlySet<GUID>;
    removedICs: ReadonlySet<GUID>;
    changedPropICs: ReadonlySet<GUID>;

    // Components
    addedComponents: ReadonlySet<GUID>;
    removedComponents: ReadonlySet<GUID>;

    // Ports
    addedPorts: ReadonlyMap<GUID, ReadonlySet<GUID>>;    // parentComp.id : addedPort.id[]
    removedPorts: ReadonlyMap<GUID, ReadonlySet<GUID>>;  // parentComp.id : removePort.id[]

    // Wires
    addedWires: ReadonlySet<GUID>;
    removedWires: ReadonlySet<GUID>;
    removedWiresPorts: ReadonlyMap<GUID, [GUID, GUID]>;  // removedWire.id : [removedWire.p1, removedWire.p2]

    // All props on all objects that may have changed
    propsChanged: ReadonlyMap<GUID, Set<string>>;
}

export class FastCircuitDiffBuilder {
    // ICs
    private readonly addedICs: Set<GUID> = new Set();
    private readonly removedICs: Set<GUID> = new Set();
    private readonly changedPropICs: Set<GUID> = new Set();

    // Components
    private readonly addedComponents: Set<GUID>;
    private readonly removedComponents: Set<GUID>;

    // Ports
    private readonly addedPorts: Map<GUID, Set<GUID>>;
    private readonly removedPorts: Map<GUID, Set<GUID>>;

    // Wires
    private readonly addedWires: Set<GUID>;
    private readonly removedWires: Set<GUID>;
    private readonly removedWiresPorts: Map<GUID, [GUID, GUID]>;

    // All objects that may have a prop changed
    private readonly propsChanged: Map<GUID, Set<string>>;

    private getOrCreatePropSet(id: GUID): Set<string> {
        return this.propsChanged.getOrInsert(id, () => new Set());
    }

    public constructor() {
        this.addedICs          = new Set();
        this.removedICs        = new Set();
        this.changedPropICs    = new Set();
        this.addedComponents   = new Set();
        this.removedComponents = new Set();
        this.addedPorts        = new Map();
        this.removedPorts      = new Map();
        this.addedWires        = new Set();
        this.removedWires      = new Set();
        this.removedWiresPorts = new Map();
        this.propsChanged      = new Map();
    }

    // Discard this after calling
    public build(): FastCircuitDiff {
        return {
            addedICs:          this.addedICs,
            removedICs:        this.removedICs,
            changedPropICs:    this.changedPropICs,
            addedComponents:   this.addedComponents,
            removedComponents: this.removedComponents,
            addedPorts:        this.addedPorts,
            removedPorts:      this.removedPorts,
            addedWires:        this.addedWires,
            removedWires:      this.removedWires,
            removedWiresPorts: this.removedWiresPorts,
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
                const addedPorts = this.addedPorts.getOrInsert(op.component, () => new Set());
                const removedPorts = this.removedPorts.getOrInsert(op.component, () => new Set());

                if (op.inverted) {
                    op.removedPorts.forEach((p) => {
                        addedPorts.add(p.id);
                        removedPorts.delete(p.id);
                    });
                    op.addedPorts.forEach((p) => {
                        addedPorts.delete(p.id);
                        removedPorts.add(p.id);
                    });
                    op.deadWires.forEach((w) => {
                        this.removedWires.delete(w.id);
                        this.removedWiresPorts.delete(w.id);
                        this.addedWires.add(w.id);
                    });
                } else {
                    op.addedPorts.forEach((p) => {
                        addedPorts.add(p.id);
                        removedPorts.delete(p.id);
                    });
                    op.removedPorts.forEach((p) => {
                        addedPorts.delete(p.id);
                        removedPorts.add(p.id);
                    });
                    op.deadWires.forEach((w) => {
                        this.addedWires.delete(w.id)
                        this.removedWires.add(w.id);
                        this.removedWiresPorts.set(w.id, [w.p1, w.p2]);
                    });
                }
                break;
            case "ConnectWireOp":
                if (op.inverted) {
                    this.addedWires.delete(op.w.id);
                    this.removedWires.add(op.w.id);
                    this.removedWiresPorts.set(op.w.id, [op.w.p1, op.w.p2]);
                } else {
                    this.removedWires.delete(op.w.id);
                    this.removedWiresPorts.delete(op.w.id);
                    this.addedWires.add(op.w.id);
                }
                break;
            case "SplitWireOp":
                throw new Error("Unimplemented");
            case "SetPropertyOp":
                if (op.ic) {
                    this.changedPropICs.add(op.id);
                } else {
                    this.getOrCreatePropSet(op.id).add(op.key);
                }
                break;
            case "CreateICOp":
                if (op.inverted) {
                    this.addedICs.delete(op.ic.metadata.id);
                    this.removedICs.add(op.ic.metadata.id);
                } else {
                    this.removedICs.delete(op.ic.metadata.id);
                    this.addedICs.add(op.ic.metadata.id);
                }
                break;
            default:
                assertNever(op);
        }
    }

    public applyDiff(diff: FastCircuitDiff) {
        const merge = <T>(from: ReadonlySet<T>, into: Set<T>) => from.forEach((v) => into.add(v));
        merge(diff.addedICs,          this.addedICs);
        merge(diff.removedICs,        this.removedICs);
        merge(diff.changedPropICs,    this.changedPropICs);
        merge(diff.addedComponents,   this.addedComponents);
        merge(diff.removedComponents, this.removedComponents);
        diff.addedPorts.forEach((ports, comp) => merge(ports, this.addedPorts.getOrInsert(comp, () => new Set())));
        diff.removedPorts.forEach((ports, comp) => merge(ports, this.removedPorts.getOrInsert(comp, () => new Set())));
        merge(diff.addedWires,        this.addedWires);
        merge(diff.removedWires,      this.removedWires);
        diff.removedWiresPorts.forEach((ports, wire) => this.removedWiresPorts.set(wire, ports));
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
    // IC changes.
    //
    addedICs: ReadonlyMap<GUID, Schema.IntegratedCircuit>;
    removedICs: ReadonlyMap<GUID, Schema.IntegratedCircuit>;
    changedPropICs: ReadonlyMap<GUID, ReadonlyMap<string, Schema.Prop>>;

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
