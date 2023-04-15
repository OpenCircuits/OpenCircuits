import {Circuit, Obj} from "core/public";
import {Cursor}       from "shared/utils/input/Cursor";
import {Vector}       from "Vector";


export interface CircuitDesigner<CircuitT extends Circuit = Circuit> {
    readonly circuit: CircuitT;

    cursor?: Cursor;
    curPressedObj?: Obj;

    readonly worldMousePos: Vector;

    attachCanvas(canvas: HTMLCanvasElement): () => void;
    detachCanvas(): void;
}
