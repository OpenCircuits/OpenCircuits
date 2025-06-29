import {CircuitDesigner}   from "shared/api/circuitdesigner/public/CircuitDesigner";
import {InputAdapterEvent} from "shared/api/circuitdesigner/input/InputAdapterEvent";
import {ObservableImpl} from "shared/api/circuit/utils/Observable";
import {Cursor} from "../input/Cursor";


export interface ToolEvent {
    type: "statechange";
}

export interface Tool extends ObservableImpl<ToolEvent> {
    canActivateWhenLocked?: boolean;

    // Optional method to return a `Cursor` to indicate that the tool could be activated.
    indicateCouldActivate?: (ev: InputAdapterEvent, designer: CircuitDesigner) => Cursor | undefined;

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
