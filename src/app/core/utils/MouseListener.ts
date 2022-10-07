import {Input} from "./Input";


export interface MouseListener {

    onMouseDown(input: Input, button: number): boolean;
    onMouseMove(input: Input): boolean;
    onMouseDrag(input: Input, button: number): boolean;
    onMouseUp(input: Input, button: number): boolean;
    onClick(input: Input, button: number): boolean;

}
