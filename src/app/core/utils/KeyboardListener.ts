import {Input} from "./Input";

export interface KeyboardListener {

    onKeyDown(input: Input, key: string): boolean;
    onKeyUp(input: Input, key: string): boolean;

}
