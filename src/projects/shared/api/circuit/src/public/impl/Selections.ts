import {Vector} from "Vector";
import {Rect}   from "math/Rect";

import {GUID} from "../../internal";
import {ObservableImpl} from "../../utils/Observable";
import {SelectionsEvent} from "../Selections";

import {CircuitState, CircuitTypes} from "./CircuitState";

import "shared/api/circuit/utils/Array";


export class SelectionsImpl<T extends CircuitTypes> extends ObservableImpl<SelectionsEvent> {
    protected readonly state: CircuitState<T>;

    protected selections: Set<GUID>;

    public constructor(state: CircuitState<T>) {
        super();

        this.state = state;

        this.selections = new Set<GUID>();
        this.state.internal.subscribe((_) => {
            // Update selections
            const newSelections = new Set(
                [...this.state.internal.getAllObjs()]
                    .filter((o) => (o.props["isSelected"] === true))
                    .map((o) => o.id));

            const diff = this.selections.symmetricDifference(newSelections);
            this.selections = newSelections;

            if (diff.size > 0) {
                this.publish({
                    type:   "numSelectionsChanged",
                    newAmt: diff.size,
                });
            }
        })
    }

    public get bounds(): Rect {
        return Rect.Bounding(this.all.map((o) => o.bounds));
    }

    public get midpoint(): Vector {
        const pts = [
            ...this.components.map((c) => c.pos),
            ...this.wires.map((w) => w.shape.getPos(0.5)),
        ];
        return Rect.FromPoints(
            Vector.Min(...pts),
            Vector.Max(...pts),
        ).center;
    }

    public get length(): number {
        return this.selections.size;
    }
    public get isEmpty(): boolean {
        return (this.length === 0);
    }

    public get all(): T["Obj[]"] {
        return [...this.components, ...this.wires, ...this.ports];
    }
    public get components(): T["Component[]"] {
        return [...this.selections]
            .filter((id) => this.state.internal.hasComp(id))
            .map((id) => this.state.constructComponent(id));
    }
    public get wires(): T["Wire[]"] {
        return [...this.selections]
            .filter((id) => this.state.internal.hasWire(id))
            .map((id) => this.state.constructWire(id));
    }
    public get ports(): T["Port[]"] {
        return [...this.selections]
            .filter((id) => this.state.internal.hasPort(id))
            .map((id) => this.state.constructPort(id));
    }

    public clear(): void {
        this.state.internal.beginTransaction();
        for (const id of this.selections)
            this.state.internal.setPropFor(id, "isSelected", undefined);
        this.state.internal.commitTransaction();
    }

    public forEach(f: (obj: T["Obj"], i: number, arr: T["Obj[]"]) => void): void {
        return this.all.forEach(f);
    }
    public filter(f: (obj: T["Obj"], i: number, arr: T["Obj[]"]) => boolean): T["Obj[]"] {
        return this.all.filter(f);
    }
    public every(condition: (obj: T["Obj"], i: number, arr: T["Obj[]"]) => boolean): boolean {
        return this.all.every(condition);
    }

    public duplicate(): T["Obj[]"] {
        if (this.isEmpty)
            return [];
        throw new Error("Selections.duplicate: Unimplemented!");
    }
}
