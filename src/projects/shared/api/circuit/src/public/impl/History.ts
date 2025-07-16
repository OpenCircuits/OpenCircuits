import {CircuitInternal} from "shared/api/circuit/internal";

import {CircuitHistory, CircuitHistoryEvent} from "../History";

import {ObservableImpl} from "../../utils/Observable";
import {LogEntry} from "../../internal/impl/CircuitLog";


export class HistoryImpl extends ObservableImpl<CircuitHistoryEvent> implements CircuitHistory {
    protected readonly internal: CircuitInternal;

    public constructor(internal: CircuitInternal) {
        super();

        this.internal = internal;

        this.internal["log"].subscribe((ev) => {
            if (ev.accepted.length === 0)
                return;
            this.publish({ type: "change" });
        })
    }

    public getUndoStack(): readonly LogEntry[] {
        return this.internal.getUndoHistory();
    }
    public getRedoStack(): readonly LogEntry[] {
        return this.internal.getRedoHistory();
    }
    public clear(): void {
        return this.internal.clearHistory();
    }
}
