import { GUID } from "core/schema/GUID";

import { Schema } from "../../schema";
import { GetDebugInfo } from "../utils/Debug";
import { CircuitOp, InvertMultiOp, MultiOp } from "./CircuitOps";
import { ComponentInfoProvider, PortConfig } from "./ComponentInfo";

import { HistoryManager } from "./HistoryManager";

export class CircuitInternal {
    protected readonly history: HistoryManager;
    protected readonly componentTypes: ComponentInfoProvider;

    protected objMap: Map<GUID, Schema.Obj>;
    protected componentPortsMap: Map<GUID, Schema.Port[]>; // components to ports
    protected connectionsMap: Map<GUID, Schema.Wire[]>; // Ports to wires

    // Explicit variable only needed for asserts.  JS threading model means no mutex needed, but it
    // is possible for an async call mid-transaction to yield control-flow to another task and break
    // atomicity of transactions.  Any behavior that yields control-flow mid transaction is ILLEGAL,
    // and thus guarded by asserts.
    protected transaction: boolean;

    // TODO: Can the emitted events be completely generated from this Ops list?
    protected transactionOps: CircuitOp[];

    public constructor(componentsTypes: ComponentInfoProvider) {
        this.history = new HistoryManager();
        this.componentTypes = componentsTypes;

        this.objMap = new Map();
        this.componentPortsMap = new Map();
        this.connectionsMap = new Map();

        this.transaction = false;
        this.transactionOps = [];
    }

    private assertOwnObject(obj: Schema.Obj): void {
        if (this.objMap.get(obj.id) !== obj)
            throw new Error("Circuit does not own provided object");
    }
    private assertHasGUID(id: GUID): void {
        if (!this.objMap.has(id))
            throw new Error("Circuit does not own provided GUID");
    }
    // Public for use by i.e. the Renderer, Propagators.
    public assertTransactionState(st: boolean): void {
        if (this.transaction != st)
            throw new Error("Unexpectedly in transaction state");
    }

    public beginTransaction(): void {
        this.assertTransactionState(false);
        this.transaction = true;
    }
    public commitTransaction(): MultiOp | undefined {
        this.assertTransactionState(true);
        let op: MultiOp | undefined = undefined;
        if (this.transactionOps.length > 0) {
            op = { kind: "MultiOp", ops: this.transactionOps };
            this.history.push(op);
            this.transactionOps = [];

            // TODO: Emit events for changes...
        }
        this.transaction = false;
        return op;
    }
    public cancelTransaction(): void {
        this.assertTransactionState(true);
        if (this.transactionOps.length > 0) {
            InvertMultiOp({ kind: "MultiOp", ops: this.transactionOps }).ops.forEach(rollbackOp => {
                this.applyOp(rollbackOp);
            });
            // TODO: Dump in-progress events
            this.transactionOps = [];
        }
        this.transaction = false;
    }

    private undoRedoHelper(op?: MultiOp): boolean {
        if (op === undefined)
            return false;

        this.beginTransaction();
        op.ops.forEach(o => this.applyOp(o));
        this.commitTransaction();

        return true;
    }
    public undo(): boolean {
        return this.undoRedoHelper(this.history.undo());
    }
    public redo(): boolean {
        return this.undoRedoHelper(this.history.redo());
    }

    // Wrap all mutations in this proto-operational-transform function as guard-rails of our impl.
    protected applyOp(op: CircuitOp): void {
        this.transactionOps.push(op);
        // TODO: Accumulate changes here / prepare events
        switch (op.kind) { /* TODO: all of the mutate logic */ }
    }

    //
    // Convenience functions around CircuitOps
    //

    public placeComponent(kind: string, props: Schema.Component["props"]): void {
        const g: GUID = ""; // TODO: generatre
        this.applyOp({
            kind: "PlaceComponentOp",
            inverted: false,
            c: {
                baseKind: "Component",
                kind: kind,
                id: g,
                props: props,
            },
            wires: [],
            ports: [], // NOTE: Ports are added separately in "setPortConfig".
        });
    }

    // TODO: Should this take a component object for type safety?
    public replaceComponent(id: GUID, newKind: string): void {
        // TODO: Check that component's current port list is compatable with the "newKind" ComponentInfo
        // TODO: Maybe this needs a dedicated Op b/c updating kind isn't covered by `SetPropertyOp`
        throw new Error("Unimplemented");
    }

    public deleteObject(id: GUID): void {
        // TODO: one of these per type?
        throw new Error("Unimplemented");
    }

    public setPropFor<O extends Schema.Obj, K extends keyof O["props"]>(obj: O, key: K, val?: O["props"][K]) {
        this.assertOwnObject(obj);
        const oldVal: O["props"][K] | undefined = obj[key];
        this.applyOp({ kind: "SetPropertyOp", key: String(key), newVal: val, oldVal: oldVal });
    }

    public setPortConfig(id: GUID, p: PortConfig): void {
        const obj = this.getCompByID(id);
        if (!obj)
            throw new Error("Failed to set port config: invalid GUID");
        const componentInfo = this.componentTypes.get(obj.kind);
        if (componentInfo === undefined)
            throw new Error("Failed to set port config: Unknown component type (this is really bad)");
        const ports = componentInfo.makePortsForConfig(id, p);
        if (ports === undefined)
            throw new Error("Failed to set port config: Invalid port config");

        // NOTE: "applyOp" will need to double-check this list of ports is valid.
        this.applyOp({ kind: "SetComponentPortsOp", component: id, newPorts: ports })
    }

    //
    // Getters below.  Returns references must only be used ephemerally!
    //  (i.e. never across async/mutate boundaries)
    //

    public getPropFrom<O extends Schema.Obj, K extends keyof O["props"]>(id: GUID): O["props"][K] | undefined {
        throw new Error("Unimplemented");
    }

    public getObjs(): IterableIterator<Schema.Obj> {
        return this.objMap.values();
    }

    private getBaseKindByID<O extends Schema.Obj>(id: GUID, kind: O["baseKind"]): O | undefined {
        const obj = this.objMap.get(id);
        if (!obj)
            return;
        if (obj.baseKind !== kind)
            throw new Error(`CircuitInternal: Attempted to get ${kind} by ID ${id} but received ${GetDebugInfo(obj)}!`);
        return obj as O;
    }
    public getCompByID(id: GUID): Schema.Component | undefined {
        return this.getBaseKindByID<Schema.Component>(id, "Component");
    }
    public getWireByID(id: GUID): Schema.Wire | undefined {
        return this.getBaseKindByID<Schema.Wire>(id, "Wire");
    }
    public getPortByID(id: GUID): Schema.Port | undefined {
        return this.getBaseKindByID<Schema.Port>(id, "Port");
    }

    public getPortsForComponent(c: Schema.Component): readonly Schema.Port[] {
        const ports = this.componentPortsMap.get(c.id);
        if (!ports)
            throw new Error(`CircuitInternal: Attempted to get ports for component ${GetDebugInfo(c)}, but failed to find an entry!`);
        return ports;
    }

    public getPortsForWire(w: Schema.Wire): readonly [Schema.Port, Schema.Port] {
        const p1 = this.getPortByID(w.p1);
        const p2 = this.getPortByID(w.p2);
        if (!p1)
            throw new Error(`CircuitInternal: Attempted to get port 1 for ${GetDebugInfo(w)}, but received nothing! (ID ${w.p1})`);
        if (!p2)
            throw new Error(`CircuitInternal: Attempted to get port 2 for ${GetDebugInfo(w)}, but received nothing! (ID ${w.p2})`);
        return [p1, p2];
    }

    public getWiresFor(p: Schema.Port): readonly Schema.Wire[] {
        const wires = this.connectionsMap.get(p.id);
        if (!wires)
            throw new Error(`CircuitInternal: Attempted to get wires for port ${GetDebugInfo(p)}, but failed to find an entry!`);
        return wires;
    }
}
