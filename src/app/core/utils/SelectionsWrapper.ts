import {GUID}       from "./GUID";
import {Observable} from "./Observable";


/**
 * Wrapper class to hold and manage a set of Selectables.
 * Can notfiy to other parts of the code about changes in
 * the # of selections through its array of listeners functions.
 */
export class SelectionsWrapper extends Observable {
    // Store selections as list of GUIDs
    private readonly selections: Set<GUID>;

    private disabled: boolean;

    /**
     * Intializes a SelectionsWrapper with no elements in `this.seclections`
     * or `this.listeners` and `this.disabled` set to false.
     */
    public constructor() {
        super();

        this.selections = new Set();
        this.disabled = false;
    }

    /**
     * Sets `this.disabled` equal to `disabled`.
     *
     * @param disabled Boolean value to set `this.disabled` to (defaults to true).
     */
    public setDisabled(disabled = true): void {
        this.disabled = disabled;
    }

    /**
     * If `s` is not in `this.selections`, adds `s` to `this.selections` then calls every function in `this.listeners`.
     *
     * @param id Selectable to add to `this.selections`.
     * @returns  True if `this.disabled` is false and `s` is not in `this.selections`, and false otheriwse.
     */
    public select(id: GUID): boolean {
        if (this.isDisabled() || this.selections.has(id))
            return false;
        this.selections.add(id);

        // Callback change listeners
        super.publish({});

        return true;
    }

    /**
     * If `s` is in `this.selections`, removes `s` from `this.selections` then calls every function in `this.listeners`.
     *
     * @param id Selectable to remove from `this.selections`.
     * @returns  True if `this.disabled` is false and `s` is in `this.selections`, and false otheriwse.
     */
    public deselect(id: GUID): boolean {
        if (this.isDisabled() || !this.selections.delete(id))
            return false;

        // Callback change listeners
        super.publish({});

        return true;
    }

    /**
     * Returns whether or not `f` returns true for every element of `this.selections`.
     *
     * @param f A function that takes a Selectable `s` and returns a boolean.
     * @returns Returns true if `f` returns true for every element in `this.selections` and false otherwise.
     */
    public all(f: (id: GUID) => boolean): boolean {
        return this.get().every((s) => f(s));
    }

    /**
     * Returns whether or not `f` returns true for at least one element of `this.selections`.
     *
     * @param f A function that takes a Selectable `s` and returns a boolean.
     * @returns Returns true if `f` returns true for every element in `this.selections` and false otherwise.
     */
    public any(f: (s: GUID) => boolean): boolean {
        return this.get().some((s) => f(s));
    }

    /**
     * Checks to see if the elements of `s` are also in `this.selections`.
     *
     * @param s An array of type Selectable.
     * @returns True if every Selectable in s is also in `this.selections` and false otherwise.
     */
    public has(...s: GUID[]): boolean {
        return s.every((s) => this.selections.has(s));
    }


    /**
     * Returns the number of elements in `this.selections`.
     *
     * @returns The value of `this.selections.size`.
     */
    public amount(): number {
        return this.selections.size;
    }

    /**
     * Returns an array containing the elements of `this.selections`.
     *
     * @returns An array of type Selectable that contains the elements of `this.selections`.
     */
    public get(): GUID[] {
        return [...this.selections];
    }

    /**
     * Returns the value of this.disabled.
     *
     * @returns True if `this.disabled` is true and false otherwise.
     */
    public isDisabled(): boolean {
        return this.disabled;
    }

}
