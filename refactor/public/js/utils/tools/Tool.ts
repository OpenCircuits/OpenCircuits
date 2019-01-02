import {MouseListener} from "../MouseListener";
import {KeyboardListener} from "../KeyboardListener";

export abstract class Tool implements MouseListener, KeyboardListener {

    abstract onKeyDown(key: number): void;
    abstract onKeyUp(key: number): void;
    abstract onMouseDown(button: number): void;
    abstract onMouseMove(button: number): void;
    abstract onMouseDrag(button: number): void;
    abstract onMouseUp(button: number): void;
    abstract onClick(button: number): void;

}
