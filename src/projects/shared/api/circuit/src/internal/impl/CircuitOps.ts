/* eslint-disable sonarjs/prefer-single-boolean-return */
import {None, Ok, Option, Result, ResultUtil, Some} from "shared/api/circuit/utils/Result";

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
    oldKind: number;
    newKind: number;
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

export interface UpdateICMetadataOp {
    kind: "UpdateICMetadataOp";
    icId: Schema.GUID;
    newVal: Partial<Omit<Schema.IntegratedCircuitMetadata, "id">>;
    oldVal: Partial<Omit<Schema.IntegratedCircuitMetadata, "id">>;
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
                      | UpdateICMetadataOp
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
        case "UpdateICMetadataOp":
            return { ...op, newVal: op.oldVal, oldVal: op.newVal };
        case "SetPropertyOp":
            return { ...op, newVal: op.oldVal, oldVal: op.newVal };
        case "ReplaceComponentOp":
            return { ...op, newKind: op.oldKind, oldKind: op.newKind };
    }
}

export function CanCommuteOps(targetOp: CircuitOp, withOp: CircuitOp): boolean {
    if (withOp.kind === "SetPropertyOp") {
        if (targetOp.kind !== "SetPropertyOp")
            return false;
        // Can't swap the order of ops affecting the same thing (but can merge)
        if (withOp.id === targetOp.id && withOp.key === targetOp.key)
            return false;
        return true;
    }
    return false;
}

export function MergeOps(targetOp: CircuitOp, withOp: CircuitOp): Option<CircuitOp> {
    if (withOp.kind === "SetPropertyOp") {
        if (targetOp.kind !== "SetPropertyOp")
            return None();
        if (withOp.id === targetOp.id && withOp.key === targetOp.key) {
            return Some({
                ...withOp,
                newVal: withOp.newVal,
                oldVal: targetOp.oldVal,
            });
        }
        return None();
    }
    return None();
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
