import {GUID} from "core/schema/GUID";
import {Schema} from "../../schema";
import {GetDebugInfo} from "../utils/Debug";
import {DebugOptions} from "./DebugOptions";
import {HistoryManager} from "./HistoryManager";
import {SelectionsManager} from "./SelectionsManager";


export class CircuitInternal {
    protected readonly circuit: Schema.Circuit;

    protected readonly selections: SelectionsManager;
    protected readonly history: HistoryManager;

    protected objMap: Map<GUID, Schema.Obj>;
    protected componentPortsMap: Map<GUID, Schema.Port[]>; // components to ports
    protected connectionsMap: Map<GUID, Schema.Wire[]>; // Ports to wires

    public debugOptions: DebugOptions; 
    public isLocked: boolean;

    public constructor() {
        this.circuit = Schema.DefaultCircuit();
        this.selections = new SelectionsManager();
        this.history = new HistoryManager();

        this.objMap = new Map();
        this.componentPortsMap = new Map();

        this.debugOptions = {
            debugCullboxes: false,
            debugNoFill: false,
            debugPressableBounds: false,
            debugSelectionBounds: false,
        };
        this.isLocked = false;
    }

    public addObj(obj: Schema.Obj) {
        if (this.objMap.has(obj.id))
            throw new Error(`CircuitInternal: Attempted to add obj ${GetDebugInfo(obj)} which already existed in the circuit!`);

        this.circuit.objects.push(obj);
        this.objMap.set(obj.id, obj);
    }
    public removeObj(obj: Schema.Obj) {
        if (!this.objMap.has(obj.id))
            throw new Error(`CircuitInternal: Attempted to remove obj ${GetDebugInfo(obj)} which does not exist in the circuit!`);

        // TODO: make this more efficient, somehow keep track of the indices of each object
        this.circuit.objects.splice(this.circuit.objects.indexOf(obj), 1);
        this.objMap.delete(obj.id);
    }

    public setPropFor<O extends Schema.Obj, K extends keyof O["props"]>(obj: O, key: K, val: O["props"][K]) {
        throw new Error("Unimplemented");
    }
    public getPropFrom<O extends Schema.Obj, K extends keyof O["props"]>(obj: O, key: K): O["props"][K] | undefined {
        throw new Error("Unimplemented");
    }

    public getObjs(): readonly Schema.Obj[] {
        return this.circuit.objects;
    }

    public getObjByID(id: GUID): Schema.Obj | undefined {
        return this.getObjByID(id);
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
