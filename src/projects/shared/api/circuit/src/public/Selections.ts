import {Vector} from "Vector";

import {Component}  from "./Component";
import {Obj}        from "./Obj";
import {Observable} from "./Observable";
import {Wire}       from "./Wire";


export type SelectionsEvent = {
    type: "numSelectionsChanged";
    newAmt: number;
}

export interface Selections extends Observable<SelectionsEvent> {
    readonly length: number;
    readonly isEmpty: boolean;

    readonly all: Obj[];
    readonly components: Component[];
    readonly wires: Wire[];

    /**
     * Returns the average of the positions of the components selected
     * as a Vector object.
     *
     * @returns A Vector object where x and y are the averages
     *  of the positions of the selected components.
     */
    midpoint(): Vector;

    clear(): void;

    forEach(f: (obj: Obj, i: number, arr: Obj[]) => void): void;
    filter(f: (obj: Obj, i: number, arr: Obj[]) => boolean): Obj[];
    filter<O extends Obj>(f: (obj: Obj, i: number, arr: Obj[]) => obj is O): O[];
    every(condition: (obj: Obj, i: number, arr: Obj[]) => boolean): boolean;

    duplicate(): Obj[];
}
