import {AddErrE}            from "core/utils/MultiError";
import {Result, ResultUtil} from "core/utils/Result";

import {Observable} from "core/utils/Observable";
import {Schema}     from "core/schema";
import {GUID}       from "core/schema/GUID";

import {CircuitLog, LogEntry}                            from "./CircuitLog";
import {CircuitOp, InvertCircuitOp, TransformCircuitOps} from "./CircuitOps";
import {PortConfig}                                      from "./ComponentInfo";
import {CircuitDocument, ReadonlyCircuitDocument}        from "./CircuitDocument";
import {FastCircuitDiff, FastCircuitDiffBuilder}         from "./FastCircuitDiff";


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
    public get doc(): ReadonlyCircuitDocument {
        return this.mutableDoc;
    }
    public readonly log: CircuitLog;
    private clock: number;

    // Keep track of multiple "begin"/"commit" pairs and only commit when counter reaches zero.
    private transactionCounter: number;
    private transactionOps: CircuitOp[];

    private diffBuilder: FastCircuitDiffBuilder;

    // Schemas
    protected camera: Schema.Camera;
    protected metadata: Schema.CircuitMetadata;

    public constructor(log: CircuitLog, doc: CircuitDocument) {
        super();
        this.mutableDoc = doc;

        this.log = log;
        this.clock = log.clock;

        this.transactionCounter = 0;
        this.transactionOps = [];

        this.diffBuilder = new FastCircuitDiffBuilder();

        this.camera = {
            x:    0,
            y:    0,
            zoom: 0.02,
        };

        this.metadata = { id: "", name: "", desc: "", thumb: "", version: "type/v0" };

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
        })
    }


    private publishDiffEvent() {
        const diff = this.diffBuilder.build();
        this.diffBuilder = new FastCircuitDiffBuilder();
        this.publish(diff);
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

    private endTransactionHelper<T>(f: (txOps: CircuitOp[]) => T): T | undefined {
        // To be safe for re-entrant calls, make sure the tx state is reset before proposing.
        this.transactionCounter = 0;
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
        this.transactionCounter++;
    }

    // "clientData" is arbitrary data the client can store in the Log for higher-level semantics than CircuitOps.
    public commitTransaction(clientData = ""): LogEntry | undefined {
        if (!this.isTransaction())
            throw new Error("Unexpected commitTransaction!");

        // Early return if this isn't the last "commit"
        if (--this.transactionCounter > 0)
            return

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
                }));
    }

    public setMetadata(newMetadata: Partial<Schema.CircuitMetadata>) {
        this.metadata = { ...this.metadata, ...newMetadata } as Schema.CircuitMetadata;
    }

    //
    // Revisit where this should go
    //

    public getCamera(): Readonly<Schema.Camera> {
        return this.camera;
    }

    public setCameraProps(props: Partial<Schema.Camera>) {
        this.camera.x = (props.x ?? this.camera.x);
        this.camera.y = (props.y ?? this.camera.y);
        this.camera.zoom = (props.zoom ?? this.camera.zoom);

        // TODO[model_refactor_api](idk) The camera changing is a very different kind of event than the others here.
        this.publish((new FastCircuitDiffBuilder()).build());
    }

    public getMetadata(): Readonly<Schema.CircuitMetadata> {
        return this.metadata;
    }
}
