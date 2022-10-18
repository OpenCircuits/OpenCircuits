import {CircuitInfo}       from "core/utils/CircuitInfo";
import {InputManagerEvent} from "core/utils/InputManager";


export type Tool = {
    // Conditional method to see if the current state should transition to this tool
    shouldActivate(event: InputManagerEvent, info: CircuitInfo): boolean;

    // Conditional method to see if the current state should transition out of this tool
    shouldDeactivate(event: InputManagerEvent, info: CircuitInfo): boolean;


    // Method called when this tool is initially activated
    onActivate(event: InputManagerEvent, info: CircuitInfo): void;

    // Method called when this tool is deactivated
    onDeactivate(event: InputManagerEvent, info: CircuitInfo): void;


    // Method called when this tool is currently active and an event occurs
    onEvent(event: InputManagerEvent, info: CircuitInfo): boolean;
}
