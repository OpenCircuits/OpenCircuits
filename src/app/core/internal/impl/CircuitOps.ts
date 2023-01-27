import { Schema } from "core/schema"

// Sequence of ops that should be applied atomically.  This is not a proper op itself currently,
// but maybe it should be?
export interface MultiOp {
    kind: "MultiOp";
    ops: CircuitOp[];
}

export interface PlaceComponentOp {
    kind: "PlaceComponentOp";
    inverted: boolean;
    c: Schema.Component;
    ports: Schema.Port[];
    wires: Schema.Wire[];
}

export interface ConnectWireOp {
    kind: "ConnectWireOp";
    inverted: boolean;
    w: Schema.Wire;
}

export interface SplitWireOp {
    kind: "SplitWireOp";
    inverted: boolean;
    tgt: Schema.Wire;
    new: Schema.Wire;
    node: Schema.Component;
}

export interface SetPropertyOp {
    kind: "SetPropertyOp";
    key: string;
    newVal?: Schema.Prop;
    oldVal?: Schema.Prop;
}

export interface SetComponentPortsOp {
    kind: "SetComponentPortsOp";
    component: Schema.GUID,
    newPorts?: Schema.Port[];
    oldPorts?: Schema.Port[];
}

export type CircuitOp = PlaceComponentOp | ConnectWireOp | SplitWireOp | SetPropertyOp | SetComponentPortsOp;

export function InvertCircuitOp(op: CircuitOp): CircuitOp {
    switch (op.kind) {
        case "PlaceComponentOp":
        case "ConnectWireOp":
        case "SplitWireOp":
            return { ...op, inverted: !op.inverted };
        case "SetPropertyOp":
            return { ...op, newVal: op.oldVal, oldVal: op.newVal };
        case "SetComponentPortsOp":
            return { ...op, newPorts: op.oldPorts, oldPorts: op.newPorts };
    }
}

export function InvertMultiOp(op: MultiOp): MultiOp {
    return { kind: op.kind, ops: [...op.ops].reverse().map((a) => InvertCircuitOp(a)) };
}
