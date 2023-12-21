import {V, Vector} from "Vector";

import {extend} from "core/utils/Functions";

import {Selections, SelectionsEvent} from "../Selections";
import {Circuit}                     from "../Circuit";

import {CircuitState, CircuitTypes} from "./CircuitState";
import {ObservableImpl}             from "./Observable";


export function SelectionsImpl<T extends CircuitTypes>(
    circuit: Circuit,
    { internal, selectionsManager, view, constructComponent, constructWire }: CircuitState<T>
) {
    function selections() {
        return selectionsManager.get();
    }

    const observable = ObservableImpl<SelectionsEvent>();

    selectionsManager.subscribe((_) => {
        observable.emit({
            type:   "numSelectionsChanged",
            newAmt: selectionsManager.length(),
        });
    });

    return extend(observable, {
        get length(): number {
            return selections().length;
        },
        get isEmpty(): boolean {
            return (this.length === 0);
        },

        get all(): T["Obj[]"] {
            return selections().map((id) => circuit.getObj(id)!);
        },
        get components(): T["Component[]"] {
            return selections().filter((id) => (internal.doc.hasComp(id)))
                .map((id) => constructComponent(id));
        },
        get wires(): T["Wire[]"] {
            return selections().filter((id) => (internal.doc.hasComp(id)))
                .map((id) => constructWire(id));
        },

        midpoint(space: Vector.Spaces = "world"): Vector {
            // Case: no components are selected
            if (this.components.length === 0)
                return V(0, 0);

            // Case: One or more components are selected, calculate average
            const avgWorldPos = this.components
                .map((c) => c.pos)
                .reduce((sum, v) => sum.add(v))
                .scale(1 / this.components.length);

            return (space === "screen" ? view.toScreenPos(avgWorldPos) : avgWorldPos);
        },

        clear(): void {
            selectionsManager.clear();
        },

        forEach(f: (obj: T["Obj"], i: number, arr: T["Obj[]"]) => void): void {
            return this.all.forEach(f);
        },
        filter(f: (obj: T["Obj"], i: number, arr: T["Obj[]"]) => void): T["Obj[]"] {
            return this.all.filter(f);
        },
        every(condition: (obj: T["Obj"], i: number, arr: T["Obj[]"]) => boolean): boolean {
            return this.all.every(condition);
        },

        duplicate(): T["Obj[]"] {
            if (this.isEmpty)
                return [];
            throw new Error("Unimplemented!");
        },
    }) satisfies Selections;
}
