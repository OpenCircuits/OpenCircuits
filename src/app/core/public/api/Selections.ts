import {Component} from "./Component";
import {Obj}       from "./Obj";


export interface Selections {
    readonly length: number;
    readonly isEmpty: boolean;

    readonly components: Component[];

    every(condition: (obj: Obj, i: number, arr: Obj[]) => boolean): boolean;
}
