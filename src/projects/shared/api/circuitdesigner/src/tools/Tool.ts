import {CircuitDesigner}   from "shared/api/circuitdesigner/public/CircuitDesigner";
import {InputAdapterEvent} from "shared/api/circuitdesigner/input/InputAdapterEvent";
import {Observable} from "shared/api/circuit/utils/Observable";


export interface ToolEvent {
    type: "statechange";
}

export interface Tool extends Observable<ToolEvent> {
    // Conditional method to see if the current state should transition to this tool
    shouldActivate(ev: InputAdapterEvent, designer: CircuitDesigner): boolean;

    // Conditional method to see if the current state should transition out of this tool
    shouldDeactivate(ev: InputAdapterEvent, designer: CircuitDesigner): boolean;


    // Method called when this tool is initially activated
    onActivate(ev: InputAdapterEvent, designer: CircuitDesigner): void;

    // Method called when this tool is deactivated
    onDeactivate(ev: InputAdapterEvent, designer: CircuitDesigner): void;


    // Method called when this tool is currently active and an event occurs
    onEvent(ev: InputAdapterEvent, designer: CircuitDesigner): void;
}
