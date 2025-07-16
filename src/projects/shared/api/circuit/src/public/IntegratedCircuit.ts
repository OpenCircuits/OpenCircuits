import {Vector} from "Vector";

import {GUID} from "shared/api/circuit/schema";

import {ReadonlyComponent}    from "./Component";
import {ReadonlyWire}         from "./Wire";
import {ReadonlyObjContainer} from "./ObjContainer";
import {ReadonlyCircuit}      from "./Circuit";


export interface ICInfo {
    circuit: ReadonlyCircuit;
    display: ReadonlyIntegratedCircuitDisplay;
}

export interface ReadonlyICPin {
    readonly id: GUID;  // ID of corresponding PORT
    readonly group: string;

    readonly name: string;

    readonly pos: Vector;
    readonly dir: Vector;
}
export interface ICPin extends ReadonlyICPin {
    readonly id: GUID;  // ID of corresponding PORT
    readonly group: string;

    pos: Vector;
    dir: Vector;
}

export interface ReadonlyIntegratedCircuitDisplay {
    readonly size: Vector;
    readonly pins: ReadonlyICPin[];
}
export interface IntegratedCircuitDisplay extends ReadonlyIntegratedCircuitDisplay {
    size: Vector;
    readonly pins: ICPin[];
}

interface BaseReadonlyIntegratedCircuit<ICDisplayT> {
    readonly id: GUID;

    readonly name: string;
    readonly desc: string;

    readonly display: ICDisplayT;

    readonly all: ReadonlyObjContainer;
    readonly components: ReadonlyComponent[];
    readonly wires: ReadonlyWire[];
}

export type ReadonlyIntegratedCircuit = BaseReadonlyIntegratedCircuit<ReadonlyIntegratedCircuitDisplay>;

export type IntegratedCircuit = BaseReadonlyIntegratedCircuit<IntegratedCircuitDisplay> & {
    name: string;
}
