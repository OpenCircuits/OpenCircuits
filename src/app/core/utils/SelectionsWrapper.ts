import {Component, Port, Wire} from "core/models";
import {V, Vector} from "Vector";
import {Selectable} from "./Selectable";

export class SelectionsWrapper {
    private selections: Set<Selectable>;
    private disabled: boolean;

    private listeners: (() => void)[];


    public constructor() {
        this.selections = new Set();
        this.disabled = false;
        this.listeners = [];
    }
    public addChangeListener(listener: () => void): void {
        this.listeners.push(listener);
    }

    public setDisabled(disabled = true): void {
        this.disabled = disabled;
    }

    public select(s: Selectable): boolean {
        if (this.isDisabled() || this.selections.has(s))
            return false;
        this.selections.add(s);

        // Callback change listeners
        this.listeners.forEach(l => l());

        return true;
    }

    public deselect(s: Selectable): boolean {
        if (this.isDisabled() || !this.selections.delete(s))
            return false;

        // Callback change listeners
        this.listeners.forEach(l => l());

        return true;
    }

    public all(f: (s: Selectable) => boolean): boolean {
        return this.get().every(s => f(s));
    }

    public has(...s: Selectable[]): boolean {
        return s.every(s => this.selections.has(s));
    }

    public amount(): number {
        return this.selections.size;
    }

    public midpoint(all: boolean = false): Vector {
        // Filter out selections that we can get the position of
        const selections =
            Array.from(this.selections)
                 .filter(s => (all ? (s instanceof Component || s instanceof Wire || s instanceof Port)
                                   : (s instanceof Component))) as (Component | Wire | Port)[];

        // Get positions from Selectables
        const positions = selections
            .map(s => (s instanceof Component ? s.getPos() :
                       s instanceof Wire      ? s.getShape().getPos(0.5) :
                                                s.getWorldTargetPos()));

        // Calculate midpoint
        return positions
            .reduce((sum, cur) => sum.add(cur), V())
            .scale(1.0 / positions.length);
    }

    public get(): Selectable[] {
        return Array.from(this.selections);
    }

    public isDisabled(): boolean {
        return this.disabled;
    }

}
