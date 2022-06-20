import {CircuitInfo} from "core/utils/CircuitInfo";
import {Event}       from "core/utils/Events";


export type Tool = {
    // Conditional method to see if the current state should transition to this tool
    shouldActivate(event: Event, info: CircuitInfo): boolean;

    // Conditional method to see if the current state should transition out of this tool
    shouldDeactivate(event: Event, info: CircuitInfo): boolean;


    // Method called when this tool is initially activated
    onActivate(event: Event, info: CircuitInfo): void;

    // Method called when this tool is deactivated
    onDeactivate(event: Event, info: CircuitInfo): void;


    // Method called when this tool is currently active and an event occurs
    onEvent(event: Event, info: CircuitInfo): boolean;
}
