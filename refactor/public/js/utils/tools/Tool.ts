import {MouseListener} from "../MouseListener";
import {KeyboardListener} from "../KeyboardListener";

export abstract class Tool implements MouseListener, KeyboardListener {

    abstract onKeyDown(key: number): void;
    abstract onKeyUp(key: number): void;
    abstract onMouseDown(): void;
    abstract onMouseMove(): void;
    abstract onMouseUp(): void;
    abstract onClick(): void;

}
