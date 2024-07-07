import {Margin} from "math/Rect";

import {Circuit} from "core/public";

import {DebugOptions} from "shared/circuitdesigner/impl/DebugOptions";
import {DefaultTool}  from "shared/tools/DefaultTool";
import {ToolRenderer} from "shared/tools/renderers/ToolRenderer";
import {Tool}         from "shared/tools/Tool";
import {Cursor}       from "shared/utils/input/Cursor";

import {CircuitDesigner} from "../CircuitDesigner";
import {CircuitTypes} from "core/public/api/impl/CircuitState";
import {CircuitDesignerState} from "./CircuitDesignerState";
import {Viewport} from "../Viewport";
import {ViewportImpl} from "./Viewport";


export interface ToolConfig {
    defaultTool: DefaultTool;
    tools: Tool[];
    renderers?: ToolRenderer[];
}

export function CircuitDesignerImpl<CircuitT extends Circuit, T extends CircuitTypes>(
    circuit: CircuitT,
    state: CircuitDesignerState<T>
) {
    const viewport = ViewportImpl(state);

    return {
        get circuit(): CircuitT {
            return circuit;
        },

        get viewport(): Viewport {
            return viewport;
        },

        set curPressedObj(obj: T["Obj"] | undefined) {
            state.curPressedObj = obj;
        },
        get curPressedObj(): T["Obj"] | undefined {
            return state.curPressedObj;
        },

        set cursor(cursor: Cursor | undefined) {
            state.cursor = cursor;
        },
        get cursor(): Cursor | undefined {
            return state.cursor;
        },

        set margin(m: Margin) {
            state.margin = { ...state.margin, ...m };
        },
        get margin(): Margin {
            return state.margin;
        },

        set debugOptions(val: DebugOptions) {
            state.debugOptions = { ...state.debugOptions, ...val };
        },
        get debugOptions(): DebugOptions {
            return state.debugOptions;
        },
    } satisfies CircuitDesigner;
}

//         this.state = {
//             curPressedObj: undefined,
//             cursor:        undefined,
//             margin:        { left: 0, right: 0, top: 0, bottom: 0 },
//             debugOptions:  {
//                 debugCullboxes:       false,
//                 debugNoFill:          false,
//                 debugPressableBounds: false,
//                 debugSelectionBounds: false,
//             },
//         };
//     }
