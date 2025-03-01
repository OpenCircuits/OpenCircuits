import {Rect} from "math/Rect";

import {extend} from "shared/api/circuit/utils/Functions";

import {Selections, SelectionsEvent} from "../Selections";
import {Circuit}                     from "../Circuit";

import {CircuitState, CircuitTypes} from "./CircuitState";
import {ObservableImpl}             from "./Observable";


export function SelectionsImpl<T extends CircuitTypes>(
    circuit: Circuit,
    { internal, constructComponent, constructWire }: CircuitState<T>
) {
    const observable = ObservableImpl<SelectionsEvent>();

    function getSelectedObjs() {
        // TODO: Make this more efficient, cache them in SelectionsImpl?
        return [...internal.getAllObjs()]
            .filter((o) => (o.props["isSelected"] === true));
    }

    internal.subscribe((ev) => {
        const diff = ev.diff;

        const numSelectionsChanged = [...diff.propsChanged.entries()]
            .reduce((total, [_, props]) => total + (props.has("isSelected") ? 1 : 0), 0);

        if (numSelectionsChanged > 0) {
            observable.emit({
                type:   "numSelectionsChanged",
                newAmt: numSelectionsChanged,
            });
        }
    })

    return extend(observable, {
        get bounds(): Rect {
            return Rect.Bounding(this.all.map((o) => o.bounds));
        },

        get length(): number {
            return getSelectedObjs().length;
        },
        get isEmpty(): boolean {
            return (this.length === 0);
        },

        get all(): T["Obj[]"] {
            return getSelectedObjs().map((o) => circuit.getObj(o.id)!);
        },
        get components(): T["Component[]"] {
            return getSelectedObjs()
                .filter((o) => (internal.hasComp(o.id)))
                .map((o) => constructComponent(o.id));
        },
        get wires(): T["Wire[]"] {
            return getSelectedObjs()
                .filter((o) => (internal.hasWire(o.id)))
                .map((o) => constructWire(o.id));
        },

        clear(): void {
            internal.beginTransaction();
            for (const obj of getSelectedObjs())
                internal.setPropFor(obj.id, "isSelected", undefined);
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
