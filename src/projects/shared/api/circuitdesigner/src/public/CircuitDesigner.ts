import {CircuitTypes} from "shared/api/circuit/public/impl/CircuitContext";

import {Tool}         from "../tools/Tool";
import {Viewport}     from "./Viewport";
import {Observable} from "shared/api/circuit/utils/Observable";


export interface CircuitDesignerOptions {
    dragTime?: number;
}

export type CircuitDesignerEv = {
    type: "handlerFired";
    handler: string;
}

// All state variables within the CircuitDesigner will/should NOT be serialized
// and shouldn't persist through user sessions. I.e. they will reset on page refresh
// and represent temporary state for the user in the current session.
export interface CircuitDesigner<T extends CircuitTypes = CircuitTypes> extends Observable<CircuitDesignerEv> {
    readonly circuit: T["Circuit"];

    // When the circuit is 'locked', only specific actions can be performed.
    isLocked: boolean;
    readonly curTool?: Tool;
    curPressedObj?: T["Obj"];

    viewport: Viewport;
}
