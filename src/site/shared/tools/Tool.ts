import {Circuit}           from "core/public";
import {InputAdapterEvent} from "shared/utils/input/InputAdapterEvent";


export interface Tool {
    // Conditional method to see if the current state should transition to this tool
    shouldActivate(event: InputAdapterEvent, circuit: Circuit): boolean;

    // Conditional method to see if the current state should transition out of this tool
    shouldDeactivate(event: InputAdapterEvent, circuit: Circuit): boolean;


    // Method called when this tool is initially activated
    onActivate(event: InputAdapterEvent, circuit: Circuit): void;

    // Method called when this tool is deactivated
    onDeactivate(event: InputAdapterEvent, circuit: Circuit): void;


    // Method called when this tool is currently active and an event occurs
    onEvent(event: InputAdapterEvent, circuit: Circuit): void;
}
