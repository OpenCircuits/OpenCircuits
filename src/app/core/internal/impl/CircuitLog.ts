import {GUID, uuid} from "core/schema/GUID";

import {CircuitOp} from "./CircuitOps";

// TODO: vet which arrays are useful here.  Potentially implement this as a class.
// The undo/redo system will drop "oldProposed" entries, then add "local" entries.
export interface LogEvent {
    clock: number;

    // Old proposed entries.  These entries may not have been accepted.
    oldProposed: LogEntry[];

    // Accepted entries.  These entries may be local/remote.
    accepted: LogEntry[];

    // Proposed local entries.  These entries are not accepted yet.
    proposed: LogEntry[];

    // List of ops to apply this event.
    ops: CircuitOp[];


    // Remote accepted entries.
    remote: LogEntry[];

    // Local accepted + proposed entries.
    local: LogEntry[];
}

// LogEntry's are IMMUTABLE. It's OK to hold onto LogEntry references, but their contents may not be up-to-date.
//  "id" identifies a log entry across mutations.  Update LogEntry references on LogEvents.
export interface LogEntry {
    id: GUID;
    ops: CircuitOp[];
    // TODO: semantic info used by the client, i.e. in the history box.
    // clientData: unknown;

    // Log metadata.
    // user: string;
    // time: undefined;
    clock: number;
}

export class CircuitLog {
    private readonly log: LogEntry[];
    private readonly cbs: Array<(evt: LogEvent) => void>;

    private localEntries: LogEntry[];


    public constructor() {
        this.log = [];
        this.cbs = [];
        this.localEntries = [];
    }

    public clock(): number {
        return this.log.length;
    }
    private proposeClock(): number {
        return this.clock() + this.localEntries.length;
    }

    // NOTE: call-sites of propose should expect possible re-entrant calls.
    public propose(ops: CircuitOp[]): void {
        // Propose "entry" with a strictly increasing clock
        const entry: LogEntry = { id: uuid(), ops, clock: this.proposeClock() };
        this.localEntries.push(entry);

        const evt: LogEvent = {
            clock:       this.clock(),
            oldProposed: this.localEntries.slice(0, -1),
            accepted:    [],
            proposed:    this.localEntries,
            ops:         ops,
            remote:      [],
            local:       this.localEntries,
        };
        this.cbs.forEach((cb) => cb(evt));

        // simulated "accept" logic.  Normally triggered by "acceptRemote"
        this.acceptLocal(entry);
    }

    public addListener(cb: (evt: LogEvent) => void): void {
        this.cbs.push(cb);
    }

    private acceptLocal(entry: LogEntry): void {
        if (entry.id !== this.localEntries[0].id)
            throw new Error("acceptLocal called in unexpected order!");

        entry.clock = this.clock();
        this.log.push(entry);
        this.localEntries = this.localEntries.slice(1);
    }

    // Backend response handler
    private acceptRemote(accepted: LogEntry[]): void {
        // TODO: accumulate event.
        const evt: LogEvent;

        // Assumes "accepted" is sorted by "clock"
        accepted.forEach((e) => {
            if (this.localEntries.length > 0 && e.id === this.localEntries[0].id) {
                // Local update was accepted
                this.acceptLocal(e);
            } else {
                // TODO: Remote update
            }

        });

        this.cbs.forEach((cb) => cb(evt));
    }

}
