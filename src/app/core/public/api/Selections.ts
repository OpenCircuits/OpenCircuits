import {Vector} from "Vector";

import {Component}  from "./Component";
import {Obj}        from "./Obj";
import {Wire}       from "./Wire";
import {Observable} from "./Observable";


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
     * @param space Defines the coordinate-space which can be
     *              either "screen space" or "world space".
     * @returns     A Vector object where x and y are the averages
     *              of the positions of the selected components.
     */
    midpoint(space?: Vector.Spaces): Vector;

    clear(): void;

    forEach(f: (obj: Obj, i: number, arr: Obj[]) => void): void;
    every(condition: (obj: Obj, i: number, arr: Obj[]) => boolean): boolean;

    duplicate(): Obj[];
}
