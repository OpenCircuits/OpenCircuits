import {V, Vector} from "Vector";

import {extend, MapObj} from "shared/api/circuit/utils/Functions";

import {Schema} from "shared/api/circuit/schema";

import {GUID, uuid} from "shared/api/circuit/internal";

import {Circuit, CircuitEvent, ICInfo, ICPin, IntegratedCircuit,
        IntegratedCircuitDisplay, RootCircuit} from "../Circuit";
import {Selections}                from "../Selections";
import {isObjComponent, isObjWire} from "../Utilities";

import {CircuitState, CircuitTypes} from "./CircuitState";
import {SelectionsImpl}             from "./Selections";
import {ObservableImpl}             from "./Observable";
import {ComponentInfo} from "../ComponentInfo";
import {PortConfig} from "../../internal/impl/ComponentInfo";
import {PortFactory} from "../../internal/assembly/PortAssembler";


function CircuitImpl<CircuitT extends Circuit, T extends CircuitTypes>(state: CircuitState<T>) {
    function pickObjAtHelper(pt: Vector, filter?: (id: string) => boolean) {
        return state.assembler.findNearestObj(pt, filter);
    }

    let selections: Selections;

    const observable = ObservableImpl<CircuitEvent>();

    state.internal.subscribe((ev) => {
        if (ev.type !== "CircuitOp")
            return;
        observable.emit({ type: "change", diff: ev.diff });
    });

    const circuit = extend(observable, {
        beginTransaction(): void {
            state.internal.beginTransaction();
        },
        commitTransaction(): void {
            state.internal.commitTransaction();
        },
        cancelTransaction(): void {
            state.internal.cancelTransaction();
        },

        // Metadata
        get id(): GUID {
            return state.internal.getMetadata().unwrap().id;
        },
        set name(val: string) {
            state.internal.setMetadata({ name: val }).unwrap();
        },
        get name(): string {
            return state.internal.getMetadata().unwrap().name;
        },
        set desc(val: string) {
            state.internal.setMetadata({ desc: val }).unwrap();
        },
        get desc(): string {
            return state.internal.getMetadata().unwrap().desc;
        },
        set thumbnail(val: string) {
            state.internal.setMetadata({ thumb: val }).unwrap();
        },
        get thumbnail(): string {
            return state.internal.getMetadata().unwrap().thumb;
        },

        get selections(): Selections {
            if (!selections)
                selections = SelectionsImpl(circuit, state);
            return selections;
        },

        // Queries
        pickObjAt(pt: Vector): T["Obj"] | undefined {
            return pickObjAtHelper(pt)
                .map((id) => this.getObj(id)).asUnion();
        },
        pickComponentAt(pt: Vector): T["Component"] | undefined {
            return pickObjAtHelper(pt, (id) => state.internal.hasComp(id))
                .map((id) => this.getComponent(id)).asUnion();
        },
        pickWireAt(pt: Vector): T["Wire"] | undefined {
            return pickObjAtHelper(pt, (id) => state.internal.hasWire(id))
                .map((id) => this.getWire(id)).asUnion();
        },
        pickPortAt(pt: Vector): T["Port"] | undefined {
            return pickObjAtHelper(pt, (id) => state.internal.hasPort(id))
                .map((id) => this.getPort(id)).asUnion();
        },

        getComponent(id: GUID): T["Component"] | undefined {
            if (!state.internal.getCompByID(id).ok)
                return undefined;
            return state.constructComponent(id);
        },
        getWire(id: GUID): T["Wire"] | undefined {
            if (!state.internal.getWireByID(id).ok)
                return undefined;
            return state.constructWire(id);
        },
        getPort(id: GUID): T["Port"] | undefined {
            if (!state.internal.getPortByID(id).ok)
                return undefined;
            return state.constructPort(id);
        },
        getObj(id: GUID): T["Obj"] | undefined {
            if (state.internal.hasComp(id))
                return this.getComponent(id);
            if (state.internal.hasWire(id))
                return this.getWire(id);
            if (state.internal.hasPort(id))
                return this.getPort(id);
            return undefined;
        },
        getObjs(): T["Obj[]"] {
            return [...state.internal.getObjs()]
                .map((id) => this.getObj(id)!);
        },
        getComponents(): T["Component[]"] {
            return this.getObjs().filter(isObjComponent);
        },
        getWires(): T["Wire[]"] {
            return this.getObjs().filter(isObjWire);
        },
        getComponentInfo(kind: string): T["ComponentInfo"] | undefined {
            const info = state.internal.getComponentInfo(kind);
            if (!info.ok)
                return undefined;
            return info.unwrap();
        },

        // Object manipulation
        placeComponentAt(kind: string, pt: Vector): T["Component"] {
            const info = this.getComponentInfo(kind);

            this.beginTransaction();

            // Place raw component (TODO[master](leon) - don't use unwrap...)
            const id = state.internal.placeComponent(kind, { x: pt.x, y: pt.y }).unwrap();

            // Set its config to place ports
            state.internal.setPortConfig(id, info!.defaultPortConfig).unwrap();

            this.commitTransaction();

            return state.constructComponent(id);
        },
        deleteObjs(objs: Array<T["Component"] | T["Wire"]>): void {
            this.beginTransaction();

            const wireIds = new Set(objs
                .filter((o) => o.baseKind === "Wire")
                .map((w) => w.id));
            const compIds = new Set(objs
                .filter((o) => o.baseKind === "Component")
                .map((c) => c.id));

            // Delete wires first
            for (const wireId of wireIds)
                state.internal.deleteWire(wireId).unwrap();

            // Then remove all ports for each component, then delete them
            for (const compId of compIds)
                state.internal.removePortsFor(compId).unwrap();
            for (const compId of compIds)
                state.internal.deleteComponent(compId).unwrap();

            this.commitTransaction();
        },

        undo(): void {
            state.internal.undo().unwrap();
        },
        redo(): void {
            state.internal.redo().unwrap();
        },

        // reset(): void {
        //     throw new Error("Circuit.reset: Unimplemented!");
        // },

        // serialize(objs?: T["Obj[]"]): string {
        //     throw new Error("Circuit.serialize: Unimplemented!");
        // },
        // deserialize(data: string): void {
        //     throw new Error("Circuit.deserialize: Unimplemented!");
        // },
    }) satisfies Circuit;

    return circuit;
}


export function RootCircuitImpl<
    CircuitT extends Circuit,
    T extends CircuitTypes
>(
    state: CircuitState<T>,
    makeIC: (
        id: GUID,
        objs: Schema.Obj[],
        metadata: Schema.IntegratedCircuit["metadata"],
        portConfig: PortConfig,
        portFactory: PortFactory,
    ) => T["IC"],
) {
    const circuit = CircuitImpl<CircuitT, T>(state);

    return extend(circuit, {
        createIC(info: T["ICInfo"]): T["IC"] {
            const id = uuid();

            const ports = info.display.pins.reduce((prev, pin) => ({
                ...prev,
                [pin.group]: [...(prev[pin.group] ?? []), pin],
            }), {} as Record<string, ICPin[]>);

            const portConfig: PortConfig = MapObj(ports, ([_, pins]) => pins.length);

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

            const portFactory = MapObj(ports, ([_, ids]) =>
                (index: number, _total: number) => {
                    const pos = ids[index].pos;
                    const size = info.display.size;
                    return {
                        origin: V(pos.x, pos.y),

                        dir: Math.abs(Math.abs(pos.x)-size.x/2) < Math.abs(Math.abs(pos.y)-size.y/2)
                            ? V(1, 0).scale(Math.sign(pos.x))
                            : V(0, 1).scale(Math.sign(pos.y)),
                    };
                });

            return makeIC(id, info.circuit.getObjs().map((o) => o.toSchema()), metadata, portConfig, portFactory);
            // state.internal.createIC(
            //     metadata,
            //     getComponentICInfo(info),
            //     // new DigitalComponentInfo(kind, {}, { "inputs": "input", "outputs": "output" }, [portConfig]),
            //     info.circuit.getObjs().map((o) => o.toSchema()),
            // );
    
            // // TODO[leon] ----- THIS WILL ONLY LET ICS BE PUT IN MAIN CIRCUIT!!!! TODO TODO TODO
            // mainState.assembler.addAssembler(kind, (params) =>
            //     new ICComponentAssembler(params, info.display.size, factory));
    
            // return makeIC(id);
        },
        getICs(): T["IC[]"] {
            throw new Error("RootCircuit.getICs: Unimplemented!");
        },
    }) satisfies RootCircuit;
}


export function IntegratedCircuitImpl<CircuitT extends Circuit, T extends CircuitTypes>(
    id: GUID,
    state: CircuitState<T>,
) {
    const circuit = CircuitImpl<CircuitT, T>(state);

    const display = {
        get size(): Vector {
            const metadata = state.internal.getMetadata<Schema.IntegratedCircuit["metadata"]>().unwrap();
            return V(metadata.displayWidth, metadata.displayHeight);
        },
        get pins(): readonly ICPin[] {
            const metadata = state.internal.getMetadata<Schema.IntegratedCircuit["metadata"]>().unwrap();
            return metadata.pins.map(({ id, group, x, y }) => ({
                id,
                pos: V(x, y),
                group,
            }));
        },
    } satisfies IntegratedCircuitDisplay;

    return extend(circuit, {
        get display(): IntegratedCircuitDisplay {
            return display;
        },
    }) satisfies IntegratedCircuit;
}
