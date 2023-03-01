import {AddErrE}                              from "core/utils/MultiError";
import {ErrE, Ok, OkVoid, Result, WrapResOrE} from "core/utils/Result";

import {GUID} from "core/schema/GUID";

import {Schema} from "../../schema";

import {CircuitOp, ConnectWireOp, PlaceComponentOp, SetComponentPortsOp, SetPropertyOp}       from "./CircuitOps";
import {CheckPortList, ComponentInfo, ObjInfo, ObjInfoProvider, PortConfig, PortListToConfig} from "./ComponentInfo";


export interface ReadonlyCircuitDocument {
    getObjectInfo(kind: string): ObjInfo;
    getComponentInfo(kind: string): ComponentInfo;

    getObjectAndInfoByID(id: GUID): Result<[Readonly<Schema.Obj>, ObjInfo]>;
    getComponentAndInfoByID(id: GUID): Result<[Readonly<Schema.Component>, ComponentInfo]>;

    hasComp(id: GUID): boolean;
    hasWire(id: GUID): boolean;
    hasPort(id: GUID): boolean;

    getObjByID(id: GUID): Result<Readonly<Schema.Obj>>;
    getCompByID(id: GUID): Result<Readonly<Schema.Component>>;
    getWireByID(id: GUID): Result<Readonly<Schema.Wire>>;
    getPortByID(id: GUID): Result<Readonly<Schema.Port>>;
    getObjs(): IterableIterator<GUID>;

    // Graph connectivity
    getPortsForComponent(id: GUID): Result<ReadonlySet<GUID>>;
    getPortsForWire(id: GUID): Result<Readonly<[GUID, GUID]>>;
    getWiresForPort(id: GUID): Result<ReadonlySet<GUID>>;

    getPortConfig(id: GUID): Result<PortConfig>;
}

// The authoritative accumulated Circuit document type.  Contains all logic to validate and apply CircuitOps.  The
// internal representation is optimized for graph traversal.
//
// See CircuitInternal for exception/reference policies.
export class CircuitDocument implements ReadonlyCircuitDocument {
    private readonly objInfo: ObjInfoProvider;

    // Object storage
    private readonly objStorage: Map<GUID, Schema.Obj>;

    // Graph connectivity
    private readonly componentPortsMap: Map<GUID, Set<GUID>>; // Components to ports
    private readonly portPortMap: Map<GUID, Set<GUID>>; // Ports to other ports (bidirectional)
    private readonly portWireMap: Map<GUID, Set<GUID>>; // Ports to their wires

    // TODO: load with some initial state
    public constructor(objInfo: ObjInfoProvider) {
        this.objInfo = objInfo;

        this.objStorage = new Map();

        this.componentPortsMap = new Map();
        this.portPortMap = new Map();
        this.portWireMap = new Map();
    }

    //
    // Internal helpers
    //
    // TODO: add helper that checks all invariants of the internal rep.
    //

    private deleteWire(w: Schema.Wire) {
        this.objStorage.delete(w.id);

        this.portPortMap.get(w.p1)!.delete(w.p2);
        this.portPortMap.get(w.p2)!.delete(w.p1);

        this.portWireMap.get(w.p1)!.delete(w.id);
        this.portWireMap.get(w.p2)!.delete(w.id);
    }

    private addWire(w: Schema.Wire) {
        this.objStorage.set(w.id, w);

        this.portPortMap.get(w.p1)!.add(w.p2);
        this.portPortMap.get(w.p2)!.add(w.p1);

        this.portWireMap.get(w.p1)!.add(w.id);
        this.portWireMap.get(w.p2)!.add(w.id);
    }

    private deletePort(p: Schema.Port) {
        this.objStorage.delete(p.id);

        this.componentPortsMap.get(p.parent)!.delete(p.id);
        this.portPortMap.delete(p.id);
        this.portWireMap.delete(p.id);
    }

    private addPort(p: Schema.Port) {
        this.objStorage.set(p.id, p);

        this.componentPortsMap.get(p.parent)!.add(p.id);
        this.portPortMap.set(p.id, new Set());
        this.portWireMap.set(p.id, new Set());
    }

    private checkWireConnectivity(p1: Schema.Port, p2: Schema.Port) {
        const map = new Map([[p1, [p2]]]);
        this.componentPortsMap.get(p1.parent)!.forEach((id) => {
            const to = this.getPortPortMapChecked(id);
            map.set(p1, [...to].map((id) => this.getPortByID(id).unwrap()));
        });
        return this.getComponentAndInfoByID(p1.parent)
            .andThen(([_, info]) => info.checkPortConnectivity(map)
                .mapErr(AddErrE(`Adding wire from port ${p1} to ${p2} is creates an illegal configuration.`)));
    }

    private getPortPortMapChecked(id: GUID): Set<GUID> {
        const p = this.portPortMap.get(id);
        if (!p)
            throw new Error(`Invariant Violation: getPortPortMapChecked(${id}) unexpectedly returned undefined`);
        return p;
    }

    private getMutableObjByID(id: GUID): Result<Schema.Obj> {
        return WrapResOrE(this.objStorage.get(id), `Invalid object GUID ${id}`);
    }

    private getMutObjectAndInfoByID(id: GUID): Result<[Schema.Obj, ObjInfo]> {
        return this.getMutableObjByID(id)
            .map((obj) => [obj, this.getObjectInfo(obj.kind)]);
    }

    //
    // Mutations.  CircuitDocument is mutated exclusively through CircuitOps.
    //

    public applyOp(op: CircuitOp): Result {
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

    public placeComponent(op: PlaceComponentOp) {
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
    }

    public setComponentPorts(op: SetComponentPortsOp): Result {
        const addedPorts = op.inverted ? op.removedPorts : op.addedPorts;
        const removedPorts = op.inverted ? op.addedPorts : op.removedPorts;
        const removedPortIds = new Set(removedPorts.map((p) => p.id));

        return this.getComponentAndInfoByID(op.component)
            .andThen(([_, info]) => this.getPortsForComponent(op.component)
                // Filter removed ports
                .map((portIds) => [...portIds]
                    .filter((p) => !removedPortIds.has(p))
                    .map((p) => this.getPortByID(p).unwrap()))
                // Inject added ports
                .map((ports) => [...ports, ...addedPorts])
                .andThen((newPorts) => CheckPortList(info, newPorts)
                    .mapErr(AddErrE(`Invalid new port list ${newPorts} for component ${op.component}`))))
            .uponOk(() => {
                if (!op.inverted)
                    op.deadWires.forEach((w) => this.deleteWire(w));
                removedPorts.forEach((p) => this.deletePort(p));
                addedPorts.forEach((p) => this.addPort(p));
                if (op.inverted)
                    op.deadWires.forEach((w) => this.addWire(w));
            });
    }

    public connectWire(op: ConnectWireOp): Result {
        return this.getPortByID(op.w.p1)
            .andThen((p1) => this.getPortByID(op.w.p2)
                .andThen((p2) => this.checkWireConnectivity(p1, p2).and(this.checkWireConnectivity(p2, p1)))
                .map((_) => op.inverted ? this.deleteWire(op.w) : this.addWire(op.w)));
    }

    public setProperty(op: SetPropertyOp): Result {
        return this.getMutObjectAndInfoByID(op.id)
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

    //
    // Getters.  Returned objects should not be modified directly.
    //

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

    public getObjectAndInfoByID(id: GUID): Result<[Readonly<Schema.Obj>, ObjInfo]> {
        return this.getObjByID(id)
            .map((obj) => [obj, this.getObjectInfo(obj.kind)]);
    }

    public getComponentAndInfoByID(id: GUID): Result<[Readonly<Schema.Component>, ComponentInfo]> {
        return this.getCompByID(id)
            .map((c) => [c, this.getComponentInfo(c.kind)]);
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

    public getPortConfig(id: GUID): Result<PortConfig> {
        return this.getPortsForComponent(id)
            .map((portIDs) => [...portIDs].map((s) => this.getPortByID(s).unwrap()))
            .map(PortListToConfig);
    }
}
