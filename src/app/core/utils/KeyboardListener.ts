import {Input} from "./Input";


export interface KeyboardListener {

    onKeyDown(input: Input, key: number): boolean;
    onKeyUp(input: Input, key: number): boolean;

}
