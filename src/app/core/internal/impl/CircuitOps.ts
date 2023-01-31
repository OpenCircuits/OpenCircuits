import {Schema} from "core/schema"


export interface PlaceComponentOp {
    kind: "PlaceComponentOp";
    inverted: boolean;
    c: Schema.Component;
    // Components are born without ports.  This helps reduce complexity of individual ops
    // and does not introduce any problematic intermediary states.
}

export interface ConnectWireOp {
    kind: "ConnectWireOp";
    inverted: boolean;
    w: Schema.Wire;
}

export interface SplitWireOp {
    kind: "SplitWireOp";
    inverted: boolean;
    splitParameter: number;
    tgt: Schema.Wire;
    new: Schema.Wire;
    node: Schema.Component;
}

export interface SetPropertyOp {
    kind: "SetPropertyOp";
    id: Schema.GUID;
    key: string;
    newVal?: Schema.Prop;
    oldVal?: Schema.Prop;
}

export interface SetComponentPortsOp {
    kind: "SetComponentPortsOp";
    inverted: boolean;
    component: Schema.GUID;
    newPorts?: Schema.Port[];
    oldPorts?: Schema.Port[];
    deadWires?: Schema.Wire[];
}

export type CircuitOp = PlaceComponentOp | ConnectWireOp | SplitWireOp | SetPropertyOp | SetComponentPortsOp;

export function InvertCircuitOp(op: CircuitOp): CircuitOp {
    switch (op.kind) {
        case "PlaceComponentOp":
        case "ConnectWireOp":
        case "SplitWireOp":
        case "SetComponentPortsOp":
            return { ...op, inverted: !op.inverted };
        case "SetPropertyOp":
            return { ...op, newVal: op.oldVal, oldVal: op.newVal };
    }
}

// Transforms "targetOp" to occur after "withOp".
export function TransformCircuitOp(targetOp: CircuitOp | undefined, withOp: CircuitOp): CircuitOp | undefined {
    if (!targetOp)
        return;
    // IMPL NOTE: generate copies of all mutated objects.
    const _ = withOp;
    return targetOp;
}

export function TransformCircuitOps(targetOps: CircuitOp[], withOps: CircuitOp[]): CircuitOp[] | undefined {
    if (withOps.length === 0)
        return targetOps;
    const newOps = targetOps.map((op) => withOps.reduce((tgtOp, withOp) => TransformCircuitOp(tgtOp, withOp), op));
    if (newOps.some((v) => !v))
        return undefined;
    return newOps as CircuitOp[];
}
