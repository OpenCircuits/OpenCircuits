import {Vector} from "Vector";
import {Rect}   from "math/Rect";

import {extend} from "shared/api/circuit/utils/Functions";

import {Selections, SelectionsEvent} from "../Selections";
import {Circuit}                     from "../Circuit";

import {CircuitState, CircuitTypes} from "./CircuitState";
import {ObservableImpl}             from "./Observable";
import {GUID} from "../../internal";

import "shared/api/circuit/utils/Array";


export function SelectionsImpl<T extends CircuitTypes>(
    circuit: Circuit,
    { internal, constructComponent, constructWire }: CircuitState<T>
) {
    const observable = ObservableImpl<SelectionsEvent>();

    let selections = new Set<GUID>();
    internal.subscribe((_) => {
        // Update selections
        const newSelections = new Set(
            [...internal.getAllObjs()]
                .filter((o) => (o.props["isSelected"] === true))
                .map((o) => o.id));

        const diff = selections.symmetricDifference(newSelections);
        selections = newSelections;

        if (diff.size > 0) {
            observable.emit({
                type:   "numSelectionsChanged",
                newAmt: diff.size,
            });
        }
    })

    return extend(observable, {
        get bounds(): Rect {
            return Rect.Bounding(this.all.map((o) => o.bounds));
        },

        get midpoint(): Vector {
            const pts = [
                ...this.components.map((c) => c.pos),
                ...this.wires.map((w) => w.shape.getPos(0.5)),
            ];
            return Rect.FromPoints(
                Vector.Min(...pts),
                Vector.Max(...pts),
            ).center;
        },

        get length(): number {
            return selections.size;
        },
        get isEmpty(): boolean {
            return (this.length === 0);
        },

        get all(): T["Obj[]"] {
            return [...selections].map((id) => circuit.getObj(id)!);
        },
        get components(): T["Component[]"] {
            return [...selections]
                .filter((id) => internal.hasComp(id))
                .map((id) => constructComponent(id));
        },
        get wires(): T["Wire[]"] {
            return [...selections]
                .filter((id) => internal.hasWire(id))
                .map((id) => constructWire(id));
        },

        clear(): void {
            internal.beginTransaction();
            for (const id of selections)
                internal.setPropFor(id, "isSelected", undefined);
            internal.commitTransaction();
        },

        forEach(f: (obj: T["Obj"], i: number, arr: T["Obj[]"]) => void): void {
            return this.all.forEach(f);
        },
        filter(f: (obj: T["Obj"], i: number, arr: T["Obj[]"]) => boolean): T["Obj[]"] {
            return this.all.filter(f);
        },
        every(condition: (obj: T["Obj"], i: number, arr: T["Obj[]"]) => boolean): boolean {
            return this.all.every(condition);
        },

        duplicate(): T["Obj[]"] {
            if (this.isEmpty)
                return [];
            throw new Error("Selections.duplicate: Unimplemented!");
        },
    }) satisfies Selections;
}
