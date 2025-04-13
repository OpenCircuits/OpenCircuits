import {Vector} from "Vector";
import {Rect}   from "math/Rect";

import {ObservableImpl} from "../../utils/Observable";
import {Selections, SelectionsEvent} from "../Selections";

import {CircuitState, CircuitTypes} from "./CircuitState";
import {ObjContainerImpl} from "./ObjContainer";

import "shared/api/circuit/utils/Array";
import {ObjContainer} from "../ObjContainer";


export class SelectionsImpl<T extends CircuitTypes> extends ObservableImpl<SelectionsEvent> implements Selections {
    protected readonly state: CircuitState<T>;

    protected selections: ObjContainerImpl<T>;

    public constructor(state: CircuitState<T>) {
        super();

        this.state = state;

        this.selections = new ObjContainerImpl<T>(this.state, new Set());
        this.state.internal.subscribe((_) => {
            // Update selections
            const newSelections = new Set(
                [...this.state.internal.getAllObjs()]
                    .filter((o) => (o.props["isSelected"] === true))
                    .map((o) => o.id));

            const diff = this.selections["objs"].symmetricDifference(newSelections);
            this.selections = new ObjContainerImpl<T>(this.state, newSelections);

            if (diff.size > 0) {
                this.publish({
                    type:   "numSelectionsChanged",
                    newAmt: diff.size,
                });
            }
        })
    }

    public get bounds(): Rect {
        return this.selections.bounds;
    }

    public get midpoint(): Vector {
        return this.selections.midpoint;
    }

    public get length(): number {
        return this.selections.length;
    }
    public get isEmpty(): boolean {
        return this.selections.isEmpty;
    }

    public get all(): T["Obj[]"] {
        return this.selections.all;
    }
    public get components(): T["Component[]"] {
        return this.selections.components;
    }
    public get wires(): T["Wire[]"] {
        return this.selections.wires;
    }
    public get ports(): T["Port[]"] {
        return this.selections.ports;
    }
    public get ics(): T["IC[]"] {
        return this.selections.ics;
    }

    public withWiresAndPorts(): ObjContainer {
        return this.selections.withWiresAndPorts();
    }

    public clear(): void {
        this.state.internal.beginTransaction();
        for (const id of this.selections["objs"])
            this.state.internal.setPropFor(id, "isSelected", undefined);
        this.state.internal.commitTransaction();
    }

    public forEach(f: (obj: T["Obj"], i: number, arr: T["Obj[]"]) => void): void {
        return this.selections.forEach(f);
    }
    public filter(f: (obj: T["Obj"], i: number, arr: T["Obj[]"]) => boolean): T["Obj[]"] {
        return this.selections.filter(f);
    }
    public every(condition: (obj: T["Obj"], i: number, arr: T["Obj[]"]) => boolean): boolean {
        return this.selections.every(condition);
    }
}
