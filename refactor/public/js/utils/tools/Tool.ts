import {Input} from "../Input";
import {MouseListener} from "../MouseListener";
import {KeyboardListener} from "../KeyboardListener";

export abstract class Tool implements MouseListener, KeyboardListener {

    public onKeyDown(input: Input, key: number): boolean {
        return false;
    }

    public onKeyUp(input: Input, key: number): boolean {
        return false;
    }

    public onMouseDown(input: Input, button: number): boolean {
        return false;
    }

    public onMouseMove(input: Input, button: number): boolean {
        return false;
    }

    public onMouseDrag(input: Input, button: number): boolean {
        return false;
    }

    public onMouseUp(input: Input, button: number): boolean {
        return false;
    }

    public onClick(input: Input, button: number): boolean {
        return false;
    }

}
