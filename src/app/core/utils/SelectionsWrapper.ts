import {Component, Port, Wire} from "core/models";
import {V, Vector} from "Vector";
import {Selectable} from "./Selectable";

/**
 * Wrapper class to hold and manage a set of Selectables 
 * Can notfiy to other parts of the code about changes in 
 * the # of selections through its array of listeners functions
 */
export class SelectionsWrapper {
    private selections: Set<Selectable>;
    private disabled: boolean;

    private listeners: (() => void)[];

    /**
     * Intializes a SelectionsWrapper with no elements in `this.seclections` or `this.listeners` and `this.disabled` set to false
     */
    public constructor() {
        this.selections = new Set();
        this.disabled = false;
        this.listeners = [];
    }

    /**
     * Adds `listener` to `this.listeners`
     * @param listener function to call when an element gets added or removed from `this.selections`
    */
    public addChangeListener(listener: () => void): void {
        this.listeners.push(listener);
    }

    /**
     * Sets `this.disabled` equal to `disabled`
     * @param disabled boolean value to set `this.disabled` to (defaults to true)
     */
    public setDisabled(disabled = true): void {
        this.disabled = disabled;
    }

    /**
     * If `s` is not in `this.selections`, adds `s` to `this.selections` then calls every function in `this.listeners`
     * @param s Selectable to add to `this.selections`
     * @returns true if `this.disabled` is false and `s` is not in `this.selections`, and false otheriwse
     */
    public select(s: Selectable): boolean {
        if (this.isDisabled() || this.selections.has(s))
            return false;
        this.selections.add(s);

        // Callback change listeners
        this.listeners.forEach(l => l());

        return true;
    }

    /**
     * If `s` is in `this.selections`, removes `s` from `this.selections` then calls every function in `this.listeners`
     * @param s Selectable to remove from `this.selections`
     * @returns true if `this.disabled` is false and `s` is in `this.selections`, and false otheriwse
     */
    public deselect(s: Selectable): boolean {
        if (this.isDisabled() || !this.selections.delete(s))
            return false;

        // Callback change listeners
        this.listeners.forEach(l => l());

        return true;
    }

    /**
     * Returns whether or not `f` returns true for every element of `this.selections`
     * @param f a function that takes a Selectable `s` and returns a boolean 
     * @returns returns true if `f` returns true for every element in `this.selections` and false otherwise
     */
    public all(f: (s: Selectable) => boolean): boolean {
        return this.get().every(s => f(s));
    }

    /**
     * Checks to see if the elements of `s` are also in `this.selections`
     * @param s an array of type Selectable
     * @returns true if every Selectable in s is also in `this.selections` and false otherwise
     */
    public has(...s: Selectable[]): boolean {
        return s.every(s => this.selections.has(s));
    }

    
    /**
     * Returns the number of elements in `this.selections`
     * @returns `this.selections.size`
     */
    public amount(): number {
        return this.selections.size;
    }

    /**
     * Returns a vector that represents the midpoint of the elements in `this.selections`, will returns 
     * zero vector if there no elements 
     * @param all if `all` is set to false elements of type Wire and Port will
     * be excluded from the midpoint calculation and only elements of type Component will
     * be used to calculate the midpoint (defaults to false)
     * @returns a Vector containing the midpoint of the elements in `this.selections`
     */
    public midpoint(all: boolean = false): Vector {
        if (this.amount() === 0)
            return V();

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

    /**
     * Returns an array containing the elements of `this.selections`
     * @returns an array of type Selectable that contains the elements of `this.selections`
     */
    public get(): Selectable[] {
        return Array.from(this.selections);
    }

    /**
     * Returns the value of this.disabled
     * @returns true if `this.disabled` is true and false otherwise
     */
    public isDisabled(): boolean {
        return this.disabled;
    }

}