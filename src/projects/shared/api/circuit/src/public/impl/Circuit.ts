/* eslint-disable @typescript-eslint/no-parameter-properties */
import {V, Vector} from "Vector";

import {Schema} from "shared/api/circuit/schema";

import {CircuitInternal, GUID, uuid} from "shared/api/circuit/internal";

import {Circuit, CircuitEvent, ICPin, IntegratedCircuit,
        IntegratedCircuitDisplay} from "../Circuit";
import {Selections}                from "../Selections";
import {isObjComponent, isObjWire} from "../Utilities";

import {CircuitState, CircuitTypes} from "./CircuitState";
import {SelectionsImpl}             from "./Selections";
import {ObservableImpl} from "../../utils/Observable";
import {ObjContainer} from "../ObjContainer";
import {ObjContainerImpl} from "./ObjContainer";


export type RemoveICCallback = (id: GUID) => void;

export class CircuitImpl<T extends CircuitTypes> extends ObservableImpl<CircuitEvent> implements Circuit {
    protected readonly state: CircuitState<T>;

    public readonly selections: Selections;

    public constructor(
        state: CircuitState<T>,
    ) {
        super();

        this.state = state;

        this.selections = new SelectionsImpl(state);

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

    public beginTransaction(): void {
        this.state.internal.beginTransaction();
    }
    public commitTransaction(): void {
        this.state.internal.commitTransaction();
    }
    public cancelTransaction(): void {
        this.state.internal.cancelTransaction();
    }

    // Metadata
    public get id(): GUID {
        return this.state.internal.getMetadata().id;
    }
    public set name(val: string) {
        this.state.internal.setMetadata({ name: val });
    }
    public get name(): string {
        return this.state.internal.getMetadata().name;
    }
    public set desc(val: string) {
        this.state.internal.setMetadata({ desc: val });
    }
    public get desc(): string {
        return this.state.internal.getMetadata().desc;
    }
    public set thumbnail(val: string) {
        this.state.internal.setMetadata({ thumb: val });
    }
    public get thumbnail(): string {
        return this.state.internal.getMetadata().thumb;
    }

    // Queries
    public pickObjAt(pt: Vector): T["Obj"] | undefined {
        return this.pickObjAtHelper(pt)
            .map((id) => this.getObj(id)).asUnion();
    }
    public pickComponentAt(pt: Vector): T["Component"] | undefined {
        return this.pickObjAtHelper(pt, (id) => this.state.internal.hasComp(id))
            .map((id) => this.getComponent(id)).asUnion();
    }
    public pickWireAt(pt: Vector): T["Wire"] | undefined {
        return this.pickObjAtHelper(pt, (id) => this.state.internal.hasWire(id))
            .map((id) => this.getWire(id)).asUnion();
    }
    public pickPortAt(pt: Vector): T["Port"] | undefined {
        return this.pickObjAtHelper(pt, (id) => this.state.internal.hasPort(id))
            .map((id) => this.getPort(id)).asUnion();
    }

    public getComponent(id: GUID): T["Component"] | undefined {
        if (!this.state.internal.getCompByID(id).ok)
            return undefined;
        return this.state.constructComponent(id);
    }
    public getWire(id: GUID): T["Wire"] | undefined {
        if (!this.state.internal.getWireByID(id).ok)
            return undefined;
        return this.state.constructWire(id);
    }
    public getPort(id: GUID): T["Port"] | undefined {
        if (!this.state.internal.getPortByID(id).ok)
            return undefined;
        return this.state.constructPort(id);
    }
    public getObj(id: GUID): T["Obj"] | undefined {
        if (this.state.internal.hasComp(id))
            return this.getComponent(id);
        if (this.state.internal.hasWire(id))
            return this.getWire(id);
        if (this.state.internal.hasPort(id))
            return this.getPort(id);
        return undefined;
    }
    public getObjs(): T["Obj[]"] {
        return [...this.state.internal.getObjs()]
            .map((id) => this.getObj(id)!);
    }
    public getComponents(): T["Component[]"] {
        return this.getObjs().filter(isObjComponent);
    }
    public getWires(): T["Wire[]"] {
        return this.getObjs().filter(isObjWire);
    }
    public getComponentInfo(kind: string): T["ComponentInfo"] | undefined {
        const info = this.state.internal.getComponentInfo(kind);
        if (!info.ok)
            return undefined;
        return this.state.constructComponentInfo(kind);
    }

    public createContainer(objs: GUID[]): ObjContainer {
        const objSet = new Set(objs);

        // Validate all objects exist in the circuit
        for (const id of objSet) {
            if (!this.state.internal.hasComp(id) &&
                !this.state.internal.hasWire(id) &&
                !this.state.internal.hasPort(id)) {
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

        // Place raw component (TODO[master](leon) - don't use unwrap...)
        const id = this.state.internal.placeComponent(kind, { x: pt.x, y: pt.y }).unwrap();

        // Set its config to place ports
        this.state.internal.setPortConfig(id, info.defaultPortConfig).unwrap();

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
            this.state.internal.deleteWire(wireId).unwrap();

        // Then remove all ports for each component, then delete them
        for (const compId of compIds)
            this.state.internal.removePortsFor(compId).unwrap();
        for (const compId of compIds)
            this.state.internal.deleteComponent(compId).unwrap();

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
    public createIC(info: T["ICInfo"]): T["IC"] {
        const id = uuid();

        const metadata: Schema.IntegratedCircuitMetadata = {
            id:      id,  // Make a new ID
            name:    info.circuit.name,
            thumb:   info.circuit.thumbnail,
            desc:    info.circuit.desc,
            version: "v/0",

            displayWidth:  info.display.size.x,
            displayHeight: info.display.size.y,

            pins: info.display.pins.map(({ id, group, pos }) => ({ id, group, x: pos.x, y: pos.y })),
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
        this.state.internal.undo().unwrap();
    }
    public redo(): void {
        this.state.internal.redo().unwrap();
    }

    // reset(): void {
    //     throw new Error("Circuit.reset: Unimplemented!");
    // },

    // serialize(objs?: T["Obj[]"]): string {
    //     throw new Error("Circuit.serialize: Unimplemented!");
    // },
    // deserialize(data: string): void {
    //     throw new Error("Circuit.deserialize: Unimplemented!");
    // },
    public loadSchema(schema: Schema.Circuit): void {
        this.beginTransaction();

        schema.ics
            .filter((ic) => !this.internal.hasIC(ic.metadata.id))
            .forEach((ic) =>
                this.internal.createIC(ic));

        this.internal.importObjs(schema.objects);

        this.commitTransaction();
    }
    public toSchema(): Schema.Circuit {
        return {
            metadata: this.state.internal.getMetadata(),
            camera:   {
                x:    0,
                y:    0,
                zoom: 0,
            },
            ics:     this.getICs().map((ic) => ic.toSchema()),
            objects: [
                ...this.getObjs().map((obj) => obj.toSchema()),
            ],
        };
    }
}

class IntegratedCircuitDisplayImpl<T extends CircuitTypes> implements IntegratedCircuitDisplay {
    protected readonly id: GUID;

    protected readonly state: CircuitState<T>;

    public constructor(state: CircuitState<T>, id: GUID) {
        this.state = state;
        this.id = id;
    }

    public get size(): Vector {
        const ic = this.state.internal.getICInfo(this.id).unwrap();
        return V(ic.metadata.displayWidth, ic.metadata.displayHeight);
    }
    public get pins(): readonly ICPin[] {
        const ic = this.state.internal.getICInfo(this.id).unwrap();
        return ic.metadata.pins.map(({ id, group, x, y }) => ({
            id,
            pos: V(x, y),
            group,
        }));
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
