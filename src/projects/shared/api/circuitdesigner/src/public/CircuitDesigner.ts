import {Circuit, Obj} from "shared/api/circuit/public";

import {Tool}         from "../tools/Tool";
import {Viewport}     from "./Viewport";


export interface CircuitDesignerOptions {
    dragTime?: number;
}


// All state variables within the CircuitDesigner will/should NOT be serialized
// and shouldn't persist through user sessions. I.e. they will reset on page refresh
// and represent temporary state for the user in the current session.
export interface CircuitDesigner<CircuitT extends Circuit = Circuit> {
    readonly circuit: CircuitT;

    readonly curTool?: Tool;
    curPressedObj?: Obj;

    viewport: Viewport;
}
