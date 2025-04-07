import {ErrE, OkVoid, Result, ResultUtil} from "shared/api/circuit/utils/Result";

import {ObservableImpl} from "shared/api/circuit/utils/Observable";
import {Schema}     from "shared/api/circuit/schema";
import {GUID}       from "shared/api/circuit/schema/GUID";

import {CircuitLog}      from "./CircuitLog";
import {InvertCircuitOp} from "./CircuitOps";
import {PortConfig}      from "./ObjInfo";
import {CircuitDocument} from "./CircuitDocument";
import {FastCircuitDiff} from "./FastCircuitDiff";
import {AddErrE} from "../../utils/MultiError";


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
export class CircuitInternal extends ObservableImpl<InternalEvent> {
    private readonly doc: CircuitDocument;
    private readonly log: CircuitLog;

    private undoStack: number[]; // Index in the `log` of the entry
    private redoStack: number[]; // Index in the `log` of the entry

    public constructor(log: CircuitLog, doc: CircuitDocument) {
        super();

        this.doc = doc;

        this.log = log;

        this.undoStack = [];
        this.redoStack = [];

        this.doc.subscribe((ev) => {
            this.publish(ev);
        });

        // Subscribe to log to track events that change this circuit
        // When they, track in undo stack
        this.log.subscribe((ev) => {
            if (ev.accepted.length === 0)
                return;

            // TODO: What if multiple entries? (only matters for multi-edit)
            const [entry] = ev.accepted;
            if (entry.clientData === "undo" || entry.clientData === "redo") {
                // Don't consider undo/redo entries for the undo/redo history
                return;
            }

            // Add entry to undo stack and clear redo stack
            this.undoStack.push(ev.clock);
            this.redoStack = [];
        });
    }

    //
    // Convenience getters around CircuitDocument for this circuit
    //
    public hasIC(id: GUID) {
        return this.doc.getICInfo(id).ok;
    }
    public hasComp(id: GUID) {
        return this.doc.getCircuitInfo().hasComp(id);
    }
    public hasWire(id: GUID) {
        return this.doc.getCircuitInfo().hasWire(id);
    }
    public hasPort(id: GUID) {
        return this.doc.getCircuitInfo().hasPort(id);
    }

    public getMetadata(): Readonly<Schema.CircuitMetadata> {
        return this.doc.getCircuitInfo().metadata;
    }

    public getICInfo(id: GUID) {
        return this.doc.getICInfo(id);
    }
    public getObjByID(id: GUID) {
        return this.doc.getCircuitInfo().getObjByID(id);
    }
    public getCompByID(id: GUID) {
        return this.doc.getCircuitInfo().getCompByID(id);
    }
    public getWireByID(id: GUID) {
        return this.doc.getCircuitInfo().getWireByID(id);
    }
    public getPortByID(id: GUID) {
        return this.doc.getCircuitInfo().getPortByID(id);
    }

    public getPortsForComponent(id: GUID) {
        return this.doc.getCircuitInfo().getPortsForComponent(id);
    }
    public getPortsByGroup(id: GUID) {
        return this.doc.getCircuitInfo().getPortsByGroup(id);
    }
    public getPortConfig(id: GUID) {
        return this.doc.getCircuitInfo().getPortConfig(id);
    }
    public getWiresForPort(id: GUID) {
        return this.doc.getCircuitInfo().getWiresForPort(id);
    }
    public getPortsForPort(id: GUID) {
        return this.doc.getCircuitInfo().getPortsForPort(id);
    }

    public getComponentInfo(kind: string) {
        return this.doc.getCircuitInfo().getComponentInfo(kind);
    }
    public getComponentAndInfoById(id: string) {
        return this.doc.getCircuitInfo().getComponentAndInfoByID(id);
    }

    public getICs() {
        return this.doc.getICs();
    }
    public getObjs() {
        return this.doc.getCircuitInfo().getObjs();
    }
    public getComps() {
        return this.doc.getCircuitInfo().getComponents();
    }
    public getWires() {
        return this.doc.getCircuitInfo().getWires();
    }
    public getAllObjs() {
        return this.doc.getCircuitInfo().getAllObjs();
    }


    //
    // Convenience functions around CircuitOps
    //

    public beginTransaction() {
        this.doc.beginTransaction();
    }
    public cancelTransaction() {
        this.doc.cancelTransaction();
    }
    public commitTransaction() {
        this.doc.commitTransaction();
    }

    public undo(): Result {
        if (this.doc.isTransaction())
            return ErrE("Cannot undo while currently within a transaction!");
        if (this.undoStack.length === 0)
            return OkVoid();

        const lastEntryIndex = this.undoStack.pop()!;
        this.redoStack.push(lastEntryIndex);

        this.doc.beginTransaction();
        this.log.entries[lastEntryIndex].ops
            .map(InvertCircuitOp)
            .reverse()
            .forEach((op) => {
                // TODO: Might need to add a method that does all the ops at once
                // to avoid broadcasting a diff event for EACH operation
                this.doc.addTransactionOp(op);
            });
        this.doc.commitTransaction("undo");

        return OkVoid();
    }

    public redo(): Result {
        if (this.doc.isTransaction())
            return ErrE("Cannot redo while currently within a transaction!");
        if (this.redoStack.length === 0)
            return OkVoid();

        const lastEntryIndex = this.redoStack.pop()!;
        this.undoStack.push(lastEntryIndex);

        this.doc.beginTransaction();
        this.log.entries[lastEntryIndex].ops
            .forEach((op) => {
                // TODO: Might need to add a method that does all the ops at once
                // to avoid broadcasting a diff event for EACH operation
                this.doc.addTransactionOp(op);
            });
        this.doc.commitTransaction("redo");

        return OkVoid();
    }

    public clearHistory() {
        this.undoStack = [];
        this.redoStack = [];
    }

    public setMetadata(metadata: Partial<Schema.CircuitMetadata>) {
        this.doc.setMetadata(metadata);
    }

    public importObjs(objs: Schema.Obj[]): Result<void[]> {
        // Build component : ports[] map
        const portsForComp = new Map<GUID, Schema.Port[]>();
        objs.filter((obj) => (obj.baseKind === "Port"))
            .forEach((port) => {
                const parentPorts = portsForComp.getOrInsert(port.parent, () => []);
                parentPorts.push(port);
            });

        return ResultUtil.mapIter(
                objs.filter((obj) => (obj.baseKind === "Component")),
                (comp) =>
                    this.doc.addTransactionOp({
                        kind:     "PlaceComponentOp",
                        inverted: false,
                        c:        comp,
                    })
            )
            .andThen(() => ResultUtil.mapIter(
                portsForComp.entries(),
                ([compId, ports]) =>
                    this.doc.addTransactionOp({
                        kind:         "SetComponentPortsOp",
                        inverted:     false,
                        component:    compId,
                        addedPorts:   ports,
                        deadWires:    [],
                        removedPorts: [],
                    })
            ))
            .andThen(() => ResultUtil.mapIter(
                objs.filter((obj) => (obj.baseKind === "Wire")),
                (wire) =>
                    this.doc.addTransactionOp({
                        kind:     "ConnectWireOp",
                        inverted: false,
                        w:        wire,
                    })
            ))
            .mapErr(AddErrE("CircuitInternal.importObjs: failed!"))
            .uponErr(() => this.cancelTransaction());
    }

    public placeComponent(kind: string, props: Schema.Component["props"]): Result<GUID> {
        const id = Schema.uuid();
        return this.doc.addTransactionOp({
                kind:     "PlaceComponentOp",
                inverted: false,
                c:        {
                    baseKind: "Component",
                    kind:     kind,
                    id:       id,
                    props:    { ...props }, // Copy non-trivial object
                },
            }).map(() => id)
            .mapErr(AddErrE(`CircuitInternal.placeComponent: failed for ${kind}`))
            .uponErr(() => this.cancelTransaction());
    }

    // public replaceComponent(id: GUID, newKind: string): void {
    //     // TODO: Check that component's current port list is compatable with the "newKind" ComponentInfo
    //     // TODO: Maybe this needs a dedicated Op b/c updating kind isn't covered by `SetPropertyOp`
    //     throw new Error("Unimplemented");
    // }

    public deleteComponent(id: GUID): Result {
        return this.doc
            .getCircuitInfo()
            .getCompByID(id)
            .andThen((c) =>
                this.doc.addTransactionOp({
                    kind:     "PlaceComponentOp",
                    inverted: true,
                    c, // No copy needed
                }))
            .mapErr(AddErrE(`CircuitInternal.deleteComponent: failed for ${id}`))
            .uponErr(() => this.cancelTransaction());
    }

    public connectWire(kind: string, p1: GUID, p2: GUID, props: Schema.Wire["props"] = {}): Result<GUID> {
        const id = Schema.uuid();
        return this.doc
            .addTransactionOp({
                kind:     "ConnectWireOp",
                inverted: false,
                w:        {
                    baseKind: "Wire",
                    props:    { ...props }, // Copy non-trivial object
                    kind, id, p1, p2,
                },
            }).map(() => id)
            .mapErr(AddErrE(`CircuitInternal.connectWire: failed for ${id}`))
            .uponErr(() => this.cancelTransaction());
    }

    public deleteWire(id: GUID): Result {
        return this.doc
            .getCircuitInfo()
            .getWireByID(id)
            .andThen((w) =>
                this.doc.addTransactionOp({
                    kind:     "ConnectWireOp",
                    inverted: true,
                    w, // No copy needed
                }))
            .mapErr(AddErrE(`CircuitInternal.deleteWire: failed for ${id}`))
            .uponErr(() => this.cancelTransaction());
    }

    public setPropFor<
        O extends Schema.Obj,
        K extends keyof O["props"] & string
    >(id: GUID, key: K, newVal?: O["props"][K]): Result {
        // NOTE: applyOp will check the ComponentInfo that it is the correct type
        return this.doc
            .getCircuitInfo()
            .getObjByID(id)
            .andThen((obj) =>
                this.doc.addTransactionOp({
                    id,
                    ic:     false,
                    kind:   "SetPropertyOp",
                    key,
                    oldVal: obj.props[key],
                    newVal,
                }))
            .mapErr(AddErrE(`CircuitInternal.setPropFor: failed for ${id}`))
            .uponErr(() => this.cancelTransaction());
    }
    public setPropForIC<
        K extends ("name" | "displayWidth" | "displayHeight" | `pins.${number}.${"x" | "y" | "dx" | "dy"}`),
    >(
        id: GUID,
        key: K,
        newVal: (K extends "name" ? string : number),
    ): Result {
        // NOTE: applyOp will check the ComponentInfo that it is the correct type
        return this.doc
            .getICInfo(id)
            .andThen((ic) => {
                // TODO: This sucks to write
                const oldVal = (() => {
                    if (key === "name") {
                        return ic.metadata.name;
                    } else if (key === "displayWidth") {
                        return ic.metadata.displayWidth;
                    } else if (key === "displayHeight") {
                        return ic.metadata.displayHeight;
                    }
                    const [_, idx, k2] = key.split(".");
                    return ic.metadata.pins[parseInt(idx)][k2 as "x" | "y" | "dx" | "dy"];
                })();

                return this.doc.addTransactionOp({
                    kind: "SetPropertyOp",
                    id,
                    ic:   true,
                    key,
                    oldVal,
                    newVal,
                })
            })
            .mapErr(AddErrE(`CircuitInternal.setPropForIC: failed for ${id}`))
            .uponErr(() => this.cancelTransaction());
    }

    public setPortConfig(id: GUID, portConfig: PortConfig): Result {
        const circuit = this.doc.getCircuitInfo();
        return circuit
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

                    return this.doc.addTransactionOp({
                        kind:       "SetComponentPortsOp",
                        inverted:   false,
                        component:  id,
                        addedPorts: [...addedPortsMap.values()],
                        removedPorts,
                        deadWires,
                    });
                }))
            .mapErr(AddErrE(`CircuitInternal.setPortConfig: failed for ${id}`))
            .uponErr(() => this.cancelTransaction());
    }

    public removePortsFor(compId: GUID): Result {
        const circuit = this.doc.getCircuitInfo();
        return circuit
            .getPortsForComponent(compId)
            .andThen((oldPortIds) => {
                const oldPorts = [...oldPortIds].map((portID) => circuit.getPortByID(portID).unwrap());

                // Deleted wires are all wires attached to ports with indices
                // at least as high as the new config's "count" for respective groups.
                const deadWires = oldPorts
                    .flatMap((removedPort) => [...circuit.getWiresForPort(removedPort.id).unwrap()])
                    .map((removedWire) => circuit.getWireByID(removedWire).unwrap());

                return this.doc.addTransactionOp({
                    kind:         "SetComponentPortsOp",
                    inverted:     false,
                    component:    compId,
                    addedPorts:   [],
                    removedPorts: oldPorts,
                    deadWires,
                });
            })
            .mapErr(AddErrE(`CircuitInternal.removePortsFor: failed for ${compId}`))
            .uponErr(() => this.cancelTransaction());
    }

    public createIC(ic: Schema.IntegratedCircuit): Result {
        return this.doc
            .addTransactionOp({
                kind:     "CreateICOp",
                inverted: false,
                ic, // TODO: Maybe copy?
            })
            .mapErr(AddErrE(`CircuitInternal.createIC: failed for ${ic.metadata.id}`))
            .uponErr(() => this.cancelTransaction());
    }

    public deleteIC(id: GUID): Result {
        return this.doc
            .getICInfo(id)
            .andThen((ic) =>
                this.doc.addTransactionOp({
                    kind:     "CreateICOp",
                    inverted: true,
                    ic:       {
                        metadata: ic.metadata,
                        objects:  [...ic.getAllObjs()],
                    },
                }))
            .mapErr(AddErrE(`CircuitInternal.deleteIC: failed for ${id}`))
            .uponErr(() => this.cancelTransaction());
    }
}
