import {Circuit, Obj} from "core/public";
import {Cursor}       from "shared/utils/input/Cursor";


export interface CircuitDesigner<Circ extends Circuit = Circuit> {
    readonly circuit: Circ;

    cursor?: Cursor;
    curPressedObj?: Obj;

    attachCanvas(canvas: HTMLCanvasElement): () => void;
    detachCanvas(): void;
}
