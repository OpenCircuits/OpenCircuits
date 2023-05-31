import {Observable} from "core/utils/Observable";

import {GUID, uuid} from "core/schema/GUID";

import {CircuitOp} from "./CircuitOps";

// TODO: vet which arrays are useful here.  Potentially implement this as a class.
// The undo/redo system will drop "oldProposed" entries, then add "local" entries.
export interface LogEvent {
    clock: number;

    // Old proposed entries.  These entries may not have been accepted.
    oldProposed: ReadonlyArray<Readonly<LogEntry>>;

    // Accepted entries.  These entries may be local/remote.
    accepted: ReadonlyArray<Readonly<LogEntry>>;

    // Proposed local entries.  These entries are not accepted yet.
    proposed: ReadonlyArray<Readonly<LogEntry>>;

    // List of ops to apply this event.
    ops: ReadonlyArray<Readonly<CircuitOp>>;

    // Remote accepted entries.
    remote: ReadonlyArray<Readonly<LogEntry>>;

    // Local accepted + proposed entries.
    local: ReadonlyArray<Readonly<LogEntry>>;
}

// LogEntry's are IMMUTABLE. It's OK to hold onto LogEntry references, but their contents may not be up-to-date.
// Update LogEntry references on LogEvents.
export interface LogEntry {
    // Identifies a log entry across mutations.
    id: GUID;

    // Log metadata.
    // user: string;
    // time: undefined;
    clock: number;

    ops: ReadonlyArray<Readonly<CircuitOp>>;

    // semantic info used by the client, i.e. in the history box.
    clientData: string;
}

interface ProposedLogEntry {
    id: GUID;

    // Log metadata.
    // user: string;
    // time: undefined;
    clock: number;

    // Elements are mutable since transformations may be required.
    ops: readonly CircuitOp[];
    clientData: string;
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

    private proposedEntries: ProposedLogEntry[];


    public constructor() {
        super();
        this.log = [];
        this.proposedEntries = [];
    }

    // The last accepted log entry's clock.  -1 if empty.
    public get clock(): number {
        return this.log.length - 1;
    }

    // NOTE: call-sites of propose should expect possible re-entrant calls.
    public propose(ops: CircuitOp[], clientData: string): LogEntry {
        // Propose "entry" with an invalid clock.  The server will provide a clock.
        const entry: ProposedLogEntry = { id: uuid(), clock: -1, ops, clientData };
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

        return entry;
    }

    private acceptLocal(entry: LogEntry): void {
        if (entry.id !== this.proposedEntries[0].id)
            throw new Error("acceptLocal called in unexpected order!");

        entry.clock = this.clock + 1;
        this.log.push(entry);
        const oldProposed = this.proposedEntries;
        this.proposedEntries = this.proposedEntries.slice(1);

        // TODO: This would happen in "acceptRemote" normally
        const evt: LogEvent = {
            clock:    this.clock,
            oldProposed,
            accepted: [entry],
            proposed: this.proposedEntries,
            ops:      [], // TODO: this would unwind "oldProposed", apply "accepted", apply "proposed".
            remote:   [],
            local:    oldProposed,
        };
        this.publish(evt);
    }

    // Backend response handler
    private acceptRemote(accepted: LogEntry[]): void {
        // TODO: accumulate event.
        const evt: LogEvent = undefined as unknown as LogEvent;

        // Assumes "accepted" is sorted by "clock"
        accepted.forEach((e) => {
            if (this.proposedEntries.length > 0 && e.id === this.proposedEntries[0].id) {
                // TODO: Local update was accepted
                ((a) => {a})(undefined);
            } else {
                // TODO: Remote update
                ((b) => {b})(undefined);
            }
        });

        this.publish(evt);
    }

}
