import {Observable} from "core/public/utils/Observable";
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

// CircuitLog is a one-way history of a circuit.  Each LogEntry represents a sequence of primitive changes,
//  see CircuitOps types, that should be applied together.  Unlike the undo/redo model, entries are never removed from
//  the end of the log.  Each "undo" will add an entry that reverts a change and each "redo" will add an entry that
//  re-applies the change.  Entries may be trimmed from the start of the log to limit memory usage.
//
// Terminology used here is from the distributed systems field:
//  `clock`: A counter used to assign an order to LogEntries
//  `propose(...)`: This client proposes a local change to the server
//  `accept(...)`: The server has accepted one or more changes from other clients, or one from this client
//
export class CircuitLog extends Observable<LogEvent> {
    private readonly log: LogEntry[];

    private proposedEntries: LogEntry[];


    public constructor() {
        super();
        this.log = [];
        this.proposedEntries = [];
    }

    public get clock(): number {
        return this.log.length;
    }
    private proposeClock(): number {
        return this.clock + this.proposedEntries.length;
    }

    // NOTE: call-sites of propose should expect possible re-entrant calls.
    public propose(ops: CircuitOp[]): void {
        // Propose "entry" with a strictly increasing clock
        const entry: LogEntry = { id: uuid(), ops, clock: this.proposeClock() };
        this.proposedEntries.push(entry);

        const evt: LogEvent = {
            clock:       this.clock,
            oldProposed: this.proposedEntries.slice(0, -1),
            accepted:    [],
            proposed:    this.proposedEntries,
            ops:         ops,
            remote:      [],
            local:       this.proposedEntries,
        };
        this.publish(evt);

        // simulated "accept" logic.  Normally triggered by "acceptRemote"
        this.acceptLocal(entry);
    }

    private acceptLocal(entry: LogEntry): void {
        if (entry.id !== this.proposedEntries[0].id)
            throw new Error("acceptLocal called in unexpected order!");

        entry.clock = this.clock;
        this.log.push(entry);
        this.proposedEntries = this.proposedEntries.slice(1);
    }

    // Backend response handler
    private acceptRemote(accepted: LogEntry[]): void {
        // TODO: accumulate event.
        const evt: LogEvent;

        // Assumes "accepted" is sorted by "clock"
        accepted.forEach((e) => {
            if (this.proposedEntries.length > 0 && e.id === this.proposedEntries[0].id) {
                // Local update was accepted
                this.acceptLocal(e);
            } else {
                // TODO: Remote update
            }
        });

        this.publish(evt);
    }

}
