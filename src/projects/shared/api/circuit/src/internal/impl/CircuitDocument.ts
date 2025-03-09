import {AddErrE}                              from "shared/api/circuit/utils/MultiError";
import {ErrE, Ok, OkVoid, Result, ResultUtil, WrapResOrE} from "shared/api/circuit/utils/Result";

import {GUID}   from "shared/api/circuit/schema/GUID";
import {Schema} from "shared/api/circuit/schema";

import {CircuitOp, ConnectWireOp, InvertCircuitOp, PlaceComponentOp, SetComponentPortsOp, SetPropertyOp, TransformCircuitOps} from "./CircuitOps";
import {ComponentInfo, ObjInfo, ObjInfoProvider, PortConfig, PortListToConfig} from "./ComponentInfo";
import {CircuitLog, LogEntry} from "./CircuitLog";
import {Observable} from "../../utils/Observable";
import {FastCircuitDiff, FastCircuitDiffBuilder} from "./FastCircuitDiff";


export interface ReadonlyCircuitStorage {
    readonly id: GUID;
    readonly metadata: Schema.CircuitMetadata;

    getObjectInfo(kind: string): Result<ObjInfo>;
    getComponentInfo(kind: string): Result<ComponentInfo>;

    getObjectAndInfoByID(id: GUID): Result<[Readonly<Schema.Obj>, ObjInfo]>;
    getComponentAndInfoByID(id: GUID): Result<[Readonly<Schema.Component>, ComponentInfo]>;

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
    getCircuitInfo(circuitID: GUID): Result<ReadonlyCircuitStorage>;
}

class CircuitStorage<M extends Schema.CircuitMetadata = Schema.CircuitMetadata> implements ReadonlyCircuitStorage {
    public readonly objInfo: ObjInfoProvider;

    public readonly metadata: M;

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
        return WrapResOrE(this.objInfo.get(kind), `Unknown obj kind ${kind}!`);
    }
    public getComponentInfo(kind: string): Result<ComponentInfo> {
        return WrapResOrE(this.objInfo.getComponent(kind), `Unknown component kind ${kind}!`);
    }

    public getObjectAndInfoByID(id: GUID): Result<[Readonly<Schema.Obj>, ObjInfo]> {
        return this.getObjByID(id)
            .andThen((obj) =>
                this.getObjectInfo(obj.kind)
                    .map((info) => [obj, info]));
    }

    public getComponentAndInfoByID(id: GUID): Result<[Readonly<Schema.Component>, ComponentInfo]> {
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
        return this.getWireByID(id).map((wire) => [ wire.p1, wire.p2 ]);
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

export type CircuitDocEvent = {
    type: "CircuitOp";
    circuit: GUID;
    diff: FastCircuitDiff;
}

// The authoritative accumulated Circuit document type.  Contains all logic to validate and apply CircuitOps.  The
// internal representation is optimized for graph traversal.
//
// Also contains the logic for transactions.
//
// See CircuitInternal for exception/reference policies.
export class CircuitDocument extends Observable<CircuitDocEvent> implements ReadonlyCircuitDocument {
    private readonly objInfo: ObjInfoProvider;

    // Map of [circuit ID: circuit contents]
    private readonly storage: Map<GUID, CircuitStorage>;
    private readonly diffBuilders: Map<GUID, FastCircuitDiffBuilder>;

    private readonly log: CircuitLog;
    private clock: number;

    // Keep track of multiple "begin"/"commit" pairs and only commit when counter reaches zero.
    private transactionCounter: number;
    private transactionOps: CircuitOp[];

    public constructor(objInfo: ObjInfoProvider, log: CircuitLog) {
        super();

        this.objInfo = objInfo;

        this.storage = new Map();
        this.diffBuilders = new Map();

        this.log = log;
        this.clock = log.clock;

        this.transactionCounter = 0;
        this.transactionOps = [];

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
            const circuits = new Set(evt.ops.map((o) => o.circuit));
            circuits.forEach((circuit) =>
                this.publishDiffEvent(circuit));
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

    private publishDiffEvent(circuit: GUID) {
        const diff = this.diffBuilders.get(circuit)!.build();
        this.diffBuilders.set(circuit, new FastCircuitDiffBuilder());
        this.publish({ type: "CircuitOp", circuit, diff });
    }

    private applyOp(op: CircuitOp): Result {
        return this.applyCircuitOp(op)
            .map(() => this.diffBuilders.get(op.circuit)!.applyOp(op));
    }

    private applyOpsChecked(ops: readonly CircuitOp[]): void {
        // TODO: If any exceptions are thrown by applying server-provided ops, this is a BUG
        //  and the site should force reload to get back to a consistent state.
        ResultUtil.mapIter(ops.values(), (op) => this.applyOp(op))
            .mapErr(AddErrE("Internal applyOp failed!  Client state is inconsistent!"))
            .unwrap();
    }

    // TODO: Transaction? idk
    public createCircuit(id: GUID): Result {
        this.storage.set(id, new CircuitStorage(this.objInfo, {
            id, name: "", desc: "", thumb: "", version: "type/v0",
        }));
        this.diffBuilders.set(id, new FastCircuitDiffBuilder());

        return OkVoid();
    }

    public createIC(metadata: Schema.IntegratedCircuit["metadata"], info: ComponentInfo, objs: Schema.Obj[]): Result {
        this.objInfo.addNewComponentInfo(info.kind, info);

        const storage = new CircuitStorage<Schema.IntegratedCircuit["metadata"]>(this.objInfo, { ...metadata });
        objs.filter((o) => (o.baseKind === "Component"))
            .forEach((c) => storage.addComponent(c));
        objs.filter((o) => (o.baseKind === "Port"))
            .forEach((p) => storage.addPort(p));
        objs.filter((o) => (o.baseKind === "Wire"))
            .forEach((w) => storage.addWire(w));
        this.storage.set(metadata.id, storage);
        this.diffBuilders.set(metadata.id, new FastCircuitDiffBuilder());

        return OkVoid();
    }

    public setMetadataFor<M extends Schema.CircuitMetadata>(circuit: GUID, newMetadata: Partial<M>) {
        return this.getMutableCircuitStorage(circuit)
            .map((c) => {
                (c.metadata as M) = { ...(c.metadata as M), ...newMetadata };
            });
    }

    public addTransactionOp(op: CircuitOp): Result {
        this.beginTransaction();

        // read-your-writes
        return this.applyOp(op)
            .uponErr(() => this.cancelTransaction())
            .uponOk(() => {
                // Push only after successful op
                this.transactionOps.push(op);

                this.commitTransaction();

                // Emit event per-transaction-op
                this.publishDiffEvent(op.circuit);
            });
    }

    private getMutableCircuitStorage(circuitID: GUID): Result<CircuitStorage> {
        return WrapResOrE(this.storage.get(circuitID), `Invalid circuit GUID ${circuitID}`);
    }

    public getCircuitInfo(circuitID: GUID): Result<ReadonlyCircuitStorage> {
        return this.getMutableCircuitStorage(circuitID);
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
        if (this.clock !== this.log.clock) {
            throw new Error(`Unexpected clock difference (${this.clock} vs ${this.log.clock})`
                            + ". Maybe a missed event?");
        }

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
        }
    }

    private placeComponent(op: PlaceComponentOp) {
        const info = this.getMutableCircuitStorage(op.circuit).unwrap();

        if (op.inverted) {
            if (!info.componentPortsMap.has(op.c.id))
                throw new Error(`Deleted component ${op.c.id} should have componentPortsMap initialized!`);
            if (info.componentPortsMap.get(op.c.id)!.size > 0)
                throw new Error(`Deleted component ${op.c.id} should not have ports`);

            info.deleteComponent(op.c);
        } else {
            if (info.componentPortsMap.has(op.c.id))
                throw new Error(`Placed component ${op.c.id} should not have any ports`);

            info.addComponent(op.c);
        }
    }

    // NOTE: This operation does NOT check the given port configuration for correctness.
    // It assumes any configuration of added/removed ports is fine.
    // Checking it against a component's info should be done prior to calling this method.
    private setComponentPorts(op: SetComponentPortsOp): Result {
        const info = this.getMutableCircuitStorage(op.circuit).unwrap();

        const addedPorts = op.inverted ? op.removedPorts : op.addedPorts;
        const removedPorts = op.inverted ? op.addedPorts : op.removedPorts;

        return info.getCompByID(op.component)
            .map((_) => {
                if (!op.inverted)
                    op.deadWires.forEach((w) => info.deleteWire(w));
                removedPorts.forEach((p) => info.deletePort(p));
                addedPorts.forEach((p) => info.addPort(p));
                if (op.inverted)
                    op.deadWires.forEach((w) => info.addWire(w));
            });
    }

    private connectWire(op: ConnectWireOp): Result {
        const info = this.getMutableCircuitStorage(op.circuit).unwrap();

        return info.getPortByID(op.w.p1)
            .andThen((p1) => info.getPortByID(op.w.p2)
                .andThen((p2) => info.checkWireConnectivity(p1, p2).and(info.checkWireConnectivity(p2, p1)))
                .map((_) => (op.inverted ? info.deleteWire(op.w) : info.addWire(op.w))));
    }

    private setProperty(op: SetPropertyOp): Result {
        const info = this.getMutableCircuitStorage(op.circuit).unwrap();

        return info.getMutObjectAndInfoByID(op.id)
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
}
