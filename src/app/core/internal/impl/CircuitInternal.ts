import {GUID} from "core/schema/GUID";

import {Schema} from "../../schema";

import {CircuitLog}                                                           from "./CircuitLog";
import {CircuitOp, InvertCircuitOp, TransformCircuitOps}                      from "./CircuitOps";
import {ComponentInfo, IsValidPortList, ObjInfo, ObjInfoProvider, PortConfig} from "./ComponentInfo";


// REFERENCE POLICY:
//  OUTGOING REFERENCES:
//      1. GUIDs: Retain these to reference Objects at a later time.
//      2. Schema types: Guaranteed not to change, but MUST NOT be modified.
//  INCOMING REFERENCES:
//      1. GUIDs: Accepted as the primary reference type.
//      2. Non-trivial types: No incoming references are retained.
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

    // Placed here for proximity to member declarations
    private applyOp(op: CircuitOp): void {
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
        const checkWireConnectivity = (p1: Schema.Port, p2: Schema.Port): void => {
            const map = new Map([[p1, [p2]]]);
            this.componentPortsMap.get(p1.parent)?.forEach((id) => {
                const to = this.getPortPortMapChecked(id);
                map.set(p1, [...to].map((id) => this.getPortByIDChecked(id)));
            });
            if (!this.getComponentInfoByID(p1.parent).isValidPortConnectivity(map))
                throw new Error("Wire connectivity is not allowed");
        };
        switch (op.kind) {
            case "PlaceComponentOp": {
                if (op.inverted) {
                    if (!this.componentPortsMap.has(op.c.id))
                        throw new Error("Deleted component should have componentPortsMap initialized!");
                    if (this.componentPortsMap.get(op.c.id)!.size > 0)
                        throw new Error("Deleted component should not have ports");

                    this.objStorage.delete(op.c.id);

                    // Delete port entry
                    this.componentPortsMap.delete(op.c.id);
                } else {
                    if (this.componentPortsMap.has(op.c.id))
                        throw new Error("Placed component should not have any ports");

                    this.objStorage.set(op.c.id, op.c);

                    // Initialize blank port set
                    this.componentPortsMap.set(op.c.id, new Set());
                }
                break;
            }
            case "SetComponentPortsOp": {
                const [newPorts, oldPorts] = op.inverted ? [op.oldPorts, op.newPorts] : [op.newPorts, op.oldPorts];

                if (newPorts && !IsValidPortList(this.getComponentInfoByID(op.component), newPorts))
                    throw new Error("Invalid new port list for component");

                // TODO: factor in overlap between new/old ports to preserve wires when possible.
                if (!op.inverted)
                    op.deadWires?.forEach(deleteWire);
                oldPorts?.forEach(deletePort);
                newPorts?.forEach(addPort);
                if (op.inverted)
                    op.deadWires?.forEach(addWire);
                break;
            }
            case "ConnectWireOp": {
                const port1 = this.getPortByID(op.w.p1);
                const port2 = this.getPortByID(op.w.p2);
                if (!port1 || !port2)
                    throw new Error("Provided port GUIDs are invalid");

                checkWireConnectivity(port1, port2);
                checkWireConnectivity(port2, port1);

                (op.inverted ? deleteWire : addWire)(op.w);
                break;
            }
            case "SplitWireOp": {
                throw new Error("Unimplemented");
            }
            case "SetPropertyOp": {
                const obj = this.objStorage.get(op.id);
                if (!obj)
                    throw new Error("Object did not exist");

                // Check the value is valid
                const info = this.getObjectInfoByID(obj.kind);
                if (!info.checkPropValue(op.key, op.newVal))
                    throw new Error("Illegal prop value");

                // Copy-on-write
                obj.props = { ...obj.props };
                if (op.newVal)
                    obj.props[op.key] = op.newVal;
                else
                    delete obj.props[op.key];
                break;
            }
            default:
                throw new Error("TODO: impossible block");
        }
    }

    private getPortPortMapChecked(id: GUID): Set<GUID> {
        const p = this.portPortMap.get(id);
        if (!p)
            throw new Error("getPortPortMapChecked: invariant violation");
        return p;
    }
    private getPortByIDChecked(id: GUID): Schema.Port {
        const p = this.getPortByID(id);
        if (!p)
            throw new Error("getPortByIDChecked: invariant violation");
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

        this.log.subscribe((evt) => {
            this.clock = evt.clock;
            // Optimization: If there are no remote entries then the ops are already applied.
            if (evt.remote.length === 0)
                return;

            // TODO: If any exceptions are thrown by applying server-provided ops, this is a BUG
            //  and the site should force reload to get back to a consistent state.

            // Apply remote updates mid-transaction so this state is up-to-date.
            if (this.transaction)
                this.transformTransaction(evt.ops);
            else
                evt.ops.forEach((op) => this.applyOp(op));
        })
    }

    private transformTransaction(ops: CircuitOp[]): void {
        // Revert tx ops
        [...this.transactionOps].reverse().forEach((op) => this.applyOp(InvertCircuitOp(op)));

        // Apply ops
        ops.forEach((op) => this.applyOp(op));

        // Transform tx ops
        const transformedTx = TransformCircuitOps(this.transactionOps, ops);

        if (transformedTx) {
            // Reapply tx ops
            this.transactionOps.forEach((op) => this.applyOp(op));
        } else {
            // Failed to transform partial transaction, so cancel it
            this.transactionOps = [];
            this.transaction = false;
        }
    }

    private assertTransactionState(state: boolean): void {
        if (this.transaction !== state)
            throw new Error("Unexpectedly in transaction state");
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
            txOps.reverse().forEach((op) => this.applyOp(InvertCircuitOp(op)));
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

    protected addTransactionOp(op: CircuitOp): void {
        this.assertTransactionState(true);

        try {
            // read-your-writes
            this.applyOp(op);
        } catch (e) {
            // Cancel transaction in unsuccessful op
            this.cancelTransaction();
            throw e;
        }

        // Push only after successful op
        this.transactionOps.push(op);
    }

    public placeComponent(kind: string, props: Schema.Component["props"]): GUID {
        const id = Schema.uuid();
        this.addTransactionOp({
            kind:     "PlaceComponentOp",
            inverted: false,
            c:        {
                baseKind: "Component",
                kind:     kind,
                id:       id,
                props:    { ...props }, // Copy non-trivial object
            },
        });
        return id;
    }

    // public replaceComponent(id: GUID, newKind: string): void {
    //     // TODO: Check that component's current port list is compatable with the "newKind" ComponentInfo
    //     // TODO: Maybe this needs a dedicated Op b/c updating kind isn't covered by `SetPropertyOp`
    //     throw new Error("Unimplemented");
    // }

    public deleteComponent(id: GUID): void {
        const obj = this.objStorage.get(id);
        if (!obj || obj.baseKind !== "Component")
            throw new Error("Invalid GUID");

        this.addTransactionOp({
            kind:     "PlaceComponentOp",
            inverted: true,
            c:        obj, // No copy needed
        })
    }

    public connectWire(kind: string, p1: GUID, p2: GUID, props: Schema.Wire["props"] = {}): GUID {
        const id = Schema.uuid();
        this.addTransactionOp({
            kind:     "ConnectWireOp",
            inverted: false,
            w:        {
                baseKind: "Wire",
                props:    { ...props }, // Copy non-trivial object
                kind, id, p1, p2,
            },
        });
        return id;
    }

    public deleteWire(id: GUID): void {
        const obj = this.objStorage.get(id);
        if (!obj || obj.baseKind !== "Wire")
            throw new Error("Invalid GUID");

        this.addTransactionOp({
            kind:     "ConnectWireOp",
            inverted: true,
            w:        obj, // No copy needed
        })
    }

    // TODO: Re-add the type-safe-ish one, maybe rename this one, idk.
    public setPropFor<
        O extends Schema.Obj,
        K extends keyof O["props"] & string
    >(id: GUID, key: K, newVal?: O["props"][K]) {
        const obj = this.objStorage.get(id);
        if (!obj)
            throw new Error("Bad GUID");
        const oldVal = obj.props[key];

        // NOTE: applyOp will check the ComponentInfo that it is the correct type
        this.addTransactionOp({ id, kind: "SetPropertyOp", key, oldVal, newVal });
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

    private getObjectInfoByID(id: GUID): ObjInfo {
        const obj = this.objStorage.get(id);
        if (!obj)
            throw new Error(`Invalid obj GUID ${id}`);
        return this.getObjectInfo(obj.kind);
    }

    private getComponentInfoByID(id: GUID): ComponentInfo {
        const obj = this.objStorage.get(id);
        if (!obj || obj.baseKind !== "Component")
            throw new Error(`Invalid component GUID ${id}`);
        return this.getComponentInfo(obj.kind);
    }
    public setPortConfig(id: GUID, portConfig: PortConfig): void {
        // Make new ports
        const newPorts = this.getComponentInfoByID(id).makePortsForConfig(id, portConfig);
        if (!newPorts)
            throw new Error("Failed to set port config: Invalid port config");

        // TODO: match old ports to new ports based on group/index so ID's / refs are reused.

        // Collect old ports
        const oldPorts = [] as Schema.Port[];
        this.getPortsForComponent(id)?.forEach((id) => {
            // Safe cast according to invariants
            oldPorts.push(this.getPortByID(id) as Schema.Port);
        });

        // TODO: collect deleted wires

        // NOTE: "applyOp" will need to double-check this list of ports is valid.
        this.addTransactionOp({ kind: "SetComponentPortsOp", inverted: false, component: id, newPorts, oldPorts })
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

    private getBaseKindByID<O extends Schema.Obj>(id: GUID, kind: O["baseKind"]): O | undefined {
        const obj = this.objStorage.get(id);
        if (!obj)
            return;
        if (obj.baseKind !== kind)
            throw new Error(`CircuitInternal: Attempted to get ${kind} by ID ${id} but received ${obj.baseKind}!`);
        return obj as O;
    }
    public getObjByID(id: GUID): Readonly<Schema.Obj> | undefined {
        return this.objStorage.get(id);
    }
    public getCompByID(id: GUID): Readonly<Schema.Component> | undefined {
        return this.getBaseKindByID<Schema.Component>(id, "Component");
    }
    public getWireByID(id: GUID): Readonly<Schema.Wire> | undefined {
        return this.getBaseKindByID<Schema.Wire>(id, "Wire");
    }
    public getPortByID(id: GUID): Readonly<Schema.Port> | undefined {
        return this.getBaseKindByID<Schema.Port>(id, "Port");
    }
    public getObjs(): IterableIterator<GUID> {
        return this.objStorage.keys();
    }

    public getPortsForComponent(id: GUID): ReadonlySet<GUID> {
        const ports = this.componentPortsMap.get(id);
        if (!ports)
            throw new Error(`CircuitInternal: Attempted to get ports for component ${id}, but failed to find an entry!`);
        return ports;
    }

    public getPortsForWire(id: GUID): readonly [GUID, GUID] {
        const ports = this.getWireByID(id);
        if (!ports)
            throw new Error(`CircuitInternal: Attempted to get ports for wire ${id}, but failed to find an entry!`);
        return [ ports.p1, ports.p1 ];
    }

    public getWiresForPort(id: GUID): ReadonlySet<GUID> {
        const wires = this.portWireMap.get(id);
        if (!wires)
            throw new Error(`CircuitInternal: Attempted to get wires for port ${id}, but failed to find an entry!`);
        return wires;
    }
}
