import {ErrE, OkVoid, Result} from "shared/api/circuit/utils/Result";

import {Observable} from "shared/api/circuit/utils/Observable";
import {Schema}     from "shared/api/circuit/schema";
import {GUID}       from "shared/api/circuit/schema/GUID";

import {CircuitLog}                               from "./CircuitLog";
import {InvertCircuitOp}                          from "./CircuitOps";
import {PortConfig}                               from "./ComponentInfo";
import {CircuitDocument, ReadonlyCircuitDocument} from "./CircuitDocument";
import {FastCircuitDiff}                          from "./FastCircuitDiff";


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
    private readonly id: GUID;

    private readonly mutableDoc: CircuitDocument;
    private get doc(): ReadonlyCircuitDocument {
        return this.mutableDoc;
    }
    public readonly log: CircuitLog;

    private readonly undoStack: number[]; // Index in the `log` of the entry
    private redoStack: number[]; // Index in the `log` of the entry

    // // Schemas
    // protected metadata: Schema.CircuitMetadata;

    // TODO[model_refactor](leon) - this is probably a hack, we most likely need to make this a transaction somehow
    // protected icMetadata: Record<GUID, Schema.IntegratedCircuit["metadata"]>;

    public constructor(id: GUID, log: CircuitLog, doc: CircuitDocument) {
        super();

        this.id = id;

        this.mutableDoc = doc;

        this.log = log;

        this.undoStack = [];
        this.redoStack = [];

        this.mutableDoc.subscribe(({ circuit, diff }) => {
            if (circuit !== this.id)
                return;
            this.publish({
                type: "CircuitOp",
                diff,
            });
        });

        // Subscribe to log to track events that change this circuit
        // When they, track in undo stack
        this.log.subscribe((ev) => {
            if (ev.ops.some((op) => (op.circuit === this.id))) {
                // Add entry to undo stack and clear redo stack
                this.undoStack.push(this.log.length);  // use ev.clock?
                this.redoStack = [];
            }
        });

        // this.metadata = { id, name: "", desc: "", thumb: "", version: "type/v0" };
        // this.icMetadata = {};
    }

    //
    // Convenience getters around CircuitDocument for this circuit
    //

    public hasComp(id: GUID) {
        return this.doc.getCircuitInfo(this.id).unwrap().hasComp(id);
    }
    public hasWire(id: GUID) {
        return this.doc.getCircuitInfo(this.id).unwrap().hasWire(id);
    }
    public hasPort(id: GUID) {
        return this.doc.getCircuitInfo(this.id).unwrap().hasPort(id);
    }

    public getObjByID(id: GUID) {
        return this.doc.getCircuitInfo(this.id).unwrap().getObjByID(id);
    }
    public getCompByID(id: GUID) {
        return this.doc.getCircuitInfo(this.id).unwrap().getCompByID(id);
    }
    public getWireByID(id: GUID) {
        return this.doc.getCircuitInfo(this.id).unwrap().getWireByID(id);
    }
    public getPortByID(id: GUID) {
        return this.doc.getCircuitInfo(this.id).unwrap().getPortByID(id);
    }

    public getPortsForComponent(id: GUID) {
        return this.doc.getCircuitInfo(this.id).unwrap().getPortsForComponent(id);
    }
    public getPortsByGroup(id: GUID) {
        return this.doc.getCircuitInfo(this.id).unwrap().getPortsByGroup(id);
    }
    public getWiresForPort(id: GUID) {
        return this.doc.getCircuitInfo(this.id).unwrap().getWiresForPort(id);
    }

    public getComponentInfo(kind: string) {
        return this.doc.getCircuitInfo(this.id).unwrap().getComponentInfo(kind);
    }

    public getObjs() {
        return this.doc.getCircuitInfo(this.id).unwrap().getObjs();
    }
    public getAllObjs() {
        return this.doc.getCircuitInfo(this.id).unwrap().getAllObjs();
    }


    //
    // Convenience functions around CircuitOps
    //

    public beginTransaction() {
        this.mutableDoc.beginTransaction();
    }
    public cancelTransaction() {
        this.mutableDoc.cancelTransaction();
    }
    public commitTransaction() {
        this.mutableDoc.commitTransaction();
        // if (this.mutableDoc.commitTransaction()) {
        //     // Add entry to undo stack and clear redo stack
        //     this.undoStack.push(this.log.length - 1);
        //     this.redoStack = [];
        // }
    }

    public undo(): Result {
        if (this.mutableDoc.isTransaction())
            return ErrE("Cannot undo while currently within a transaction!");
        if (this.undoStack.length === 0)
            return OkVoid();

        const lastEntryIndex = this.undoStack.pop()!;
        this.redoStack.push(lastEntryIndex);

        const ops = this.log.entries[lastEntryIndex].ops
            .filter((op) => (op.circuit === this.id))
            .map(InvertCircuitOp)
            .reverse();
        this.mutableDoc["applyOpsChecked"](ops);
        this.mutableDoc["publishDiffEvent"](this.id);
            // .forEach((op) => {
            //     // TODO: Might need to add a method that does all the ops at once
            //     // to avoid broadcasting a diff event for EACH operation
            //     this.mutableDoc.addTransactionOp(op);
            // });

        return OkVoid();
    }

    public redo(): Result {
        if (this.mutableDoc.isTransaction())
            return ErrE("Cannot redo while currently within a transaction!");
        if (this.redoStack.length === 0)
            return OkVoid();

        const lastEntryIndex = this.redoStack.pop()!;
        this.undoStack.push(lastEntryIndex);

        const ops = this.log.entries[lastEntryIndex].ops
            .filter((op) => (op.circuit === this.id));
            // .forEach((op) => {
            //     // TODO: Might need to add a method that does all the ops at once
            //     // to avoid broadcasting a diff event for EACH operation
            //     this.mutableDoc.addTransactionOp(op);
            // });
        this.mutableDoc["applyOpsChecked"](ops);
        this.mutableDoc["publishDiffEvent"](this.id);

        return OkVoid();
    }

    public placeComponent(kind: string, props: Schema.Component["props"]): Result<GUID> {
        const id = Schema.uuid();
        return this.mutableDoc.addTransactionOp({
                kind:     "PlaceComponentOp",
                circuit:  this.id,
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
        return this.doc
            .getCircuitInfo(this.id)
            .andThen((circuit) => circuit
                .getCompByID(id)
                .andThen((c) =>
                    this.mutableDoc.addTransactionOp({
                        kind:     "PlaceComponentOp",
                        circuit:  this.id,
                        inverted: true,
                        c, // No copy needed
                    })))
            .uponErr(() => this.cancelTransaction());
    }

    public connectWire(kind: string, p1: GUID, p2: GUID, props: Schema.Wire["props"] = {}): Result<GUID> {
        const id = Schema.uuid();
        return this.mutableDoc
            .addTransactionOp({
                kind:     "ConnectWireOp",
                circuit:  this.id,
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
        return this.doc
            .getCircuitInfo(this.id)
            .andThen((circuit) => circuit
                .getWireByID(id)
                .andThen((w) =>
                    this.mutableDoc.addTransactionOp({
                        kind:     "ConnectWireOp",
                        circuit:  this.id,
                        inverted: true,
                        w, // No copy needed
                    })))
            .uponErr(() => this.cancelTransaction());
    }

    public setPropFor<
        O extends Schema.Obj,
        K extends keyof O["props"] & string
    >(id: GUID, key: K, newVal?: O["props"][K]): Result {
        // NOTE: applyOp will check the ComponentInfo that it is the correct type
        return this.doc
            .getCircuitInfo(this.id)
            .andThen((circuit) => circuit
                .getObjByID(id)
                .andThen((obj) => this.mutableDoc.addTransactionOp({
                    id,
                    circuit: this.id,
                    kind:    "SetPropertyOp",
                    key,
                    oldVal:  obj.props[key],
                    newVal,
                })))
            .uponErr(() => this.cancelTransaction());
    }

    public setPortConfig(id: GUID, portConfig: PortConfig): Result {
        return this.doc
            .getCircuitInfo(this.id)
            .andThen((circuit) => circuit
                .getComponentAndInfoByID(id)
                .andThen(([_, info]) => info.makePortsForConfig(id, portConfig))
                .andThen((newPorts) => circuit.getPortsForComponent(id)
                    .andThen((oldPortIds) => {
                        const oldPorts = [...oldPortIds].map((portId) => circuit.getPortByID(portId).unwrap());
                        const removedPorts = oldPorts.filter(
                            (port: Schema.Port) => (port.index >= portConfig[port.group]));

                        // Deleted wires are all wires attached to ports with indices
                        // at least as high as the new config's "count" for respective groups.
                        const deadWires = removedPorts
                            .flatMap((removedPort) => [...circuit.getWiresForPort(removedPort.id).unwrap()])
                            .map((removedWire) => circuit.getWireByID(removedWire).unwrap());

                        const s = (port: Schema.Port) => `${port.group}_${port.index}`;

                        // Subtracting the existing ports from the new ports yields only the ports that were added.
                        const addedPortsMap = new Map(newPorts.map((p) => [s(p), p]));
                        oldPorts.forEach((oldPort) => addedPortsMap.delete(s(oldPort)));

                        return this.mutableDoc.addTransactionOp({
                            kind:       "SetComponentPortsOp",
                            circuit:    this.id,
                            inverted:   false,
                            component:  id,
                            addedPorts: [...addedPortsMap.values()],
                            removedPorts,
                            deadWires,
                        });
                    })))
            .uponErr(() => this.cancelTransaction());
    }

    public removePortsFor(compId: GUID): Result {
        return this.doc
            .getCircuitInfo(this.id)
            .andThen((circuit) => circuit
                .getPortsForComponent(compId)
                .andThen((oldPortIds) => {
                    const oldPorts = [...oldPortIds].map((portID) => circuit.getPortByID(portID).unwrap());

                    // Deleted wires are all wires attached to ports with indices
                    // at least as high as the new config's "count" for respective groups.
                    const deadWires = oldPorts
                        .flatMap((removedPort) => [...circuit.getWiresForPort(removedPort.id).unwrap()])
                        .map((removedWire) => circuit.getWireByID(removedWire).unwrap());

                    return this.mutableDoc.addTransactionOp({
                        kind:         "SetComponentPortsOp",
                        circuit:      this.id,
                        inverted:     false,
                        component:    compId,
                        addedPorts:   [],
                        removedPorts: oldPorts,
                        deadWires,
                    });
                }))
            .uponErr(() => this.cancelTransaction());
    }

    public setMetadata(newMetadata: Partial<Schema.CircuitMetadata>) {
        return this.mutableDoc.setMetadataFor(this.id, newMetadata);
    }

    public getMetadata(): Result<Readonly<Schema.CircuitMetadata>> {
        return this.doc.getCircuitInfo(this.id)
            .map((c) => c.metadata);
    }
}
