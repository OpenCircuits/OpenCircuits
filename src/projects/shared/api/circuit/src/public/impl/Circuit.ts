/* eslint-disable @typescript-eslint/no-parameter-properties */
import {V, Vector} from "Vector";
import {Rect} from "math/Rect";

import {Schema} from "shared/api/circuit/schema";

import {CircuitInternal, GUID, uuid} from "shared/api/circuit/internal";

import {Circuit, CircuitEvent, CircuitHistory, CircuitHistoryEvent, ICPin, IntegratedCircuit,
        IntegratedCircuitDisplay} from "../Circuit";

import {CircuitState, CircuitTypes} from "./CircuitState";
import {SelectionsImpl}             from "./Selections";
import {ObservableImpl} from "../../utils/Observable";
import {ObjContainerImpl} from "./ObjContainer";
import {LogEntry} from "../../internal/impl/CircuitLog";
import {ReadonlyComponent} from "../Component";
import {ReadonlyWire} from "../Wire";
import {ReadonlyPort} from "../Port";
import {Camera} from "../Camera";
import {CameraImpl} from "./Camera";


function ConvertComp(c: ReadonlyComponent): Schema.Component {
    return {
        baseKind: "Component",
        id:       c.id,
        kind:     c.isIC() ? "IC" : c.kind,
        icId:     c.isIC() ? c.kind : undefined,
        props:    c.getProps(),
    };
}
function ConvertWire(w: ReadonlyWire): Schema.Wire {
    return {
        baseKind: "Wire",
        id:       w.id,
        kind:     w.kind,
        p1:       w.p1.id,
        p2:       w.p2.id,
        props:    w.getProps(),
    };
}
function ConvertPort(p: ReadonlyPort): Schema.Port {
    return {
        baseKind: "Port",
        id:       p.id,
        kind:     p.kind,
        parent:   p.parent.id,
        group:    p.group,
        index:    p.index,
        props:    p.getProps(),
    };
}
function ConvertIC(ic: IntegratedCircuit): Schema.IntegratedCircuit {
    return {
        metadata: {
            id:      ic.id,
            name:    ic.name,
            desc:    ic.desc,
            thumb:   ic.thumbnail,
            version: "/",

            displayWidth:  ic.display.size.x,
            displayHeight: ic.display.size.y,
            pins:          ic.display.pins.map((p) => ({
                id:    p.id,
                group: p.group,
                name:  p.name,

                x:  p.pos.x,
                y:  p.pos.y,
                dx: p.dir.x,
                dy: p.dir.y,
            })),
        },
        comps: ic.components.map(ConvertComp),
        ports: ic.all.ports.map(ConvertPort),
        wires: ic.wires.map(ConvertWire),
    };
}

export type RemoveICCallback = (id: GUID) => void;

export class HistoryImpl extends ObservableImpl<CircuitHistoryEvent> implements CircuitHistory {
    protected readonly internal: CircuitInternal;

    public constructor(internal: CircuitInternal) {
        super();

        this.internal = internal;

        this.internal["log"].subscribe((ev) => {
            if (ev.accepted.length === 0)
                return;
            this.publish({ type: "change" });
        })
    }

    public getUndoStack(): readonly LogEntry[] {
        return this.internal.getUndoHistory();
    }
    public getRedoStack(): readonly LogEntry[] {
        return this.internal.getRedoHistory();
    }
    public clear(): void {
        return this.internal.clearHistory();
    }
}

export class CircuitImpl<T extends CircuitTypes> extends ObservableImpl<CircuitEvent> implements Circuit {
    protected readonly state: CircuitState<T>;

    public readonly camera: Camera;

    public readonly selections: SelectionsImpl<T>;
    public readonly history: CircuitHistory;

    public constructor(state: CircuitState<T>) {
        super();

        this.state = state;

        this.selections = new SelectionsImpl<T>(state);
        this.history = new HistoryImpl(state.internal);

        this.camera = new CameraImpl(state);

        // This ordering is important, because it means that all previous circuit subscription calls will happen
        // before any public/outside subscriptions. (i.e. selections are updated before circuit subscribers are called).
        state.internal.subscribe((ev) => {
            if (ev.type !== "CircuitOp")
                return;
            this.publish({ type: "change", diff: ev.diff });
        });
    }

    private get internal(): CircuitInternal {
        return this.state.internal;
    }

    private pickObjAtHelper(pt: Vector, filter?: (id: string) => boolean) {
        return this.state.assembler.findNearestObj(pt, filter);
    }
    private pickObjsWithinHelper(bounds: Rect, filter?: (id: string) => boolean) {
        return this.state.assembler.findObjsWithin(bounds, filter);
    }

    public beginTransaction(options?: { batch?: boolean }): void {
        this.internal.beginTransaction(options);
    }
    public commitTransaction(clientData?: string): void {
        this.internal.commitTransaction(clientData);
    }
    public cancelTransaction(): void {
        this.internal.cancelTransaction();
    }

    // Metadata
    public get id(): GUID {
        return this.internal.getMetadata().id;
    }
    public set name(val: string) {
        this.internal.setMetadata({ name: val });
    }
    public get name(): string {
        return this.internal.getMetadata().name;
    }
    public set desc(val: string) {
        this.internal.setMetadata({ desc: val });
    }
    public get desc(): string {
        return this.internal.getMetadata().desc;
    }
    public set thumbnail(val: string) {
        this.internal.setMetadata({ thumb: val });
    }
    public get thumbnail(): string {
        return this.internal.getMetadata().thumb;
    }

    // Queries
    public pickObjAt(pt: Vector): T["Obj"] | undefined {
        return this.pickObjAtHelper(pt)
            .map((id) => this.getObj(id)).asUnion();
    }
    public pickComponentAt(pt: Vector): T["Component"] | undefined {
        return this.pickObjAtHelper(pt, (id) => this.internal.hasComp(id))
            .map((id) => this.getComponent(id)).asUnion();
    }
    public pickWireAt(pt: Vector): T["Wire"] | undefined {
        return this.pickObjAtHelper(pt, (id) => this.internal.hasWire(id))
            .map((id) => this.getWire(id)).asUnion();
    }
    public pickPortAt(pt: Vector): T["Port"] | undefined {
        return this.pickObjAtHelper(pt, (id) => this.internal.hasPort(id))
            .map((id) => this.getPort(id)).asUnion();
    }

    public pickObjsWithin(bounds: Rect): T["ObjContainerT"] {
        return this.createContainer(this.pickObjsWithinHelper(bounds));
    }
    public pickComponentsWithin(bounds: Rect): T["Component[]"] {
        return this.pickObjsWithinHelper(bounds, (id) => this.internal.hasComp(id))
            .map((id) => this.getComponent(id))
            .filter((comp) => !!comp);
    }
    public pickPortsWithin(bounds: Rect): T["Port[]"] {
        return this.pickObjsWithinHelper(bounds, (id) => this.internal.hasPort(id))
            .map((id) => this.getPort(id))
            .filter((port) => !!port);
    }

    public getComponent(id: GUID): T["Component"] | undefined {
        if (!this.internal.getCompByID(id).ok)
            return undefined;
        return this.state.constructComponent(id);
    }
    public getWire(id: GUID): T["Wire"] | undefined {
        if (!this.internal.getWireByID(id).ok)
            return undefined;
        return this.state.constructWire(id);
    }
    public getPort(id: GUID): T["Port"] | undefined {
        if (!this.internal.getPortByID(id).ok)
            return undefined;
        return this.state.constructPort(id);
    }
    public getObj(id: GUID): T["Obj"] | undefined {
        if (this.internal.hasComp(id))
            return this.getComponent(id);
        if (this.internal.hasWire(id))
            return this.getWire(id);
        if (this.internal.hasPort(id))
            return this.getPort(id);
        return undefined;
    }
    public getObjs(): T["ObjContainerT"] {
        return new ObjContainerImpl<T>(this.state, new Set(this.internal.getObjs()));
    }
    public getComponents(): T["Component[]"] {
        return [...this.internal.getComps()]
            .map((id) => this.state.constructComponent(id));
    }
    public getWires(): T["Wire[]"] {
        return [...this.internal.getWires()]
            .map((id) => this.state.constructWire(id));
    }
    public getComponentInfo(kind: string): T["ComponentInfo"] | undefined {
        // API-wise, clients specify IC-instance-kinds with as the IC ID,
        // but internally IC-kinds are just "IC", and the icId is stored separately.
        const info = this.state.internal.getICs().has(kind)
                ? this.state.internal.getComponentInfo("IC", kind)
                : this.state.internal.getComponentInfo(kind);
        if (!info.ok)
            return undefined;
        return this.state.constructComponentInfo(kind);
    }

    public createContainer(objs: GUID[]): T["ObjContainerT"] {
        const objSet = new Set(objs);

        // Validate all objects exist in the circuit
        for (const id of objSet) {
            if (!this.internal.hasComp(id) &&
                !this.internal.hasWire(id) &&
                !this.internal.hasPort(id)) {
                throw new Error(`Circuit.createContainer: Invalid object ID ${id}`);
            }
        }

        return new ObjContainerImpl<T>(this.state, objSet);
    }

    // Object manipulation
    public placeComponentAt(kind: string, pt: Vector): T["Component"] {
        this.beginTransaction();

        // Place raw component (TODO[model_refactor_api](leon) - don't use unwrap?)
        const id = (() => {
            const props = { x: pt.x, y: pt.y, zIndex: this.state.assembler.highestZ + 1 };
            // If user is trying to make an IC, need to construct component differently
            if (this.internal.getICs().has(kind))
                return this.internal.placeComponent("IC", props, kind);
            return this.internal.placeComponent(kind, props)
        })().unwrap();

        // Set its config to place ports
        const [_, info] = this.internal.getComponentAndInfoById(id).unwrap();
        this.internal.setPortConfig(id, info.defaultPortConfig).unwrap();

        this.commitTransaction("Placed Component");

        return this.state.constructComponent(id);
    }
    public deleteObjs(objs: Array<T["Component"] | T["Wire"]>): void {
        this.beginTransaction();

        const wireIds = new Set(objs
            .filter((o) => o.baseKind === "Wire")
            .map((w) => w.id));
        const compIds = new Set(objs
            .filter((o) => o.baseKind === "Component")
            .map((c) => c.id));

        // Delete wires first
        for (const wireId of wireIds)
            this.internal.deleteWire(wireId).unwrap();

        // Then remove all ports for each component, then delete them
        for (const compId of compIds)
            this.internal.removePortsFor(compId).unwrap();
        for (const compId of compIds)
            this.internal.deleteComponent(compId).unwrap();

        this.commitTransaction("Deleted Object");
    }


    public importICs(ics: IntegratedCircuit[]): void {
        this.internal.beginTransaction();
        for (const ic of ics) {
            if (this.internal.hasIC(ic.id))
                continue;
            this.internal.createIC(ConvertIC(ic)).unwrap();
        }
        this.internal.commitTransaction();
    }
    public createIC(info: T["ICInfo"], id = uuid()): T["IC"] {
        if (this.internal.hasIC(id))
            throw new Error(`Circuit.createIC: IC with ID ${id} already exists!`);

        const dependentICIDs = new Set(info.circuit.getComponents().filter((c) => c.isIC()).map((c) => c.kind));
        const missingICIDs = dependentICIDs.difference(this.internal.getICs());
        if (missingICIDs.size > 0)
            throw new Error(`Circuit.createIC: Found sub-ICs when trying to create a new IC that haven't been imported yet: [${[...missingICIDs].join(", ")}]. Please import them first!`);

        const metadata: Schema.IntegratedCircuitMetadata = {
            // TODO[model_refactor_api](leon): do we need to allow this? maybe just use the info.circuit.id?
            id:      id,  // Make a new ID
            name:    info.circuit.name,
            thumb:   info.circuit.thumbnail,
            desc:    info.circuit.desc,
            version: "digital/v0",

            displayWidth:  info.display.size.x,
            displayHeight: info.display.size.y,

            pins: info.display.pins.map(({ id, group, name, pos, dir }) =>
                ({ id, group, name, x: pos.x, y: pos.y, dx: dir.x, dy: dir.y })),
        };

        this.internal.beginTransaction();
        this.internal.createIC({
            metadata,
            comps: info.circuit.getObjs().components.map(ConvertComp),
            ports: info.circuit.getObjs().ports.map(ConvertPort),
            wires: info.circuit.getObjs().wires.map(ConvertWire),
        }).unwrap();
        this.internal.commitTransaction();

        return this.state.constructIC(id);
    }
    public deleteIC(id: GUID): void {
        // If there's a component referencing the IC, fail
        if (this.getComponents().some((c) => (c.kind === id)))
            throw new Error(`Circuit.deleteIC: Failed to delete IC(${id})! Found component referencing it!`);

        this.internal.beginTransaction();
        this.internal.deleteIC(id).unwrap();
        this.internal.commitTransaction();
    }
    public getIC(id: GUID): T["IC"] | undefined {
        if (!this.internal.hasIC(id))
            return undefined;
        return this.state.constructIC(id);
    }
    public getICs(): T["IC[]"] {
        return [...this.internal.getICs()]
            .map((id) => this.state.constructIC(id));
    }

    public undo(): void {
        this.internal.undo().unwrap();
    }
    public redo(): void {
        this.internal.redo().unwrap();
    }

    public import(circuit: T["ReadonlyCircuit"] | T["ReadonlyObjContainerT"], opts?: { refreshIds?: boolean, loadMetadata?: boolean }): T["ObjContainerT"] {
        const refreshIds = opts?.refreshIds ?? false,
              loadMetadata = opts?.loadMetadata ?? false;

        const isCircuit = (o: T["ReadonlyCircuit"] | T["ReadonlyObjContainerT"]): o is T["ReadonlyCircuit"] => (o instanceof CircuitImpl);

        this.beginTransaction();

        // TODO[] - make this undoable?
        if (loadMetadata && isCircuit(circuit)) {
            this.internal.setMetadata({
                id:    circuit.id,
                name:  circuit.name,
                desc:  circuit.desc,
                thumb: circuit.thumbnail,
            });
            this.internal.setCamera({ x: circuit.camera.cx, y: circuit.camera.cy, zoom: circuit.camera.zoom });
        }

        (isCircuit(circuit) ? circuit.getICs() : circuit.ics)
            .filter((ic) => !this.internal.hasIC(ic.id))
            .forEach((ic) => this.internal.createIC(ConvertIC(ic)).unwrap());

        const comps = (isCircuit(circuit) ? circuit.getComponents() : circuit.components);
        const wires = (isCircuit(circuit) ? circuit.getWires() : circuit.wires);

        const objs = this.internal.importObjs([
            ...comps.map(ConvertComp),
            ...comps.flatMap((c) => c.allPorts.map(ConvertPort)),
            ...wires.map(ConvertWire),
        ], refreshIds).unwrap();

        this.commitTransaction("Imported Circuit");

        return new ObjContainerImpl(this.state, new Set(objs));
    }
}

class IntegratedCircuitPinImpl<T extends CircuitTypes> implements ICPin {
    protected readonly icId: GUID;
    protected readonly pinIndex: number;

    protected readonly state: CircuitState<T>;

    public constructor(state: CircuitState<T>, icId: GUID, pinIndex: number) {
        this.state = state;
        this.icId = icId;
        this.pinIndex = pinIndex;
    }

    protected get ic() {
        return this.state.internal.getICInfo(this.icId).unwrap();
    }

    public get id(): GUID {
        return this.ic.metadata.pins[this.pinIndex].id;
    }
    public get group(): GUID {
        return this.ic.metadata.pins[this.pinIndex].group;
    }

    public get name(): string {
        return this.ic.metadata.pins[this.pinIndex].name;
    }

    public set pos(p: Vector) {
        this.state.internal.beginTransaction();
        this.state.internal.updateICPinMetadata(this.icId, this.pinIndex, { x: p.x, y: p.y }).unwrap();
        this.state.internal.commitTransaction();
    }
    public get pos(): Vector {
        return V(
            this.ic.metadata.pins[this.pinIndex].x,
            this.ic.metadata.pins[this.pinIndex].y,
        );
    }

    public set dir(d: Vector) {
        this.state.internal.beginTransaction();
        this.state.internal.updateICPinMetadata(this.icId, this.pinIndex, { dx: d.x, dy: d.y }).unwrap();
        this.state.internal.commitTransaction();
    }
    public get dir(): Vector {
        return V(
            this.ic.metadata.pins[this.pinIndex].dx,
            this.ic.metadata.pins[this.pinIndex].dy,
        );
    }
}

class IntegratedCircuitDisplayImpl<T extends CircuitTypes> implements IntegratedCircuitDisplay {
    protected readonly id: GUID;

    protected readonly state: CircuitState<T>;

    public constructor(state: CircuitState<T>, id: GUID) {
        this.state = state;
        this.id = id;
    }

    protected get ic() {
        return this.state.internal.getICInfo(this.id).unwrap();
    }

    public set size(p: Vector) {
        this.state.internal.beginTransaction();
        this.state.internal.updateICMetadata(this.id, { displayWidth: p.x, displayHeight: p.y }).unwrap();
        this.state.internal.commitTransaction();
    }
    public get size(): Vector {
        return V(this.ic.metadata.displayWidth, this.ic.metadata.displayHeight);
    }
    public get pins(): ICPin[] {
        return this.ic.metadata.pins.map((_, i) => new IntegratedCircuitPinImpl(this.state, this.id, i));
    }
}

export class IntegratedCircuitImpl<T extends CircuitTypes> implements IntegratedCircuit {
    public readonly id: GUID;

    protected readonly state: CircuitState<T>;

    public readonly display: IntegratedCircuitDisplay;

    public constructor(state: CircuitState<T>, id: GUID) {
        this.state = state;
        this.id = id;

        this.display = new IntegratedCircuitDisplayImpl(state, id);
    }

    // Metadata
    public set name(name: string) {
        this.state.internal.beginTransaction();
        this.state.internal.updateICMetadata(this.id, { name }).unwrap();
        this.state.internal.commitTransaction();
    }
    public get name(): string {
        return this.state.internal.getICInfo(this.id).unwrap().metadata.name;
    }

    public get desc(): string {
        return this.state.internal.getICInfo(this.id).unwrap().metadata.desc;
    }
    public get thumbnail(): string {
        return this.state.internal.getICInfo(this.id).unwrap().metadata.thumb;
    }

    public get all(): T["ObjContainerT"] {
        return new ObjContainerImpl<T>(
            this.state,
            new Set(this.state.internal.getICInfo(this.id).unwrap().getObjs()),
            this.id
        );
    }

    public get components(): T["ReadonlyComponent[]"] {
        return [...this.state.internal.getICInfo(this.id).unwrap().getComponents()]
            .map((id) => this.state.constructComponent(id, this.id));
    }
    public get wires(): T["ReadonlyWire[]"] {
        return [...this.state.internal.getICInfo(this.id).unwrap().getWires()]
            .map((id) => this.state.constructWire(id, this.id));
    }
}
