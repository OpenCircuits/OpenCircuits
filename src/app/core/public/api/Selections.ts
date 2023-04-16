import {Component} from "./Component";
import {Obj}       from "./Obj";


export interface Selections {
    readonly length: number;
    readonly isEmpty: boolean;

    readonly all: Obj[];
    readonly components: Component[];

    clear(): void;

    every(condition: (obj: Obj, i: number, arr: Obj[]) => boolean): boolean;
}
