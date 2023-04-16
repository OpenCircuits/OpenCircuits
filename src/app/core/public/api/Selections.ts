import {Component} from "./Component";
import {Obj}       from "./Obj";
import {Wire}      from "./Wire";


export interface Selections {
    readonly length: number;
    readonly isEmpty: boolean;

    readonly all: Obj[];
    readonly components: Component[];
    readonly wires: Wire[];

    clear(): void;

    every(condition: (obj: Obj, i: number, arr: Obj[]) => boolean): boolean;

    duplicate(): Obj[];
}
