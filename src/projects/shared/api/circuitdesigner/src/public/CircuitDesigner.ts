import {Observable} from "shared/api/circuit/utils/Observable";
import {CircuitAPITypes} from "shared/api/circuit/public/impl/Types";

import {Tool}         from "../tools/Tool";
import {Viewport}     from "./Viewport";
import {DefaultTool} from "../tools/DefaultTool";


export interface CircuitDesignerOptions<T extends CircuitAPITypes = CircuitAPITypes> {
    dragTime?: number;
    toolConfig: ToolConfig<T>;
}

export interface ToolConfig<T extends CircuitAPITypes = CircuitAPITypes> {
    defaultTool: DefaultTool<T>;
    tools: Tool[];
}

export type CircuitDesignerEv = {
    type: "handlerFired";
    handler: string;
} | {
    type: "toolActivated";
    tool: Tool;
} | {
    type: "toolDeactivated";
    tool: Tool;
}

// All state variables within the CircuitDesigner will/should NOT be serialized
// and shouldn't persist through user sessions. I.e. they will reset on page refresh
// and represent temporary state for the user in the current session.
export interface CircuitDesigner<T extends CircuitAPITypes = CircuitAPITypes> extends Observable<CircuitDesignerEv> {
    readonly circuit: T["Circuit"];

    // When the circuit is 'locked', only specific actions can be performed.
    isLocked: boolean;
    readonly curTool?: Tool;
    curPressedObj?: T["Obj"];

    viewport: Viewport;
}
