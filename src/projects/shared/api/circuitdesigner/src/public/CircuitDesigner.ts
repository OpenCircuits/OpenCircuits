import {CircuitTypes} from "shared/api/circuit/public/impl/CircuitContext";

import {Tool}         from "../tools/Tool";
import {Viewport}     from "./Viewport";
import {Observable} from "shared/api/circuit/utils/Observable";
import {DefaultTool} from "../tools/DefaultTool";


export interface CircuitDesignerOptions {
    dragTime?: number;
    toolConfig: ToolConfig;
}

export interface ToolConfig<T extends CircuitTypes = CircuitTypes> {
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
export interface CircuitDesigner<T extends CircuitTypes = CircuitTypes> extends Observable<CircuitDesignerEv> {
    readonly circuit: T["Circuit"];

    // When the circuit is 'locked', only specific actions can be performed.
    isLocked: boolean;
    readonly curTool?: Tool;
    curPressedObj?: T["Obj"];

    viewport: Viewport;
}
