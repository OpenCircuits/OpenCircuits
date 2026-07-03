import {Vector} from "Vector";
import {Rect}   from "math/Rect";

import {ObservableImpl} from "../../utils/Observable";
import {Selections, SelectionsEvent} from "../Selections";

import {CircuitContext} from "./CircuitContext";
import {CircuitAPITypes} from "./Types";

import "shared/api/circuit/utils/Array";


export class SelectionsImpl<T extends CircuitAPITypes> extends ObservableImpl<SelectionsEvent> implements Selections {
    protected readonly ctx: CircuitContext<T>;

    protected selections: T["ObjContainerT"];

    public constructor(ctx: CircuitContext<T>) {
        super();

        this.ctx = ctx;

        this.selections = this.ctx.factory.constructObjContainer(new Set());
        this.ctx.internal.subscribe((_) => {
            // Update selections
            const newSelections = new Set(
                [...this.ctx.internal.getAllObjs()]
                    .filter((o) => (o.props["isSelected"] === true))
                    .map((o) => o.id));

            const diff = this.selections.ids.symmetricDifference(newSelections);
            this.selections = this.ctx.factory.constructObjContainer(newSelections);

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

    public get ids(): ReadonlySet<string> {
        return this.selections.ids;
    }

    public withWiresAndPorts(): T["ObjContainerT"] {
        return this.selections.withWiresAndPorts();
    }

    public shift(): void {
        return this.selections.shift();
    }

    public clear(): void {
        this.ctx.internal.beginTransaction();
        for (const obj of this.selections.all)
            this.ctx.internal.setPropFor(obj.id, "isSelected", undefined);
        this.ctx.internal.commitTransaction("Cleared Selections");
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
