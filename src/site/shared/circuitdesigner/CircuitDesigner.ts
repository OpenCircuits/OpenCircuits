import {Circuit, Obj} from "core/public";
import {Cursor}       from "shared/utils/input/Cursor";
import {Vector}       from "Vector";


export interface CircuitDesigner<Circ extends Circuit = Circuit> {
    readonly circuit: Circ;

    cursor?: Cursor;
    curPressedObj?: Obj;

    readonly worldMousePos: Vector;
}
