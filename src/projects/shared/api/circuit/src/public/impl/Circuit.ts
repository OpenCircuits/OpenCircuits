/* eslint-disable @typescript-eslint/no-parameter-properties */
import {V, Vector} from "Vector";

import {MapObj} from "shared/api/circuit/utils/Functions";

import {Schema} from "shared/api/circuit/schema";

import {CircuitInternal, GUID, uuid} from "shared/api/circuit/internal";

import {Circuit, CircuitEvent, ICPin, IntegratedCircuit,
        IntegratedCircuitDisplay} from "../Circuit";
import {Selections}                from "../Selections";
import {isObjComponent, isObjWire} from "../Utilities";

import {CircuitState, CircuitTypes} from "./CircuitState";
import {SelectionsImpl}             from "./Selections";
import {PortConfig} from "../../internal/impl/ObjInfo";
import {PortFactory} from "../../internal/assembly/PortAssembler";
import {ObservableImpl} from "../../utils/Observable";
import {CircuitDocument} from "../../internal/impl/CircuitDocument";


export type MakeICFunc = (
    id: GUID,
    objs: Schema.Obj[],
    metadata: Schema.IntegratedCircuit["metadata"],
    portConfig: PortConfig,
    portFactory: PortFactory,
) => void;

export class CircuitImpl<T extends CircuitTypes> extends ObservableImpl<CircuitEvent> implements Circuit {
    protected readonly state: CircuitState<T>;
    protected readonly doc: CircuitDocument;
    private readonly makeIC: MakeICFunc;

    public readonly selections: Selections;

    public constructor(state: CircuitState<T>, doc: CircuitDocument, makeIC: MakeICFunc) {
        super();

        this.state = state;
        this.doc = doc;
        this.makeIC = makeIC;

        this.selections = new SelectionsImpl(state);

        // This ordering is important, because it means that all previous circuit subscription calls will happen
        // before any public/outside subscriptions. (i.e. selections are updated before circuit subscribers are called).
        state.internal.subscribe((ev) => {
            if (ev.type !== "CircuitOp")
                return;
            this.publish({ type: "change", diff: ev.diff });
        });
    }

    private createICHelper(ic: Schema.IntegratedCircuit) {
        const ports = ic.metadata.pins.reduce((prev, pin) => ({
            ...prev,
            [pin.group]: [...(prev[pin.group] ?? []), pin],
        }), {} as Record<string, Array<Schema.IntegratedCircuit["metadata"]["pins"][number]>>);

        const portConfig: PortConfig = MapObj(ports, ([_, pins]) => pins.length);

        const portFactory = MapObj(ports, ([_, ids]) =>
            (index: number, _total: number) => {
                const pos = V(ids[index].x, ids[index].y);
                const size = V(ic.metadata.displayWidth, ic.metadata.displayHeight);
                return {
                    origin: V(pos.x, pos.y),

                    dir: Math.abs(Math.abs(pos.x)-size.x/2) < Math.abs(Math.abs(pos.y)-size.y/2)
                        ? V(1, 0).scale(Math.sign(pos.x))
                        : V(0, 1).scale(Math.sign(pos.y)),
                };
            });

        this.makeIC(ic.metadata.id, ic.objects, ic.metadata, portConfig, portFactory);
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
        return this.state.internal.getMetadata().unwrap().id;
    }
    public set name(val: string) {
        this.state.internal.setMetadata({ name: val }).unwrap();
    }
    public get name(): string {
        return this.state.internal.getMetadata().unwrap().name;
    }
    public set desc(val: string) {
        this.state.internal.setMetadata({ desc: val }).unwrap();
    }
    public get desc(): string {
        return this.state.internal.getMetadata().unwrap().desc;
    }
    public set thumbnail(val: string) {
        this.state.internal.setMetadata({ thumb: val }).unwrap();
    }
    public get thumbnail(): string {
        return this.state.internal.getMetadata().unwrap().thumb;
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

    // Object manipulation
    public placeComponentAt(kind: string, pt: Vector): T["Component"] {
        const info = this.getComponentInfo(kind);

        this.beginTransaction();

        // Place raw component (TODO[master](leon) - don't use unwrap...)
        const id = this.state.internal.placeComponent(kind, { x: pt.x, y: pt.y }).unwrap();

        // Set its config to place ports
        this.state.internal.setPortConfig(id, info!.defaultPortConfig).unwrap();

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
        for (const ic of ics) {
            if (this.doc.getCircuitIds().has(ic.id))
                continue;
            this.createICHelper(ic.toSchema());
        }
    }
    public createIC(info: T["ICInfo"]): T["IC"] {
        const id = uuid();

        const metadata: Schema.IntegratedCircuit["metadata"] = {
            id:      id,  // Make a new ID
            name:    info.circuit.name,
            thumb:   info.circuit.thumbnail,
            desc:    info.circuit.desc,
            version: "v/0",

            displayWidth:  info.display.size.x,
            displayHeight: info.display.size.y,

            pins: info.display.pins.map(({ id, group, pos }) => ({ id, group, x: pos.x, y: pos.y })),
        };

        this.createICHelper({
            metadata,
            objects: info.circuit.getObjs().map((o) => o.toSchema()),
        });

        return this.state.constructIC(id);
    }
    public getICs(): T["IC[]"] {
        return [...this.doc.getCircuitIds()]
            .filter((id) => id !== this.id)
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
        // TODO[leon] - I believe this won't work for ICs in terms of assembling correctly
        schema.ics
            .filter((ic) => !this.doc.getCircuitIds().has(ic.metadata.id))
            .forEach((ic) =>
                this.createICHelper(ic));

        this.doc.addObjs(this.id, schema.objects);
    }
    public toSchema(): Schema.Circuit {
        return {
            metadata: this.state.internal.getMetadata().unwrap(),
            camera:   {
                x:    0,
                y:    0,
                zoom: 0,
            },
            ics: this.getICs().map((ic) => ic.toSchema()),
            objects: [
                ...this.getObjs().map((obj) => obj.toSchema()),
            ],
        };
    }
}

class IntegratedCircuitDisplayImpl implements IntegratedCircuitDisplay {
    protected readonly internal: CircuitInternal;

    public constructor(internal: CircuitInternal) {
        this.internal = internal;
    }

    public get size(): Vector {
        const metadata = this.internal.getMetadata<Schema.IntegratedCircuit["metadata"]>().unwrap();
        return V(metadata.displayWidth, metadata.displayHeight);
    }
    public get pins(): readonly ICPin[] {
        const metadata = this.internal.getMetadata<Schema.IntegratedCircuit["metadata"]>().unwrap();
        return metadata.pins.map(({ id, group, x, y }) => ({
            id,
            pos: V(x, y),
            group,
        }));
    }
}

export class IntegratedCircuitImpl implements IntegratedCircuit {
    protected readonly internal: CircuitInternal;

    public readonly display: IntegratedCircuitDisplay;

    public constructor(internal: CircuitInternal) {
        this.internal = internal;

        this.display = new IntegratedCircuitDisplayImpl(internal);
    }

    // Metadata
    public get id(): GUID {
        return this.internal.getMetadata().unwrap().id;
    }
    public get name(): string {
        return this.internal.getMetadata().unwrap().name;
    }
    public get desc(): string {
        return this.internal.getMetadata().unwrap().desc;
    }
    public get thumbnail(): string {
        return this.internal.getMetadata().unwrap().thumb;
    }

    public toSchema(): Schema.IntegratedCircuit {
        return {
            metadata: this.internal.getMetadata<Schema.IntegratedCircuitMetadata>().unwrap(),
            objects:  [...this.internal.getAllObjs()],
        };
    }
}
