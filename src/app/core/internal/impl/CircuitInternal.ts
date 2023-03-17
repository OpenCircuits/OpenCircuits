import {AddErrE}                                          from "core/utils/MultiError";
import {ErrE, Ok, OkVoid, Result, ResultUtil, WrapResOrE} from "core/utils/Result";

import {GUID} from "core/schema/GUID";

import {Schema} from "../../schema";

import {CircuitLog}                                                         from "./CircuitLog";
import {CircuitOp, InvertCircuitOp, TransformCircuitOps}                    from "./CircuitOps";
import {CheckPortList, ComponentInfo, ObjInfo, ObjInfoProvider, PortConfig} from "./ComponentInfo";


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
export class CircuitInternal {
    protected readonly objInfo: ObjInfoProvider;

    private readonly log: CircuitLog;
    private clock: number;

    private transaction: boolean;
    private transactionOps: CircuitOp[];

    // Object storage (up-in-the-air)
    protected objStorage: Map<GUID, Schema.Obj>;

    // Graph connectivity
    protected componentPortsMap: Map<GUID, Set<GUID>>; // Components to ports
    protected portPortMap: Map<GUID, Set<GUID>>; // Ports to other ports (bidirectional)
    protected portWireMap: Map<GUID, Set<GUID>>; // Ports to their wires

    // Circuit Metadata
    protected CircuitMetadata: Schema.CircuitMetadata;

    // Placed here for proximity to member declarations
    private applyOp(op: CircuitOp): Result {
        // TODO: optimize portPortMap/portWireMap usage when we know ports are being deleted.
        const deleteWire = (w: Schema.Wire) => {
            this.objStorage.delete(w.id);

            this.portPortMap.get(w.p1)?.delete(w.p2);
            this.portPortMap.get(w.p2)?.delete(w.p1);

            this.portWireMap.get(w.p1)?.delete(w.id);
            this.portWireMap.get(w.p2)?.delete(w.id);
        };
        const addWire = (w: Schema.Wire) => {
            this.objStorage.set(w.id, w);

            this.portPortMap.get(w.p1)?.add(w.p2);
            this.portPortMap.get(w.p2)?.add(w.p1);

            this.portWireMap.get(w.p1)?.add(w.id);
            this.portWireMap.get(w.p2)?.add(w.id);
        }
        const deletePort = (p: Schema.Port) => {
            this.objStorage.delete(p.id);

            this.componentPortsMap.get(p.parent)?.delete(p.id);
            this.portPortMap.delete(p.id);
            this.portWireMap.delete(p.id);
        }
        const addPort = (p: Schema.Port) => {
            this.objStorage.set(p.id, p);

            this.componentPortsMap.get(p.parent)?.add(p.id);
            this.portPortMap.set(p.id, new Set());
            this.portWireMap.set(p.id, new Set());
        }
        const checkWireConnectivity = (p1: Schema.Port, p2: Schema.Port): Result => {
            const map = new Map([[p1, [p2]]]);
            this.componentPortsMap.get(p1.parent)?.forEach((id) => {
                const to = this.getPortPortMapChecked(id);
                map.set(p1, [...to].map((id) => this.getPortByID(id).unwrap()));
            });
            return this.getComponentAndInfoByID(p1.parent)
                .andThen(([_, info]) => info.checkPortConnectivity(map)
                    .mapErr(AddErrE(`Adding wire from port ${p1} to ${p2} is creates an illegal configuration.`)));
        };
        switch (op.kind) {
            case "PlaceComponentOp": {
                if (op.inverted) {
                    if (!this.componentPortsMap.has(op.c.id))
                        throw new Error(`Deleted component ${op.c.id} should have componentPortsMap initialized!`);
                    if (this.componentPortsMap.get(op.c.id)!.size > 0)
                        throw new Error(`Deleted component ${op.c.id} should not have ports`);

                    this.objStorage.delete(op.c.id);

                    // Delete port entry
                    this.componentPortsMap.delete(op.c.id);
                } else {
                    if (this.componentPortsMap.has(op.c.id))
                        throw new Error(`Placed component ${op.c.id} should not have any ports`);

                    this.objStorage.set(op.c.id, op.c);

                    // Initialize blank port set
                    this.componentPortsMap.set(op.c.id, new Set());
                }
                return OkVoid();
            }
            case "SetComponentPortsOp": {
                const [newPorts, oldPorts] = op.inverted ? [op.oldPorts, op.newPorts] : [op.newPorts, op.oldPorts];

                if (newPorts) {
                    const res = this.getComponentAndInfoByID(op.component)
                        .andThen(([_, info]) => CheckPortList(info, newPorts)
                            .mapErr(AddErrE(`Invalid new port list ${newPorts} for component ${op.component}`)));
                    if (!res.ok)
                        return res;
                }

                // TODO: factor in overlap between new/old ports to preserve wires when possible.
                if (!op.inverted)
                    op.deadWires?.forEach(deleteWire);
                oldPorts?.forEach(deletePort);
                newPorts?.forEach(addPort);
                if (op.inverted)
                    op.deadWires?.forEach(addWire);
                return OkVoid();
            }
            case "ConnectWireOp": {
                return this.getPortByID(op.w.p1)
                    .andThen((p1) => this.getPortByID(op.w.p2)
                        .andThen((p2) => checkWireConnectivity(p1, p2).and(checkWireConnectivity(p2, p1)))
                        .map((_) => { (op.inverted ? deleteWire : addWire)(op.w); }));
            }
            case "SplitWireOp": {
                throw new Error("Unimplemented");
            }
            case "SetPropertyOp": {
                return this.getObjectAndInfoByID(op.id)
                    .andThen(([obj, info]) => info.checkPropValue(op.key, op.newVal)
                        .uponOk(() => {
                            // Copy-on-write
                            obj.props = { ...obj.props };
                            if (op.newVal)
                                obj.props[op.key] = op.newVal;
                            else
                                delete obj.props[op.key];
                            return OkVoid();
                        }));
            }
            default:
                throw new Error("TODO: impossible block");
        }
    }
    
    private getPortPortMapChecked(id: GUID): Set<GUID> {
        const p = this.portPortMap.get(id);
        if (!p)
            throw new Error(`Invariant Violation: getPortPortMapChecked(${id}) unexpectedly returned undefined`);
        return p;
    }


    // TODO: load with some initial state
    public constructor(objInfo: ObjInfoProvider, log: CircuitLog) {
        this.objInfo = objInfo;
        
        this.log = log;
        this.clock = log.clock;

        this.transaction = false;
        this.transactionOps = [];

        this.objStorage = new Map();

        this.componentPortsMap = new Map();
        this.portPortMap = new Map();
        this.portWireMap = new Map();

        this.CircuitMetadata = { id: "", name: "", desc: "", thumb: "", version: "type/v0"}

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
        })
    }

    private applyOpsChecked(ops: CircuitOp[]): void {
        // TODO: If any exceptions are thrown by applying server-provided ops, this is a BUG
        //  and the site should force reload to get back to a consistent state.
        ResultUtil.mapIter(ops.values(), this.applyOp)
            .mapErr(AddErrE("Internal applyOp failed!  Client state is inconsistent!"))
            .unwrap();
    }

    private transformTransaction(ops: CircuitOp[]): void {
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
    private endTransactionHelper(f: (txOps: CircuitOp[]) => void): void {
        this.assertTransactionState(true);

        // To be safe for re-entrant calls, make sure the tx state is reset before proposing.
        this.transaction = false;
        if (this.transactionOps.length > 0) {
            const txOps = this.transactionOps;
            this.transactionOps = [];
            f(txOps);
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
    // TODO: This should return some reference representing the LogEntry
    public commitTransaction(): void {
        this.endTransactionHelper((txOps) => {
            // Sanity check: Clock should be kept updated by the event handler.
            if (this.clock !== this.log.clock)
                throw new Error(`Unexpected clock difference (${this.clock} vs ${this.log.clock})`
                                + ". Maybe a missed event?");
            this.log.propose(txOps);
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
            .uponErr(this.cancelTransaction)
            .uponOk(() => {
                // Push only after successful op
                this.transactionOps.push(op);
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
        return this.getCompByID(id)
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
        return this.getWireByID(id)
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
        return this.getMutableObjByID(id)
            .andThen((obj) => this.addTransactionOp(
                { id, kind: "SetPropertyOp", key, oldVal: obj.props[key], newVal }));
    }

    public getObjectInfo(kind: string): ObjInfo {
        const info = this.objInfo.get(kind);
        if (!info)
            throw new Error(`Unknown obj type ${kind}!`);
        return info;
    }
    public getComponentInfo(kind: string): ComponentInfo {
        const info = this.objInfo.getComponent(kind);
        if (!info)
            throw new Error(`Unknown component type ${kind}!`);
        return info;
    }

    private getObjectAndInfoByID(id: GUID): Result<[Schema.Obj, ObjInfo]> {
        return this.getMutableObjByID(id)
            .map((obj) => [obj, this.getObjectInfo(obj.kind)]);
    }

    private getComponentAndInfoByID(id: GUID): Result<[Schema.Component, ComponentInfo]> {
        return this.getCompByID(id)
            .map((c) => [c, this.getComponentInfo(c.kind)]);
    }

    public setPortConfig(id: GUID, portConfig: PortConfig): Result {
        // Make new ports
        return this.getComponentAndInfoByID(id)
            .andThen(([_, info]) => info.makePortsForConfig(id, portConfig))
            .andThen((newPorts) => {
                // TODO: match old ports to new ports based on group/index so ID's / refs are reused.

                // Collect old ports.  unwraps are safe b/c invariants require component/ports exists.
                const oldPorts = [...this.getPortsForComponent(id).unwrap()].map((id) => this.getPortByID(id).unwrap());

                // TODO: collect deleted wires

                // NOTE: "applyOp" will need to double-check this list of ports is valid.
                return this.addTransactionOp({
                    kind:      "SetComponentPortsOp",
                    inverted:  false,
                    component: id,
                    newPorts, oldPorts,
                });
            });
    }

    public setCircuitMetadata(newMetadata: Schema.CircuitMetadata) {
        this.CircuitMetadata = newMetadata;
    }

    //
    // Getters below.  Returned objects should not be modified directly.
    //

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

    private getBaseKindByID<O extends Schema.Obj>(id: GUID, kind: O["baseKind"]): Result<O> {
        return this.getObjByID(id)
            .andThen((obj): Result<O> => {
                if (obj.baseKind !== kind)
                    return ErrE(`CircuitInternal: Attempted to get ${kind} by ID ${id} but received ${obj.baseKind}!`);
                return Ok(obj as O);
            });
    }
    private getMutableObjByID(id: GUID): Result<Readonly<Schema.Obj>> {
        return WrapResOrE(this.objStorage.get(id), `Invalid object GUID ${id}`);
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
    public getObjs(): IterableIterator<GUID> {
        return this.objStorage.keys();
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

    public getCircuitMetadata(): Readonly<Schema.CircuitMetadata> {
      return this.CircuitMetadata;
    }
}
