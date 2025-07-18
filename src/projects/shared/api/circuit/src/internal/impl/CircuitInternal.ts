import {ErrE, OkVoid, Result, ResultUtil} from "shared/api/circuit/utils/Result";

import {ObservableImpl} from "shared/api/circuit/utils/Observable";
import {GUID, Schema} from "shared/api/circuit/schema";
import {uuid}         from "shared/api/circuit/schema/GUID";

import {LogEntryType}      from "./CircuitLog";
import {InvertCircuitOp, UpdateICMetadataOp} from "./CircuitOps";
import {ComponentConfigurationInfo, PortConfig, PortConfigurationInfo, WireConfigurationInfo}      from "./ObjInfo";
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

    private undoStack: number[]; // Index in the `log` of the entry
    private redoStack: number[]; // Index in the `log` of the entry

    public constructor(doc: CircuitDocument) {
        super();

        this.doc = doc;

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
            if (entry.type !== LogEntryType.NORMAL) {
                // Don't consider undo/redo entries for the undo/redo history
                return;
            }

            // Add entry to undo stack and clear redo stack
            this.undoStack.push(ev.clock);
            this.redoStack = [];
        });
    }

    private get log() {
        return this.doc.log;
    }

    //
    // Convenience getters around CircuitDocument for this circuit
    //
    public hasIC(id: GUID) {
        return this.doc.hasIC(id);
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
    public isIC(c: Schema.Component): c is Schema.Component & { icId: GUID } {
        return this.doc.isIC(c);
    }

    public getMetadata(): Readonly<Schema.CircuitMetadata> {
        return this.doc.getCircuitInfo().metadata;
    }
    public getCamera(): Readonly<Schema.Camera> {
        return this.doc.getCircuitInfo().camera;
    }

    public getInfo() {
        return this.doc.getCircuitInfo();
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

    public getAllWiresForComponent(id: GUID) {
        return this.doc.getCircuitInfo().getPortsForComponent(id)
            .andThen((ports) =>
                ResultUtil.reduceIter(
                    new Set<GUID>(),
                    ports,
                    (prev, portId) =>
                        this.doc.getCircuitInfo().getWiresForPort(portId)
                            .map((set) => prev.union(set))));
    }
    public getPortsForComponent(id: GUID) {
        return this.doc.getCircuitInfo().getPortsForComponent(id);
    }
    public getPortsByGroup(id: GUID) {
        return this.doc.getCircuitInfo().getPortsByGroup(id);
    }
    public getPortsForGroup(id: GUID, group: string) {
        return this.doc.getCircuitInfo().getPortsForGroup(id, group);
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

    public getComponentInfo(kind: "IC" | string, icId?: GUID): Result<ComponentConfigurationInfo> {
        if (kind === "IC" && icId)
            return this.doc.getCircuitInfo().getComponentInfo(kind, icId);
        return this.doc.getCircuitInfo().getComponentInfo(kind);
    }
    public getWireInfo(kind: string): Result<WireConfigurationInfo> {
        return this.doc.getCircuitInfo().getWireInfo(kind);
    }
    public getPortInfo(kind: string): Result<PortConfigurationInfo> {
        return this.doc.getCircuitInfo().getPortInfo(kind);
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

    public beginTransaction(options?: { batch?: boolean }) {
        this.doc.beginTransaction(options);
    }
    public cancelTransaction() {
        this.doc.cancelTransaction();
    }
    public commitTransaction(clientData?: string) {
        this.doc.commitTransaction(LogEntryType.NORMAL, clientData);
    }

    public undo(): Result {
        if (this.doc.isTransaction())
            return ErrE("Cannot undo while currently within a transaction!");
        if (this.undoStack.length === 0)
            return OkVoid();

        const lastEntryIndex = this.undoStack.pop()!;
        this.redoStack.push(lastEntryIndex);

        this.doc.beginTransaction({ batch: true });  // Batch the undo for efficiency reasons
        this.log.entries[lastEntryIndex].ops
            .map(InvertCircuitOp)
            .reverse()
            .forEach((op) => this.doc.addTransactionOp(op));
        this.doc.commitTransaction(LogEntryType.UNDO);

        return OkVoid();
    }

    public redo(): Result {
        if (this.doc.isTransaction())
            return ErrE("Cannot redo while currently within a transaction!");
        if (this.redoStack.length === 0)
            return OkVoid();

        const lastEntryIndex = this.redoStack.pop()!;
        this.undoStack.push(lastEntryIndex);

        this.doc.beginTransaction({ batch: true });  // Batch the redo for efficiency reasons
        this.log.entries[lastEntryIndex].ops
            .forEach((op) => this.doc.addTransactionOp(op));
        this.doc.commitTransaction(LogEntryType.REDO);

        return OkVoid();
    }

    public getUndoHistory() {
        return this.undoStack.map((i) => this.log.entries[i]);
    }

    public getRedoHistory() {
        return this.redoStack.map((i) => this.log.entries[i]);
    }

    public clearHistory() {
        this.undoStack = [];
        this.redoStack = [];
    }

    public setMetadata(metadata: Partial<Schema.CircuitMetadata>) {
        this.doc.setMetadata(metadata);
    }

    public setCamera(camera: Partial<Schema.Camera>) {
        this.doc.setCamera(camera);
    }

    public importObjs(objs: Schema.Obj[], refreshIds = false): Result<Map<GUID, GUID>> {
        const newIds = new Map<GUID, GUID>();
        objs.forEach((obj) =>
            newIds.set(obj.id, (refreshIds ? uuid() : obj.id)));

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
                        c:        {
                            ...comp,
                            id: newIds.get(comp.id)!,
                        },
                    })
            )
            .andThen(() => ResultUtil.mapIter(
                portsForComp.entries(),
                ([compId, ports]) =>
                    this.doc.addTransactionOp({
                        kind:       "SetComponentPortsOp",
                        inverted:   false,
                        component:  newIds.get(compId)!,
                        addedPorts: ports.map((p) => ({
                            ...p,
                            parent: newIds.get(compId)!,
                            id:     newIds.get(p.id)!,
                        })),
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
                        w:        {
                            ...wire,
                            id: newIds.get(wire.id)!,
                            p1: newIds.get(wire.p1)!,
                            p2: newIds.get(wire.p2)!,
                        },
                    })
            ))
            .map((_) => newIds)
            .mapErr(AddErrE("CircuitInternal.importObjs: failed!"))
            .uponErr(() => this.cancelTransaction());
    }

    public placeComponent(kind: string, props: Schema.Component["props"], icId?: GUID): Result<GUID> {
        const id = Schema.uuid();
        return this.doc.addTransactionOp({
                kind:     "PlaceComponentOp",
                inverted: false,
                c:        {
                    baseKind: "Component",
                    kind:     kind,
                    id:       id,
                    icId,
                    props:    { ...props }, // Copy non-trivial object
                },
            }).map(() => id)
            .mapErr(AddErrE(`CircuitInternal.placeComponent: failed for ${kind}`))
            .uponErr(() => this.cancelTransaction());
    }

    public replaceComponent(id: GUID, newKind: string): Result {
        return this.doc
            .getCircuitInfo()
            .getCompByID(id)
            .andThen((c) =>
                 this.doc.addTransactionOp({
                    kind:    "ReplaceComponentOp",
                    id,
                    oldKind: c.kind,
                    newKind,
                }))
            .mapErr(AddErrE(`CircuitInternal.replaceComponent: failed for ${id}, newKind: ${newKind}`))
            .uponErr(() => this.cancelTransaction());
    }

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

    public updateICPinMetadata(
        icId: GUID,
        pinIndex: number,
        newMetadata: Partial<Omit<Schema.IntegratedCircuitPin, "id" | "group" | "name">>,
    ): Result {
        return this.doc
            .getICInfo(icId)
            .andThen((ic) =>
                this.doc.addTransactionOp({
                    kind:   "UpdateICMetadataOp",
                    icId,
                    newVal: { pins: [
                        ...ic.metadata.pins.slice(0, pinIndex),
                        {
                            ...ic.metadata.pins[pinIndex],
                            ...newMetadata,
                        },
                        ...ic.metadata.pins.slice(pinIndex + 1),
                    ] },
                    oldVal: { ...ic.metadata },
                }));
    }
    public updateICMetadata(icId: GUID, newMetadata: UpdateICMetadataOp["newVal"]): Result {
        return this.doc
            .getICInfo(icId)
            .andThen((ic) =>
                this.doc.addTransactionOp({
                    kind:   "UpdateICMetadataOp",
                    icId,
                    newVal: newMetadata,
                    oldVal: { ...ic.metadata },
                }));
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
                    kind:   "SetPropertyOp",
                    key,
                    oldVal: obj.props[key],
                    newVal,
                }))
            .mapErr(AddErrE(`CircuitInternal.setPropFor: failed for ${id}`))
            .uponErr(() => this.cancelTransaction());
    }

    public setPortConfig(id: GUID, portConfig: PortConfig): Result {
        const circuit = this.doc.getCircuitInfo();
        return circuit
            .getComponentAndInfoByID(id)
            .andThen(([comp, info]) => info.makePortsForConfig(comp.id, portConfig))
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
                        comps:    [...ic.getAllObjs()].filter((o) => (o.baseKind === "Component")),
                        wires:    [...ic.getAllObjs()].filter((o) => (o.baseKind === "Wire")),
                        ports:    [...ic.getAllObjs()].filter((o) => (o.baseKind === "Port")),
                    },
                }))
            .mapErr(AddErrE(`CircuitInternal.deleteIC: failed for ${id}`))
            .uponErr(() => this.cancelTransaction());
    }
}
