import {Circuit, Obj} from "core/public";
import {Cursor}       from "shared/utils/input/Cursor";


export interface CircuitDesigner<CircuitT extends Circuit = Circuit> {
    readonly circuit: CircuitT;

    cursor?: Cursor;
    curPressedObj?: Obj;

    attachCanvas(canvas: HTMLCanvasElement): () => void;
    detachCanvas(): void;
}
