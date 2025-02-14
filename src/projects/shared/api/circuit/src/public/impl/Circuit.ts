import {V, Vector} from "Vector";
import {Rect}      from "math/Rect";

import {extend} from "shared/api/circuit/utils/Functions";

import {GUID} from "shared/api/circuit/internal";

import {Circuit, CircuitEvent, IntegratedCircuit,
        IntegratedCircuitDisplay, RootCircuit} from "../Circuit";
import {Selections}                from "../Selections";
import {isObjComponent, isObjWire} from "../Utilities";

import {CircuitState, CircuitTypes} from "./CircuitState";
import {SelectionsImpl}             from "./Selections";
import {ObservableImpl}             from "./Observable";


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
            return state.internal.getMetadata().id;
        },
        set name(val: string) {
            state.internal.setMetadata({ name: val });
        },
        get name(): string {
            return state.internal.getMetadata().name;
        },
        set desc(val: string) {
            state.internal.setMetadata({ desc: val });
        },
        get desc(): string {
            return state.internal.getMetadata().desc;
        },
        set thumbnail(val: string) {
            state.internal.setMetadata({ thumb: val });
        },
        get thumbnail(): string {
            return state.internal.getMetadata().thumb;
        },

        // Other data
        set locked(val: boolean) {
            throw new Error("Unimplemented!");
        },
        get locked(): boolean {
             // TODO: Decide which level to enforce this at.  Is it serialized?
            throw new Error("Unimplemented!");
        },
        set simEnabled(val: boolean) {
            throw new Error("Unimplemented!");
        },
        get simEnabled(): boolean {
            throw new Error("Unimplemented!");
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
            return pickObjAtHelper(pt, (id) => state.internal.doc.hasComp(id))
                .map((id) => this.getComponent(id)).asUnion();
        },
        pickWireAt(pt: Vector): T["Wire"] | undefined {
            return pickObjAtHelper(pt, (id) => state.internal.doc.hasWire(id))
                .map((id) => this.getWire(id)).asUnion();
        },
        pickPortAt(pt: Vector): T["Port"] | undefined {
            return pickObjAtHelper(pt, (id) => state.internal.doc.hasPort(id))
                .map((id) => this.getPort(id)).asUnion();
        },
        pickObjRange(bounds: Rect): T["Obj[]"] {
            throw new Error("Unimplemented!");
        },

        getComponent(id: GUID): T["Component"] | undefined {
            if (!state.internal.doc.getCompByID(id))
                return undefined;
            return state.constructComponent(id);
        },
        getWire(id: GUID): T["Wire"] | undefined {
            if (!state.internal.doc.getWireByID(id))
                return undefined;
            return state.constructWire(id);
        },
        getPort(id: GUID): T["Port"] | undefined {
            if (!state.internal.doc.getPortByID(id))
                return undefined;
            return state.constructPort(id);
        },
        getObj(id: GUID): T["Obj"] | undefined {
            if (state.internal.doc.hasComp(id))
                return this.getComponent(id);
            if (state.internal.doc.hasWire(id))
                return this.getWire(id);
            if (state.internal.doc.hasPort(id))
                return this.getPort(id);
            return undefined;
        },
        getObjs(): T["Obj[]"] {
            return [...state.internal.doc.getObjs()]
                .map((id) => this.getObj(id)!);
        },
        getComponents(): T["Component[]"] {
            return this.getObjs().filter(isObjComponent);
        },
        getWires(): T["Wire[]"] {
            return this.getObjs().filter(isObjWire);
        },
        getComponentInfo(kind: string): T["ComponentInfo"] | undefined {
            // TODO[.](kevin) - getComponentInfo should probably return a Result right?
            //                  Or should we add a method to check if a component exists?
            return state.internal.doc.getComponentInfo(kind);
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
        deleteObjs(objs: T["Obj[]"]): void {
            throw new Error("Unimplemented!");
        },

        undo(): boolean {
            throw new Error("Unimplemented!");
        },
        redo(): boolean {
            throw new Error("Unimplemented!");
        },

        copy(): CircuitT {
            throw new Error("Unimplemented!");
        },

        reset(): void {
            throw new Error("Unimplemented!");
        },

        serialize(objs?: T["Obj[]"]): string {
            throw new Error("Unimplemented!");
        },
        deserialize(data: string): void {
            throw new Error("Unimplemented!");
        },
    }) satisfies Circuit;

    return circuit;
}


export function RootCircuitImpl<
    ICircuitT extends IntegratedCircuit,
    CircuitT extends Circuit,
    T extends CircuitTypes
>(state: CircuitState<T>) {
    const circuit = CircuitImpl<CircuitT, T>(state);

    return extend(circuit, {
        createIC(): ICircuitT {
            throw new Error("Unimplemented!");
        },
        getICs(): ICircuitT[] {
            throw new Error("Unimplemented!");
        },
    }) satisfies RootCircuit;
}


export function IntegratedCircuitImpl<CircuitT extends Circuit, T extends CircuitTypes>(state: CircuitState<T>) {
    const circuit = CircuitImpl<CircuitT, T>(state);

    const display = {
        set size(s: Vector) {
            state.internal.setICMetadata(circuit.id, { displayWidth: s.x, displayHeight: s.y });
        },
        get size(): Vector {
            const size = state.internal.getICMetadata(circuit.id);
            return V(size.displayWidth, size.displayHeight);
        },

        setPinPos(pin: GUID, pos: Vector): void {
            circuit.beginTransaction();
            const p = circuit.getComponent(pin);
            p?.setProp("pinPosX", pos.x);
            p?.setProp("pinPosY", pos.x);
            circuit.commitTransaction();
        },
    } satisfies IntegratedCircuitDisplay;

    return extend(circuit, {
        get display(): IntegratedCircuitDisplay {
            return display;
        },
    }) satisfies IntegratedCircuit;
}
