import {AddErrE}            from "core/utils/MultiError";
import {Result, ResultUtil} from "core/utils/Result";

import {GUID} from "core/schema/GUID";

import {Schema} from "../../schema";

import {CircuitLog, LogEntry}                            from "./CircuitLog";
import {CircuitOp, InvertCircuitOp, TransformCircuitOps} from "./CircuitOps";
import {PortConfig}                                      from "./ComponentInfo";
import {Observable}                                      from "core/utils/Observable";
import {CircuitDocument, ReadonlyCircuitDocument}        from "./CircuitDocument";
import {FastCircuitDiff, FastCircuitDiffBuilder}         from "./CircuitDiff";


// CircuitInternal is a low-level session for editing a circuit.  It encapsulates the CircuitDocument and the CircuitLog
// to provide a transaction mechanism for building LogEntries.  It also provides a higher-level interface for producing
// legal CircuitOps based on the desired change and the CircuitDocument state.
//
// REFERENCE POLICY:
//  OUTGOING REFERENCES:
//      1. GUIDs: Retain these to reference Objects at a later time.
//      2. Schema types: Guaranteed not to change, but MUST NOT be modified.
//  INCOMING REFERENCES:
//      1. GUIDs: Accepted as the primary reference type.
//      2. Non-trivial types: No incoming references are retained.
// EXCEPTION POLICY:
//  ERRORS: thrown during unexpected, exceptional, irrecoverable scenarios
//  OTHERWISE: The "Result" and "Option" types are used to communicate success/failure.
export class CircuitInternal extends Observable<FastCircuitDiff> {
    private readonly mutableDoc: CircuitDocument;
    public readonly doc: ReadonlyCircuitDocument;
    public readonly log: CircuitLog;
    private clock: number;

    private transaction: boolean;
    private transactionOps: CircuitOp[];

    private readonly diffBuilder: FastCircuitDiffBuilder;

    public constructor(log: CircuitLog, doc: CircuitDocument) {
        super()
        this.mutableDoc = doc;
        this.doc = doc;

        this.log = log;
        this.clock = log.clock;

        this.transaction = false;
        this.transactionOps = [];

        this.diffBuilder = new FastCircuitDiffBuilder();

        this.log.subscribe((evt) => {
            this.clock = evt.clock;
            // Optimization: If there are no remote entries then the ops are already applied.
            if (evt.remote.length === 0)
                return;

            // Apply remote updates mid-transaction so this state is up-to-date.
            if (this.transaction)
                this.transformTransaction(evt.ops);
            else
                this.applyOpsChecked(evt.ops);

            // Emit event on remote updates
            this.publish(this.diffBuilder.build());
        })
    }


    private applyOp(op: CircuitOp): Result {
        return this.mutableDoc.applyOp(op)
            .map(() => this.diffBuilder.applyOp(op));
    }

    private applyOpsChecked(ops: readonly CircuitOp[]): void {
        // TODO: If any exceptions are thrown by applying server-provided ops, this is a BUG
        //  and the site should force reload to get back to a consistent state.
        ResultUtil.mapIter(ops.values(), (op) => this.applyOp(op))
            .mapErr(AddErrE("Internal applyOp failed!  Client state is inconsistent!"))
            .unwrap();
    }

    private transformTransaction(ops: readonly CircuitOp[]): void {
        // Revert tx ops
        this.applyOpsChecked(this.transactionOps.map(InvertCircuitOp).reverse());

        // Apply ops
        this.applyOpsChecked(ops);

        // Transform tx ops
        const transformedTx = TransformCircuitOps(this.transactionOps, ops);

        if (transformedTx) {
            // Reapply tx ops
            this.applyOpsChecked(this.transactionOps);
        } else {
            // Failed to transform partial transaction, so cancel it
            this.transactionOps = [];
            this.transaction = false;
        }
    }

    private assertTransactionState(state: boolean): void {
        if (this.transaction !== state)
            throw new Error(`Unexpectedly in transaction state ${this.transaction}`);
    }

    private endTransactionHelper<T>(f: (txOps: CircuitOp[]) => T): T | undefined {
        this.assertTransactionState(true);

        // To be safe for re-entrant calls, make sure the tx state is reset before proposing.
        this.transaction = false;
        if (this.transactionOps.length > 0) {
            const txOps = this.transactionOps;
            this.transactionOps = [];
            return f(txOps);
        }
    }

    //
    // Transaction interface
    //

    // We need "read-your-writes" so functions like "setProp" can correctly get tombstones like "oldVal".
    public beginTransaction(): void {
        this.assertTransactionState(false);
        this.transaction = true;
    }

    // "clientData" is arbitrary data the client can store in the Log for higher-level semantics than CircuitOps.
    public commitTransaction(clientData = ""): LogEntry | undefined {
        return this.endTransactionHelper((txOps) => {
            // Sanity check: Clock should be kept updated by the event handler.
            if (this.clock !== this.log.clock)
                throw new Error(`Unexpected clock difference (${this.clock} vs ${this.log.clock})`
                                + ". Maybe a missed event?");
            return this.log.propose(txOps, clientData);
        });
    }

    public cancelTransaction(): void {
        this.endTransactionHelper((txOps) => {
            this.applyOpsChecked(txOps.reverse().map(InvertCircuitOp));
        });
    }

    // Check this before working with long-running transactions.  Long-running transactions are any transaction that
    //  crosses an async/event boundary and some other task could have resumed in the mean time.
    public isTransaction(): boolean {
        return this.transaction;
    }


    //
    // Convenience functions around CircuitOps
    //

    protected addTransactionOp(op: CircuitOp): Result {
        this.assertTransactionState(true);

        // read-your-writes
        return this.applyOp(op)
            .uponErr(() => this.cancelTransaction())
            .uponOk(() => {
                // Push only after successful op
                this.transactionOps.push(op);

                // Emit event per-transaction-op
                this.publish(this.diffBuilder.build());
            });
    }

    public placeComponent(kind: string, props: Schema.Component["props"]): Result<GUID> {
        const id = Schema.uuid();
        return this.addTransactionOp({
            kind:     "PlaceComponentOp",
            inverted: false,
            c:        {
                baseKind: "Component",
                kind:     kind,
                id:       id,
                props:    { ...props }, // Copy non-trivial object
            },
        }).map(() => id);
    }

    // public replaceComponent(id: GUID, newKind: string): void {
    //     // TODO: Check that component's current port list is compatable with the "newKind" ComponentInfo
    //     // TODO: Maybe this needs a dedicated Op b/c updating kind isn't covered by `SetPropertyOp`
    //     throw new Error("Unimplemented");
    // }

    public deleteComponent(id: GUID): Result {
        return this.doc.getCompByID(id)
            .andThen((c) =>
                this.addTransactionOp({
                    kind:     "PlaceComponentOp",
                    inverted: true,
                    c, // No copy needed
                }));
    }

    public connectWire(kind: string, p1: GUID, p2: GUID, props: Schema.Wire["props"] = {}): Result<GUID> {
        const id = Schema.uuid();
        return this.addTransactionOp({
            kind:     "ConnectWireOp",
            inverted: false,
            w:        {
                baseKind: "Wire",
                props:    { ...props }, // Copy non-trivial object
                kind, id, p1, p2,
            },
        }).map(() => id);
    }

    public deleteWire(id: GUID): Result {
        return this.doc.getWireByID(id)
            .andThen((w) =>
                this.addTransactionOp({
                    kind:     "ConnectWireOp",
                    inverted: true,
                    w, // No copy needed
                }));
    }

    public setPropFor<
        O extends Schema.Obj,
        K extends keyof O["props"] & string
    >(id: GUID, key: K, newVal?: O["props"][K]): Result {
        // NOTE: applyOp will check the ComponentInfo that it is the correct type
        return this.doc.getObjByID(id)
            .andThen((obj) => this.addTransactionOp(
                { id, kind: "SetPropertyOp", key, oldVal: obj.props[key], newVal }));
    }

    public setPortConfig(id: GUID, portConfig: PortConfig): Result {
        return this.doc.getComponentAndInfoByID(id)
            .andThen(([_, info]) => info.makePortsForConfig(id, portConfig))
            .andThen((newPorts) => this.doc.getPortsForComponent(id)
                .andThen((oldPortIDs) => {
                    const oldPorts = [...oldPortIDs].map((portID) => this.doc.getPortByID(portID).unwrap());
                    const removedPorts = oldPorts.filter((port: Schema.Port) => port.index >= portConfig[port.group]);

                    // Deleted wires are all wires attached to ports with indices
                    // at least as high as the new config's "count" for respective groups.
                    const deadWires = removedPorts
                        .flatMap((removedPort) => [...this.doc.getWiresForPort(removedPort.id).unwrap()])
                        .map((removedWire) => this.doc.getWireByID(removedWire).unwrap());

                    const s = (port: Schema.Port) => `${port.group}_${port.index}`;

                    // Subtracting the existing ports from the new ports yields only the ports that were added.
                    const addedPortsMap = new Map(newPorts.map((p) => [s(p), p]));
                    oldPorts.forEach((oldPort) => addedPortsMap.delete(s(oldPort)));

                    return this.addTransactionOp({
                        kind:       "SetComponentPortsOp",
                        inverted:   false,
                        component:  id,
                        addedPorts: [...addedPortsMap.values()],
                        removedPorts,
                        deadWires,
                    });
                }));
    }
}
