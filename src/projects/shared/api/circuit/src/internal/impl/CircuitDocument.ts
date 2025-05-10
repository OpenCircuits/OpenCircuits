import {AddErrE}                              from "shared/api/circuit/utils/MultiError";
import {ErrE, Ok, OkVoid, Result, ResultUtil, WrapResOrE} from "shared/api/circuit/utils/Result";

import {GUID, Schema} from "shared/api/circuit/schema";

import {CanCommuteOps, CircuitOp, ConnectWireOp, CreateICOp, InvertCircuitOp, MergeOps, PlaceComponentOp, SetComponentPortsOp, SetPropertyOp, TransformCircuitOps} from "./CircuitOps";
import {ComponentConfigurationInfo, ObjInfo, ObjInfoProvider, PortConfig, PortListToConfig} from "./ObjInfo";
import {CircuitLog, LogEntry} from "./CircuitLog";
import {ObservableImpl} from "../../utils/Observable";
import {FastCircuitDiff, FastCircuitDiffBuilder} from "./FastCircuitDiff";


export interface ReadonlyCircuitStorage<M extends Schema.CircuitMetadata = Schema.CircuitMetadata> {
    readonly id: GUID;
    readonly metadata: Readonly<M>;
    readonly camera: Readonly<Schema.Camera>;

    getObjectInfo(kind: string): Result<ObjInfo>;
    getComponentInfo(kind: string): Result<ComponentConfigurationInfo>;

    getObjectAndInfoByID(id: GUID): Result<[Readonly<Schema.Obj>, ObjInfo]>;
    getComponentAndInfoByID(id: GUID): Result<[Readonly<Schema.Component>, ComponentConfigurationInfo]>;

    hasComp(id: GUID): boolean;
    hasWire(id: GUID): boolean;
    hasPort(id: GUID): boolean;

    getAllObjs(): Readonly<IterableIterator<Readonly<Schema.Obj>>>;
    getObjs(): IterableIterator<GUID>;
    getComponents(): IterableIterator<GUID>;
    getWires(): IterableIterator<GUID>;

    getObjByID(id: GUID): Result<Readonly<Schema.Obj>>;
    getCompByID(id: GUID): Result<Readonly<Schema.Component>>;
    getWireByID(id: GUID): Result<Readonly<Schema.Wire>>;
    getPortByID(id: GUID): Result<Readonly<Schema.Port>>;

    // Graph connectivity
    getPortsByGroup(componentID: GUID): Result<Readonly<Record<string, GUID[]>>>;
    getPortsForGroup(componentID: GUID, group: string): Result<ReadonlySet<GUID>>;
    getPortsForComponent(id: GUID): Result<ReadonlySet<GUID>>;
    getPortsForWire(id: GUID): Result<Readonly<[GUID, GUID]>>;
    getWiresForPort(id: GUID): Result<ReadonlySet<GUID>>;
    getPortsForPort(id: GUID): Result<ReadonlySet<GUID>>;

    getPortConfig(id: GUID): Result<PortConfig>;
}
export interface ReadonlyCircuitDocument {
    getCircuitInfo(): ReadonlyCircuitStorage;
}

class CircuitStorage<M extends Schema.CircuitMetadata = Schema.CircuitMetadata> implements ReadonlyCircuitStorage<M> {
    public readonly objInfo: ObjInfoProvider;

    public metadata: M;
    public camera: Schema.Camera;

    // Object storage
    public readonly objStorage: Map<GUID, Schema.Obj>;
    public readonly wireSet: Set<GUID>;

    // Graph connectivity
    public readonly componentPortsMap: Map<GUID, Set<GUID>>; // Components to ports
    public readonly portPortMap: Map<GUID, Set<GUID>>; // Ports to other ports (bidirectional)
    public readonly portWireMap: Map<GUID, Set<GUID>>; // Ports to their wires

    public constructor(objInfo: ObjInfoProvider, initialMetadata: M) {
        this.objInfo = objInfo;
        this.metadata = initialMetadata;
        this.camera = {
            x:    0,
            y:    0,
            zoom: 0.02,
        };

        this.objStorage = new Map();
        this.wireSet = new Set();

        this.componentPortsMap = new Map();
        this.portPortMap = new Map();
        this.portWireMap = new Map();
    }

    //
    // Internal helpers for CircuitDocument
    //
    // TODO: add helper that checks all invariants of the internal rep.
    //
    public addObjs(objs: Schema.Obj[]) {
        objs.filter((o) => (o.baseKind === "Component"))
            .forEach((c) => this.addComponent(c));
        objs.filter((o) => (o.baseKind === "Port"))
            .forEach((p) => this.addPort(p));
        objs.filter((o) => (o.baseKind === "Wire"))
            .forEach((w) => this.addWire(w));
    }

    public deleteComponent(c: Schema.Component) {
        this.objStorage.delete(c.id);

        // Delete port entry
        this.componentPortsMap.delete(c.id);
    }

    public addComponent(c: Schema.Component) {
        this.objStorage.set(c.id, c);

        // Initialize blank port set
        this.componentPortsMap.set(c.id, new Set());
    }

    public deleteWire(w: Schema.Wire) {
        this.objStorage.delete(w.id);
        this.wireSet.delete(w.id);

        this.portPortMap.get(w.p1)!.delete(w.p2);
        this.portPortMap.get(w.p2)!.delete(w.p1);

        this.portWireMap.get(w.p1)!.delete(w.id);
        this.portWireMap.get(w.p2)!.delete(w.id);
    }

    public addWire(w: Schema.Wire) {
        this.objStorage.set(w.id, w);
        this.wireSet.add(w.id);

        this.portPortMap.get(w.p1)!.add(w.p2);
        this.portPortMap.get(w.p2)!.add(w.p1);

        this.portWireMap.get(w.p1)!.add(w.id);
        this.portWireMap.get(w.p2)!.add(w.id);
    }

    public deletePort(p: Schema.Port) {
        this.objStorage.delete(p.id);

        this.componentPortsMap.get(p.parent)!.delete(p.id);
        this.portPortMap.delete(p.id);
        this.portWireMap.delete(p.id);
    }

    public addPort(p: Schema.Port) {
        this.objStorage.set(p.id, p);

        this.componentPortsMap.get(p.parent)!.add(p.id);
        this.portPortMap.set(p.id, new Set());
        this.portWireMap.set(p.id, new Set());
    }

    public checkWireConnectivity(p1: Schema.Port, p2: Schema.Port) {
        // This is a bit over-complicated at the moment since it globally checks the whole wiring configuration
        // When I think for now it's fine to have it be port -> port independent.
        // const map = new Map([[p1, [p2]]]);
        // this.componentPortsMap.get(p1.parent)!.forEach((id) => {
        //     const p = this.getPortByID(id).unwrap();
        //     const to = this.getPortPortMapChecked(id);
        //     map.set(p, [...(map.get(p) ?? []), ...([...to].map((id) => this.getPortByID(id).unwrap()))]);
        // });
        // return this.getComponentAndInfoByID(p1.parent)
        //     .andThen(([_, info]) => info.checkPortConnectivity(map)
        //         .mapErr(AddErrE(`Adding wire from port ${p1} to ${p2} is creates an illegal configuration.`)));

        const curPorts = [...this.getPortPortMapChecked(p1.id)].map((id) => this.getPortByID(id).unwrap());
        return this.getComponentAndInfoByID(p1.parent)
            .andThen(([_, info]) => {
                if (!info.isPortAvailable(p1, curPorts))
                    return ErrE(`Port ${p1.id} is not available for connection!`);
                return info.checkPortConnectivity(p1, p2, curPorts);
            })
            .mapErr(AddErrE(`Adding wire from port ${p1} to ${p2} is creates an illegal configuration.`));
    }

    public getPortPortMapChecked(id: GUID): Set<GUID> {
        const p = this.portPortMap.get(id);
        if (!p)
            throw new Error(`Invariant Violation: getPortPortMapChecked(${id}) unexpectedly returned undefined`);
        return p;
    }

    public getMutableObjByID(id: GUID): Result<Schema.Obj> {
        return WrapResOrE(this.objStorage.get(id), `Invalid object GUID ${id}`);
    }

    public getMutObjectAndInfoByID(id: GUID): Result<[Schema.Obj, ObjInfo]> {
        return this.getMutableObjByID(id)
            .andThen((obj) =>
                this.getObjectInfo(obj.kind)
                    .map((info) => [obj, info]));
    }


    //
    // Getters.  Returned objects should not be modified directly.
    //

    public get id(): GUID {
        return this.metadata.id;
    }

    public getObjectInfo(kind: string): Result<ObjInfo> {
        return WrapResOrE(this.objInfo.get(kind), `Failed to object info for kind: '${kind}'!`);
    }
    public getComponentInfo(kind: string): Result<ComponentConfigurationInfo> {
        return WrapResOrE(this.objInfo.getComponent(kind), `Failed to get component info for kind: '${kind}'!`);
    }

    public getObjectAndInfoByID(id: GUID): Result<[Readonly<Schema.Obj>, ObjInfo]> {
        return this.getObjByID(id)
            .andThen((obj) =>
                this.getObjectInfo(obj.kind)
                    .map((info) => [obj, info]));
    }

    public getComponentAndInfoByID(id: GUID): Result<[Readonly<Schema.Component>, ComponentConfigurationInfo]> {
        return this.getCompByID(id)
            .andThen((comp) =>
                this.getComponentInfo(comp.kind)
                    .map((info) => [comp, info]));
    }

    private hasType(id: GUID, kind: Schema.Obj["baseKind"]): boolean {
        const obj = this.objStorage.get(id);
        if (!obj)
            return false;
        return (obj.baseKind === kind);

    }
    public hasComp(id: GUID): boolean {
        return this.hasType(id, "Component");
    }
    public hasWire(id: GUID): boolean {
        return this.hasType(id, "Wire");
    }
    public hasPort(id: GUID): boolean {
        return this.hasType(id, "Port");
    }

    public getAllObjs(): Readonly<IterableIterator<Readonly<Schema.Obj>>> {
        return this.objStorage.values();
    }
    public getObjs(): IterableIterator<GUID> {
        return this.objStorage.keys();
    }
    public getComponents(): IterableIterator<GUID> {
        return this.componentPortsMap.keys();
    }
    public getWires(): IterableIterator<GUID> {
        return this.wireSet.values();
    }


    private getBaseKindByID<O extends Schema.Obj>(id: GUID, kind: O["baseKind"]): Result<O> {
        return this.getObjByID(id)
            .andThen((obj): Result<O> => {
                if (obj.baseKind !== kind)
                    return ErrE(`CircuitInternal: Attempted to get ${kind} by ID ${id} but received ${obj.baseKind}!`);
                return Ok(obj as O);
            });
    }
    public getObjByID(id: GUID): Result<Readonly<Schema.Obj>> {
        return this.getMutableObjByID(id);
    }
    public getCompByID(id: GUID): Result<Readonly<Schema.Component>> {
        return this.getBaseKindByID<Schema.Component>(id, "Component");
    }
    public getWireByID(id: GUID): Result<Readonly<Schema.Wire>> {
        return this.getBaseKindByID<Schema.Wire>(id, "Wire");
    }
    public getPortByID(id: GUID): Result<Readonly<Schema.Port>> {
        return this.getBaseKindByID<Schema.Port>(id, "Port");
    }

    public getPortsByGroup(componentID: GUID): Result<Readonly<Record<string, GUID[]>>> {
        return this.getPortsForComponent(componentID)
            .map((portIDs) =>
                [...portIDs].reduce<Record<string, GUID[]>>((record, portID) => {
                    const port = this.getPortByID(portID).unwrap();
                    // return (port.group === group);÷
                    return {
                        ...record,
                        [port.group]: [
                            ...(record[port.group] ?? []),
                            port.id,
                        ],
                    };
                }, {}));
    }

    public getPortsForGroup(componentID: GUID, group: string): Result<ReadonlySet<GUID>> {
        return this.getPortsByGroup(componentID)
            .map((record) => new Set(record[group]));
    }

    public getPortsForComponent(id: GUID): Result<ReadonlySet<GUID>> {
        return WrapResOrE(this.componentPortsMap.get(id),
            `CircuitInternal: Attempted to get ports for component ${id}, but failed to find an entry!`);
    }

    public getPortsForWire(id: GUID): Result<Readonly<[GUID, GUID]>> {
        return this.getWireByID(id)
            .map((wire) => [ wire.p1, wire.p2 ] as const)
            .mapErr(AddErrE(`CircuitInternal: Attempted to get ports for wire ${id}, but failed to find an entry!`));
    }

    public getWiresForPort(id: GUID): Result<ReadonlySet<GUID>> {
        return WrapResOrE(this.portWireMap.get(id),
            `CircuitInternal: Attempted to get wires for port ${id}, but failed to find an entry!`);
    }

    public getPortsForPort(id: GUID): Result<ReadonlySet<GUID>> {
        return WrapResOrE(this.portPortMap.get(id),
            `CircuitInternal: Attempted to get ports for port ${id}, but failed to find an entry!`);
    }

    public getPortConfig(id: GUID): Result<PortConfig> {
        return this.getPortsForComponent(id)
            .map((portIDs) => [...portIDs].map((s) => this.getPortByID(s).unwrap()))
            .map(PortListToConfig);
    }
}

class TransactionList {
    private transactionOps: CircuitOp[];

    public constructor() {
        this.transactionOps = [];
    }

    public get length() {
        return this.transactionOps.length;
    }

    public set ops(ops: CircuitOp[]) {
        this.transactionOps = ops;
    }
    public get ops() {
        return this.transactionOps;
    }

    public push(op: CircuitOp): void {
        // See if we can commute the op downwards and then potentially merge it
        let i = this.length - 1;
        while (i >= 0 && CanCommuteOps(this.ops[i], op))
            i--;

        // Nothing to merge with found, just push and move on.
        if (i < 0) {
            this.transactionOps.push(op);
            return;
        }

        const merge = MergeOps(this.ops[i], op);
        if (merge.some) {
            this.ops.splice(i, 1);
            this.transactionOps.push(merge.value);
            return;
        }

        this.transactionOps.push(op);
    }

    public reset(): TransactionList {
        const oldTxList = new TransactionList();
        oldTxList.transactionOps = this.transactionOps;
        this.transactionOps = [];
        return oldTxList;
    }

    public inverted(): CircuitOp[] {
        return this.transactionOps.map(InvertCircuitOp).reverse();
    }
}

export type CircuitDocEvent = {
    type: "CircuitOp";
    diff: FastCircuitDiff;
}

// The authoritative accumulated Circuit document type.  Contains all logic to validate and apply CircuitOps.  The
// internal representation is optimized for graph traversal.
//
// Also contains the logic for transactions.
//
// See CircuitInternal for exception/reference policies.
export class CircuitDocument extends ObservableImpl<CircuitDocEvent> implements ReadonlyCircuitDocument {
    private readonly objInfo: ObjInfoProvider;

    private readonly storage: CircuitStorage;
    private diffBuilder: FastCircuitDiffBuilder;

    private readonly icStorage: Map<GUID, CircuitStorage<Schema.IntegratedCircuitMetadata>>;

    private readonly log: CircuitLog;
    private clock: number;

    // Keep track of multiple "begin"/"commit" pairs and only commit when counter reaches zero.
    private curBatchIndex: number;
    private transactionCounter: number;
    private readonly transactionList: TransactionList;

    public constructor(id: GUID, objInfo: ObjInfoProvider, log: CircuitLog) {
        super();

        this.objInfo = objInfo;

        this.storage = new CircuitStorage(objInfo, {
            id, name: "", desc: "", thumb: "", version: "digital/v0",
        });
        this.diffBuilder = new FastCircuitDiffBuilder();

        this.icStorage = new Map();

        this.log = log;
        this.clock = log.clock;

        this.curBatchIndex = -1;
        this.transactionCounter = 0;
        this.transactionList = new TransactionList();

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
        this.applyOpsChecked(this.transactionList.inverted());

        // Apply ops
        this.applyOpsChecked(ops);

        // Transform tx ops
        TransformCircuitOps(this.transactionList.ops, ops)
            .uponErr(() => {
                // Failed to transform partial transaction, so cancel it and save the error.
                this.transactionCounter = 0;
                this.transactionList.reset();

                // TODO[model_refactor_api](kevin): propagate this error to the client.
                // this.transactionTransformError = e;
            })
            .uponOk((txOps) => {
                // Reapply tx ops
                this.transactionList.ops = txOps;
                this.applyOpsChecked(this.transactionList.ops);
            });
    }

    private publishDiffEvent() {
        const diff = this.diffBuilder.build();
        this.diffBuilder = new FastCircuitDiffBuilder();
        this.publish({ type: "CircuitOp", diff });
    }

    private applyOp(op: CircuitOp): Result {
        return this.applyCircuitOp(op)
            .map(() => this.diffBuilder.applyOp(op));
    }

    private applyOpsChecked(ops: readonly CircuitOp[]): void {
        // TODO: If any exceptions are thrown by applying server-provided ops, this is a BUG
        //  and the site should force reload to get back to a consistent state.
        ResultUtil.mapIter(ops.values(), (op) => this.applyOp(op))
            .mapErr(AddErrE("Internal applyOp failed!  Client state is inconsistent!"))
            .unwrap();
    }

    private getMutableICInfo(icId: GUID): Result<CircuitStorage<Schema.IntegratedCircuitMetadata>> {
        return WrapResOrE(this.icStorage.get(icId), `CircuitDocument.getICInfo: Invalid IC ID ${icId}!`);
    }

    public setMetadata(metadata: Partial<Schema.CircuitMetadata>) {
        this.storage.metadata = {
            ...this.storage.metadata,
            ...metadata,
        };
    }

    public setCamera(camera: Partial<Schema.Camera>) {
        this.storage.camera = {
            ...this.storage.camera,
            ...camera,
        };
    }

    public addTransactionOp(op: CircuitOp): Result {
        this.beginTransaction();

        // read-your-writes
        return this.applyOp(op)
            .uponErr(() => this.cancelTransaction())
            .uponOk(() => {
                // Push only after successful op
                this.transactionList.push(op);

                // Emit event per-transaction-op only if we're not in a "batch", otherwise, wait till batch is done.
                if (this.curBatchIndex === -1)
                    this.publishDiffEvent();

                this.commitTransaction();
            });
    }

    public getCircuitInfo(): ReadonlyCircuitStorage {
        return this.storage;
    }
    public getICs(): ReadonlySet<GUID> {
        return new Set(this.icStorage.keys());
    }

    public getICInfo(icId: GUID): Result<ReadonlyCircuitStorage<Schema.IntegratedCircuitMetadata>> {
        return this.getMutableICInfo(icId);
    }

    //
    // Transaction interface
    //

    // Check this before working with long-running transactions.  Long-running transactions are any transaction that
    //  crosses an async/event boundary and some other task could have resumed in the mean time.
    public isTransaction(): boolean {
        return this.transactionCounter > 0;
    }

    // We need "read-your-writes" so functions like "setProp" can correctly get tombstones like "oldVal".
    public beginTransaction(options?: { batch?: boolean }): void {
        this.transactionCounter++;
        if (options?.batch) {
            if (this.curBatchIndex > -1)
                throw new Error("Can't start a new transaction batch while already in one!");
            this.curBatchIndex = this.transactionCounter;
        }
    }

    // "clientData" is arbitrary data the client can store in the Log for higher-level semantics than CircuitOps.
    public commitTransaction(clientData = ""): LogEntry | undefined {
        if (!this.isTransaction())
            throw new Error("Unexpected commitTransaction!");

        this.transactionCounter--;

        // If we just completed a "batch", publish diff now
        if (this.transactionCounter < this.curBatchIndex) {
            this.curBatchIndex = -1;
            this.publishDiffEvent();
        }

        // Early return if this isn't the last "commit"
        if (this.transactionCounter > 0)
            return;

        // To be safe for re-entrant calls, make sure the tx state is reset before proposing.
        this.transactionCounter = 0;
        if (this.transactionList.length === 0)
            return;

        const txList = this.transactionList.reset();
        // Sanity check: Clock should be kept updated by the event handler.
        if (this.clock !== this.log.clock) {
            throw new Error(`Unexpected clock difference (${this.clock} vs ${this.log.clock})`
                            + ". Maybe a missed event?");
        }

        return this.log.propose(txList.ops, clientData);
    }

    public cancelTransaction(): void {
        // To be safe for re-entrant calls, make sure the tx state is reset before proposing.
        this.transactionCounter = 0;
        this.curBatchIndex = -1;
        if (this.transactionList.length === 0)
            return;

        const txList = this.transactionList.reset();
        this.applyOpsChecked(txList.inverted());
    }


    //
    // Mutations.  CircuitDocument is mutated exclusively through CircuitOps.
    //

    private applyCircuitOp(op: CircuitOp): Result {
        switch (op.kind) {
            case "PlaceComponentOp":
                this.placeComponent(op);
                return OkVoid();
            case "ReplaceComponentOp":
                throw new Error("Unimplemented");
            case "SetComponentPortsOp":
                return this.setComponentPorts(op);
            case "ConnectWireOp":
                return this.connectWire(op);
            case "SplitWireOp":
                throw new Error("Unimplemented");
            case "SetPropertyOp":
                return this.setProperty(op);
            case "CreateICOp":
                this.createIC(op);
                return OkVoid();
        }
    }

    private placeComponent(op: PlaceComponentOp) {
        const storage = this.storage;

        if (op.inverted) {
            if (!storage.componentPortsMap.has(op.c.id))
                throw new Error(`Deleted component ${op.c.id} should have componentPortsMap initialized!`);
            if (storage.componentPortsMap.get(op.c.id)!.size > 0)
                throw new Error(`Deleted component ${op.c.id} should not have ports`);

            storage.deleteComponent(op.c);
        } else {
            if (storage.componentPortsMap.has(op.c.id))
                throw new Error(`Placed component ${op.c.id} should not have any ports`);

            storage.addComponent(op.c);
        }
    }

    // NOTE: This operation does NOT check the given port configuration for correctness.
    // It assumes any configuration of added/removed ports is fine.
    // Checking it against a component's info should be done prior to calling this method.
    private setComponentPorts(op: SetComponentPortsOp): Result {
        const storage = this.storage;

        const addedPorts = op.inverted ? op.removedPorts : op.addedPorts;
        const removedPorts = op.inverted ? op.addedPorts : op.removedPorts;

        return storage.getCompByID(op.component)
            .map((_) => {
                if (!op.inverted)
                    op.deadWires.forEach((w) => storage.deleteWire(w));
                removedPorts.forEach((p) => storage.deletePort(p));
                addedPorts.forEach((p) => storage.addPort(p));
                if (op.inverted)
                    op.deadWires.forEach((w) => storage.addWire(w));
            });
    }

    private connectWire(op: ConnectWireOp): Result {
        const storage = this.storage;

        return storage.getPortByID(op.w.p1)
            .andThen((p1) => storage.getPortByID(op.w.p2)
                .andThen((p2) =>
                    (op.inverted
                        ? OkVoid()
                        // Check connectivity when adding wire only
                        : storage.checkWireConnectivity(p1, p2).and(storage.checkWireConnectivity(p2, p1))))
                .map((_) => (op.inverted ? storage.deleteWire(op.w) : storage.addWire(op.w))));
    }

    private setProperty(op: SetPropertyOp): Result {
        const storage = this.storage;

        if (op.ic) {
            return this.getMutableICInfo(op.id)
                .map((ic) => {
                    const val = (op.newVal ?? op.oldVal);

                    if (op.key === "name" && typeof val === "string") {
                        ic.metadata.name = val;
                    } else if ((op.key === "displayWidth" || op.key === "displayHeight") && typeof val === "number") {
                        ic.metadata[op.key] = val;
                    } else if (op.key.startsWith("pins.") && typeof val === "number") {
                        // pins.INDEX.(x|y)
                        const [_, idx, key] = op.key.split(".");
                        if (key === "x" || key === "y" || key === "dx" || key === "dy")
                            ic.metadata.pins[parseInt(idx)][key] = val;
                        else
                            throw new Error(`Unknown property type ${op.key} or value type ${typeof val} for ICs!`);
                    } else {
                        throw new Error(`Unknown property type ${op.key} or value type ${typeof val} for ICs!`);
                    }
                });
        }

        return storage.getMutObjectAndInfoByID(op.id)
            .andThen(([obj, info]) => info.checkPropValue(op.key, op.newVal)
                .uponOk(() => {
                    // Copy-on-write
                    obj.props = { ...obj.props };
                    if (op.newVal)
                        obj.props[op.key] = op.newVal;
                    else
                        delete obj.props[op.key];
                }));
    }

    // NOTE: This operation does NOT check or remove existing IC instances. This should be done beforehand.
    private createIC(op: CreateICOp) {
        if (op.inverted) {
            if (!this.icStorage.has(op.ic.metadata.id))
                throw new Error(`Deleted IC ${op.ic.metadata.id} should have an entry in icStorage!`);

            this.icStorage.delete(op.ic.metadata.id);
            this.objInfo.deleteIC(op.ic);
        } else {
            if (this.icStorage.has(op.ic.metadata.id))
                throw new Error(`Created IC ${op.ic.metadata.id} should not already exist!`);

            const storage = new CircuitStorage<Schema.IntegratedCircuitMetadata>(this.objInfo, op.ic.metadata);
            storage.addObjs(op.ic.objects);
            this.icStorage.set(op.ic.metadata.id, storage);
            this.objInfo.createIC(op.ic);
        }
    }
}
