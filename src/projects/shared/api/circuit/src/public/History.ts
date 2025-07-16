import {GUID} from "shared/api/circuit/schema";

import {Observable} from "../utils/Observable";
import {CircuitOp} from "../internal/impl/CircuitOps";


export interface CircuitHistoryEvent {
    type: "change";
}
export type CircuitHistoryOp = Readonly<CircuitOp>;
export interface CircuitHistoryEntry {
    readonly id: GUID;

    // Operations
    readonly ops: readonly CircuitHistoryOp[];

    // Semantic info for the entry
    readonly clientData: string;
}
export interface CircuitHistory extends Observable<CircuitHistoryEvent> {
    getUndoStack(): readonly CircuitHistoryEntry[];
    getRedoStack(): readonly CircuitHistoryEntry[];

    clear(): void;
}
