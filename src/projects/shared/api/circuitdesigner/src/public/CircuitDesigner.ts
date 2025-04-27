import {CircuitTypes} from "shared/api/circuit/public/impl/CircuitState";

import {Tool}         from "../tools/Tool";
import {Viewport}     from "./Viewport";


export interface CircuitDesignerOptions {
    dragTime?: number;
}


// All state variables within the CircuitDesigner will/should NOT be serialized
// and shouldn't persist through user sessions. I.e. they will reset on page refresh
// and represent temporary state for the user in the current session.
export interface CircuitDesigner<T extends CircuitTypes = CircuitTypes> {
    readonly circuit: T["Circuit"];

    // When the circuit is 'locked', only specific actions can be performed.
    isLocked: boolean;
    readonly curTool?: Tool;
    curPressedObj?: T["Obj"];

    viewport: Viewport;
}
