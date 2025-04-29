/* eslint-disable @typescript-eslint/no-parameter-properties */
import {V, Vector} from "Vector";

import {Schema} from "shared/api/circuit/schema";

import {CircuitInternal, GUID, uuid} from "shared/api/circuit/internal";

import {Circuit, CircuitEvent, CircuitHistory, CircuitHistoryEvent, ICPin, IntegratedCircuit,
        IntegratedCircuitDisplay} from "../Circuit";
import {Selections}                from "../Selections";

import {CircuitState, CircuitTypes} from "./CircuitState";
import {SelectionsImpl}             from "./Selections";
import {ObservableImpl} from "../../utils/Observable";
import {ObjContainer} from "../ObjContainer";
import {ObjContainerImpl} from "./ObjContainer";
import {LogEntry} from "../../internal/impl/CircuitLog";


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

    public readonly selections: SelectionsImpl<T>;
    public readonly history: CircuitHistory;

    public constructor(state: CircuitState<T>) {
        super();

        this.state = state;

        this.selections = new SelectionsImpl<T>(state);
        this.history = new HistoryImpl(state.internal);

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

    public beginTransaction(options?: { batch?: boolean }): void {
        this.internal.beginTransaction(options);
    }
    public commitTransaction(): void {
        this.internal.commitTransaction();
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
    public getObjs(): T["Obj[]"] {
        return [...this.internal.getObjs()]
            .map((id) => this.getObj(id)!);
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
        const info = this.internal.getComponentInfo(kind);
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
        const info = this.getComponentInfo(kind);
        if (!info)
            throw new Error(`Circuit.placeComponentAt: Unknown component kind '${kind}'`);

        this.beginTransaction();

        // Place raw component (TODO[model_refactor_api](leon) - don't use unwrap?)
        const id = this.internal.placeComponent(
            kind,
            { x: pt.x, y: pt.y, zIndex: this.state.assembler.highestZ + 1 },
        ).unwrap();

        // Set its config to place ports
        this.internal.setPortConfig(id, info.defaultPortConfig).unwrap();

        this.commitTransaction();

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

        this.commitTransaction();
    }


    public importICs(ics: IntegratedCircuit[]): void {
        this.internal.beginTransaction();
        for (const ic of ics) {
            if (this.internal.hasIC(ic.id))
                continue;
            this.internal.createIC(ic.toSchema()).unwrap();
        }
        this.internal.commitTransaction();
    }
    public createIC(info: T["ICInfo"], id = uuid()): T["IC"] {
        const metadata: Schema.IntegratedCircuitMetadata = {
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
            objects: info.circuit.getObjs().map((o) => o.toSchema()),
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

    public loadSchema(schema: Schema.Circuit, opts?: { refreshIds?: boolean, loadMetadata?: boolean }): T["Obj[]"] {
        const refreshIds = opts?.refreshIds ?? false,
              loadMetadata = opts?.loadMetadata ?? false;

        this.beginTransaction();

        // TODO[] - make this undoable?
        if (loadMetadata)
            this.internal.setMetadata(schema.metadata);

        schema.ics
            .filter((ic) => !this.internal.hasIC(ic.metadata.id))
            .forEach((ic) =>
                this.internal.createIC(ic).unwrap());

        const objs = this.internal.importObjs(schema.objects, refreshIds).unwrap();

        this.commitTransaction();

        return objs.map((id) => this.getObj(id)!);
    }
    public toSchema(container?: T["ObjContainerT"]): Schema.Circuit {
        const ics = container?.ics ?? this.getICs();
        const objs = container?.all ?? this.getObjs();

        return {
            metadata: this.internal.getMetadata(),
            camera:   {
                x:    0,
                y:    0,
                zoom: 0,
            },
            ics:     ics.map((ic) => ic.toSchema()),
            objects: [
                ...objs.map((obj) => obj.toSchema()),
            ],
        };
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
        this.state.internal.setPropForIC(this.icId, `pins.${this.pinIndex}.x`, p.x).unwrap();
        this.state.internal.setPropForIC(this.icId, `pins.${this.pinIndex}.y`, p.y).unwrap();
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
        this.state.internal.setPropForIC(this.icId, `pins.${this.pinIndex}.dx`, d.x).unwrap();
        this.state.internal.setPropForIC(this.icId, `pins.${this.pinIndex}.dy`, d.y).unwrap();
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
        this.state.internal.setPropForIC(this.id, "displayWidth", p.x).unwrap();
        this.state.internal.setPropForIC(this.id, "displayHeight", p.y).unwrap();
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
        this.state.internal.setPropForIC(this.id, "name", name).unwrap();
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

    public toSchema(): Schema.IntegratedCircuit {
        const ic = this.state.internal.getICInfo(this.id).unwrap();
        return {
            metadata: ic.metadata,
            objects:  [...ic.getAllObjs()],
        };
    }
}
