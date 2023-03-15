import {Circuit}           from "core/public";
import {InputManagerEvent} from "shared/utils/input/InputManagerEvent";


export interface Tool {
    // Conditional method to see if the current state should transition to this tool
    shouldActivate(event: InputManagerEvent, circuit: Circuit): boolean;

    // Conditional method to see if the current state should transition out of this tool
    shouldDeactivate(event: InputManagerEvent, circuit: Circuit): boolean;


    // Method called when this tool is initially activated
    onActivate(event: InputManagerEvent, circuit: Circuit): void;

    // Method called when this tool is deactivated
    onDeactivate(event: InputManagerEvent, circuit: Circuit): void;


    // Method called when this tool is currently active and an event occurs
    onEvent(event: InputManagerEvent, circuit: Circuit): void;
}
