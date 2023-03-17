import {GUID}              from "core/public";
import {CircuitDesigner}   from "shared/circuitdesigner/CircuitDesigner";
import {InputManagerEvent} from "shared/utils/input/InputManagerEvent";


export interface Tool {
    // Conditional method to see if the current state should transition to this tool
    shouldActivate(ev: InputManagerEvent, designer: CircuitDesigner): boolean;

    // Conditional method to see if the current state should transition out of this tool
    shouldDeactivate(ev: InputManagerEvent, designer: CircuitDesigner): boolean;


    // Method called when this tool is initially activated
    onActivate(ev: InputManagerEvent, designer: CircuitDesigner): void;

    // Method called when this tool is deactivated
    onDeactivate(ev: InputManagerEvent, designer: CircuitDesigner): void;


    // Method called when this tool is currently active and an event occurs
    onEvent(ev: InputManagerEvent, designer: CircuitDesigner): void;
}
