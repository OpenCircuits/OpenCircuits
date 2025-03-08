import {Vector} from "Vector";
import {Rect}   from "math/Rect";

import {Component}  from "./Component";
import {Obj}        from "./Obj";
import {Observable} from "./Observable";
import {Wire}       from "./Wire";


export type SelectionsEvent = {
    type: "numSelectionsChanged";
    newAmt: number;
}

export interface Selections extends Observable<SelectionsEvent> {
    // Returns the bounding box of all the selections
    readonly bounds: Rect;

    // Returns a midpoint of the set of selections based on the positions
    // of the selected objects.
    readonly midpoint: Vector;

    readonly length: number;
    readonly isEmpty: boolean;

    readonly all: Obj[];
    readonly components: Component[];
    readonly wires: Wire[];

    clear(): void;

    forEach(f: (obj: Obj, i: number, arr: Obj[]) => void): void;
    filter(f: (obj: Obj, i: number, arr: Obj[]) => boolean): Obj[];
    filter<O extends Obj>(f: (obj: Obj, i: number, arr: Obj[]) => obj is O): O[];
    every(condition: (obj: Obj, i: number, arr: Obj[]) => boolean): boolean;

    duplicate(): Obj[];
}
