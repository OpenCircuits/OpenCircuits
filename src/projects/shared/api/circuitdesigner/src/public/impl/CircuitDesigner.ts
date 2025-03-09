import {SVGDrawing} from "svg2canvas";

import {RootCircuit}      from "shared/api/circuit/public";
import {CircuitTypes} from "shared/api/circuit/public/impl/CircuitState";

import {DefaultTool} from "shared/api/circuitdesigner/tools/DefaultTool";
import {Tool}        from "shared/api/circuitdesigner/tools/Tool";

import {CircuitDesigner, CircuitDesignerOptions} from "../CircuitDesigner";
import {Viewport}                                from "../Viewport";
import {CircuitDesignerState}                    from "./CircuitDesignerState";
import {ViewportImpl}                            from "./Viewport";


export interface ToolConfig {
    defaultTool: DefaultTool;
    tools: Tool[];
}

export function CircuitDesignerImpl<CircuitT extends RootCircuit, T extends CircuitTypes>(
    circuit: CircuitT,
    state: CircuitDesignerState<T>,
    svgMap: Map<string, SVGDrawing>,
    options: CircuitDesignerOptions,
) {
    const designer = {
        get circuit(): CircuitT {
            return circuit;
        },

        get viewport(): Viewport {
            return viewport;
        },

        get curTool(): Tool | undefined {
            return state.toolManager.curTool;
        },

        set curPressedObj(obj: T["Obj"] | undefined) {
            state.curPressedObj = obj;
        },
        get curPressedObj(): T["Obj"] | undefined {
            return state.curPressedObj;
        },
    } satisfies CircuitDesigner;

    const viewport = ViewportImpl(state, designer, svgMap, options);

    return designer;
}
