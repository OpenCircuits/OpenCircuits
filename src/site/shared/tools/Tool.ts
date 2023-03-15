import {Circuit, GUID}     from "core/public";
import {InputManagerEvent} from "shared/utils/input/InputManagerEvent";


export interface Tool {
    // Conditional method to see if the current state should transition to this tool
    shouldActivate(ev: InputManagerEvent, circuit: Circuit, state: ToolState): boolean;

    // Conditional method to see if the current state should transition out of this tool
    shouldDeactivate(ev: InputManagerEvent, circuit: Circuit, state: ToolState): boolean;


    // Method called when this tool is initially activated
    onActivate(ev: InputManagerEvent, circuit: Circuit, state: ToolState): void;

    // Method called when this tool is deactivated
    onDeactivate(ev: InputManagerEvent, circuit: Circuit, state: ToolState): void;


    // Method called when this tool is currently active and an event occurs
    onEvent(ev: InputManagerEvent, circuit: Circuit, state: ToolState): void;
}

export interface ToolState {
    curPressedObjID?: GUID;
}
