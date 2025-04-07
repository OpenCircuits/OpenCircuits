import {Ok, Result, ResultUtil} from "shared/api/circuit/utils/Result";

import {Schema} from "shared/api/circuit/schema"


export interface PlaceComponentOp {
    kind: "PlaceComponentOp";
    inverted: boolean;
    c: Schema.Component;
    // Components are born without ports. This helps reduce complexity of individual ops
    // and does not introduce any problematic intermediary states.
}

export interface ReplaceComponentOp {
    kind: "ReplaceComponentOp";
    component: Schema.GUID;
    oldKind: string;
    newKind: string;
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
    ic: boolean; // Indicates if this is a property on an IC
    key: string;
    newVal?: Schema.Prop;
    oldVal?: Schema.Prop;
}

export interface SetComponentPortsOp {
    kind: "SetComponentPortsOp";
    inverted: boolean;
    component: Schema.GUID;
    addedPorts: Schema.Port[];
    removedPorts: Schema.Port[];
    deadWires: Schema.Wire[];
}

export interface CreateICOp {
    kind: "CreateICOp";
    inverted: boolean;
    ic: Schema.IntegratedCircuit;
}

export type CircuitOp = PlaceComponentOp
                      | ReplaceComponentOp
                      | ConnectWireOp
                      | SplitWireOp
                      | SetPropertyOp
                      | SetComponentPortsOp
                      | CreateICOp;

export function InvertCircuitOp(op: CircuitOp): CircuitOp {
    switch (op.kind) {
        case "PlaceComponentOp":
        case "ConnectWireOp":
        case "SplitWireOp":
        case "SetComponentPortsOp":
        case "CreateICOp":
            return { ...op, inverted: !op.inverted };
        case "SetPropertyOp":
            return { ...op, newVal: op.oldVal, oldVal: op.newVal };
        case "ReplaceComponentOp":
            return { ...op, newKind: op.oldKind, oldKind: op.newKind };
    }
}

// Transforms "targetOp" to occur after "withOp".
export function TransformCircuitOp(targetOp: CircuitOp, withOp: CircuitOp): Result<CircuitOp> {
    // IMPL NOTE: generate copies of all mutated objects.
    const _ = withOp;
    return Ok(targetOp);
}

export function TransformCircuitOps(targetOps: CircuitOp[], withOps: readonly CircuitOp[]): Result<CircuitOp[]> {
    if (withOps.length === 0)
        return Ok(targetOps);
    return ResultUtil.mapIter(targetOps.values(), (op) =>
        ResultUtil.reduceIter(op, withOps.values(), (tgtOp, withOp) => TransformCircuitOp(tgtOp, withOp)));
}
