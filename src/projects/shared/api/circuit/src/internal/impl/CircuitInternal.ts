import {AddErrE}            from "shared/api/circuit/utils/MultiError";
import {ErrE, OkVoid, Result, ResultUtil} from "shared/api/circuit/utils/Result";

import {Observable} from "shared/api/circuit/utils/Observable";
import {Schema}     from "shared/api/circuit/schema";
import {GUID}       from "shared/api/circuit/schema/GUID";

import {CircuitLog, LogEntry}                            from "./CircuitLog";
import {CircuitOp, InvertCircuitOp, TransformCircuitOps} from "./CircuitOps";
import {PortConfig}                                      from "./ComponentInfo";
import {CircuitDocument, ReadonlyCircuitDocument}        from "./CircuitDocument";
import {FastCircuitDiff, FastCircuitDiffBuilder}         from "./FastCircuitDiff";


export type InternalEvent = {
    type: "CircuitOp";
    diff: FastCircuitDiff;
}

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
export class CircuitInternal extends Observable<InternalEvent> {
    private readonly mutableDoc: CircuitDocument;
    public get doc(): ReadonlyCircuitDocument {
        return this.mutableDoc;
    }
    public readonly log: CircuitLog;
    private clock: number;

    private readonly undoStack: number[]; // Index in the `log` of the entry
    private redoStack: number[]; // Index in the `log` of the entry

    // Keep track of multiple "begin"/"commit" pairs and only commit when counter reaches zero.
    private transactionCounter: number;
    private transactionOps: CircuitOp[];

    private diffBuilder: FastCircuitDiffBuilder;

    // Schemas
    protected metadata: Schema.CircuitMetadata;

    // TODO[model_refactor](leon) - this is probably a hack, we most likely need to make this a transaction somehow
    protected icMetadata: Record<GUID, Schema.IntegratedCircuit["metadata"]>;

    public constructor(id: GUID, log: CircuitLog, doc: CircuitDocument) {
        super();
        this.mutableDoc = doc;

        this.log = log;
        this.clock = log.clock;

        this.transactionCounter = 0;
        this.transactionOps = [];

        this.undoStack = [];
        this.redoStack = [];

        this.diffBuilder = new FastCircuitDiffBuilder();

        this.metadata = { id, name: "", desc: "", thumb: "", version: "type/v0" };
        this.icMetadata = {};

        // NOTE: THIS IS _COMPLETELY UNUSED_ AT THE MOMENT SINCE THERE IS NO REMOTE
        this.log.subscribe((evt) => {
            this.clock = evt.clock;
            // Optimization: If there are no remote entries then the ops are already applied.
            if (evt.remote.length === 0)
                return;

            // Apply remote updates mid-transaction so this state is up-to-date.
            if (this.isTransaction())
                this.transformTransaction(evt.ops);
            else
                this.applyOpsChecked(evt.ops);

            // Emit event on remote updates
            this.publishDiffEvent();
        });
    }

    // NOTE THIS IS UNUSED SINCE THERE IS NO REMOTE
    private transformTransaction(ops: readonly CircuitOp[]): void {
        // Revert tx ops
        this.applyOpsChecked(this.transactionOps.map(InvertCircuitOp).reverse());

        // Apply ops
        this.applyOpsChecked(ops);

        // Transform tx ops
        TransformCircuitOps(this.transactionOps, ops)
            .uponErr(() => {
                // Failed to transform partial transaction, so cancel it and save the error.
                this.transactionCounter = 0;
                this.transactionOps = [];

                // TODO[model_refactor_api](kevin): propagate this error to the client.
                // this.transactionTransformError = e;
            })
            .uponOk((txOps) => {
                // Reapply tx ops
                this.transactionOps = txOps;
                this.applyOpsChecked(this.transactionOps);
            });
    }


    private publishDiffEvent() {
        const diff = this.diffBuilder.build();
        this.diffBuilder = new FastCircuitDiffBuilder();
        this.publish({ type: "CircuitOp", diff });
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

    //
    // Transaction interface
    //

    // We need "read-your-writes" so functions like "setProp" can correctly get tombstones like "oldVal".
    public beginTransaction(): void {
        this.transactionCounter++;
    }

    // "clientData" is arbitrary data the client can store in the Log for higher-level semantics than CircuitOps.
    public commitTransaction(clientData = ""): LogEntry | undefined {
        if (!this.isTransaction())
            throw new Error("Unexpected commitTransaction!");

        // Early return if this isn't the last "commit"
        if (--this.transactionCounter > 0)
            return;

        // To be safe for re-entrant calls, make sure the tx state is reset before proposing.
        this.transactionCounter = 0;
        if (this.transactionOps.length === 0)
            return;

        const txOps = this.transactionOps;
        this.transactionOps = [];
        // Sanity check: Clock should be kept updated by the event handler.
        if (this.clock !== this.log.clock)
            throw new Error(`Unexpected clock difference (${this.clock} vs ${this.log.clock})`
                            + ". Maybe a missed event?");

        // Add entry to undo stack and clear redo stack
        this.undoStack.push(this.log.length);
        this.redoStack = [];

        return this.log.propose(txOps, clientData);
    }

    public cancelTransaction(): void {
        // To be safe for re-entrant calls, make sure the tx state is reset before proposing.
        this.transactionCounter = 0;
        if (this.transactionOps.length === 0)
            return;

        const txOps = this.transactionOps;
        this.transactionOps = [];
        this.applyOpsChecked(txOps.reverse().map(InvertCircuitOp));
    }

    public undo(): Result {
        if (this.isTransaction())
            return ErrE("Cannot undo while currently within a transaction!");
        if (this.undoStack.length === 0)
            return OkVoid();

        const lastEntryIndex = this.undoStack.pop()!;
        this.redoStack.push(lastEntryIndex);
        this.applyOpsChecked(this.log.entries[lastEntryIndex].ops.map(InvertCircuitOp).reverse());

        return OkVoid();
    }

    public redo(): Result {
        if (this.isTransaction())
            return ErrE("Cannot redo while currently within a transaction!");
        if (this.redoStack.length === 0)
            return OkVoid();

        const lastEntryIndex = this.redoStack.pop()!;
        this.undoStack.push(lastEntryIndex);
        this.applyOpsChecked(this.log.entries[lastEntryIndex].ops);

        return OkVoid();
    }

    // Check this before working with long-running transactions.  Long-running transactions are any transaction that
    //  crosses an async/event boundary and some other task could have resumed in the mean time.
    public isTransaction(): boolean {
        return this.transactionCounter > 0;
    }


    //
    // Convenience functions around CircuitOps
    //

    protected addTransactionOp(op: CircuitOp): Result {
        this.beginTransaction();

        // read-your-writes
        return this.applyOp(op)
            .uponErr(() => this.cancelTransaction())
            .uponOk(() => {
                // Push only after successful op
                this.transactionOps.push(op);

                this.commitTransaction();

                // Emit event per-transaction-op
                this.publishDiffEvent();
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
            }).map(() => id)
            .uponErr(() => this.cancelTransaction());
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
                }))
            .uponErr(() => this.cancelTransaction());
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
            }).map(() => id)
            .uponErr(() => this.cancelTransaction());
    }

    public deleteWire(id: GUID): Result {
        return this.doc.getWireByID(id)
            .andThen((w) =>
                this.addTransactionOp({
                    kind:     "ConnectWireOp",
                    inverted: true,
                    w, // No copy needed
                }))
            .uponErr(() => this.cancelTransaction());
    }

    public setPropFor<
        O extends Schema.Obj,
        K extends keyof O["props"] & string
    >(id: GUID, key: K, newVal?: O["props"][K]): Result {
        // NOTE: applyOp will check the ComponentInfo that it is the correct type
        return this.doc.getObjByID(id)
            .andThen((obj) => this.addTransactionOp(
                { id, kind: "SetPropertyOp", key, oldVal: obj.props[key], newVal }))
            .uponErr(() => this.cancelTransaction());
    }

    public setPortConfig(id: GUID, portConfig: PortConfig): Result {
        return this.doc.getComponentAndInfoByID(id)
            .andThen(([_, info]) => info.makePortsForConfig(id, portConfig))
            .andThen((newPorts) => this.doc.getPortsForComponent(id)
                .andThen((oldPortIds) => {
                    const oldPorts = [...oldPortIds].map((portId) => this.doc.getPortByID(portId).unwrap());
                    const removedPorts = oldPorts.filter((port: Schema.Port) => (port.index >= portConfig[port.group]));

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
                }))
            .uponErr(() => this.cancelTransaction());
    }

    public removePortsFor(compId: GUID): Result {
        return this.doc.getPortsForComponent(compId)
            .andThen((oldPortIds) => {
                const oldPorts = [...oldPortIds].map((portID) => this.doc.getPortByID(portID).unwrap());

                // Deleted wires are all wires attached to ports with indices
                // at least as high as the new config's "count" for respective groups.
                const deadWires = oldPorts
                    .flatMap((removedPort) => [...this.doc.getWiresForPort(removedPort.id).unwrap()])
                    .map((removedWire) => this.doc.getWireByID(removedWire).unwrap());

                return this.addTransactionOp({
                    kind:         "SetComponentPortsOp",
                    inverted:     false,
                    component:    compId,
                    addedPorts:   [],
                    removedPorts: oldPorts,
                    deadWires,
                });
            })
            .uponErr(() => this.cancelTransaction());
    }

    public setMetadata(newMetadata: Partial<Schema.CircuitMetadata>) {
        this.metadata = { ...this.metadata, ...newMetadata } as Schema.CircuitMetadata;
    }

    public getMetadata(): Readonly<Schema.CircuitMetadata> {
        return this.metadata;
    }

    public setICMetadata(ic: GUID, newMetadata: Partial<Schema.IntegratedCircuit["metadata"]>) {
        this.icMetadata[ic] = {
            ...this.icMetadata[ic],
            ...newMetadata,
        };
    }

    public getICMetadata(ic: GUID): Readonly<Schema.IntegratedCircuit["metadata"]> {
        return this.icMetadata[ic];
    }
}
