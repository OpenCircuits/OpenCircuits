import {CreateCircuit, DigitalCircuit} from "digital/public";
import {DigitalTypes} from "digital/public/api/impl/DigitalCircuitState";

import {CircuitDesigner} from "shared/circuitdesigner/CircuitDesigner";
import {CircuitDesignerImpl, ToolConfig} from "shared/circuitdesigner/impl/CircuitDesigner";
import {CircuitDesignerState} from "shared/circuitdesigner/impl/CircuitDesignerState";
import {ToolManager} from "shared/circuitdesigner/impl/ToolManager";

import {SVGs} from "./rendering/svgs";

export interface DigitalCircuitDesigner extends CircuitDesigner<DigitalCircuit> {}

export function CreateDesigner(toolConfig: ToolConfig) {
    const [circuit, state] = CreateCircuit();

    // create view and attach toolConfig.renderers as post-process rendering

    const designerState: CircuitDesignerState<DigitalTypes> = {
        circuitState: state,

        curCamera: "main",
        cameras:   {
            "main": {
                x:    0,
                y:    0,
                zoom: 0.02,
            },
        },

        toolManager: new ToolManager(toolConfig.defaultTool, toolConfig.tools),

        curPressedObj: undefined,
        cursor:        undefined,
        margin:        { left: 0, right: 0, top: 0, bottom: 0 },
        debugOptions:  {
            debugCullboxes:       false,
            debugNoFill:          false,
            debugPressableBounds: false,
            debugSelectionBounds: false,
        },
    };

    return CircuitDesignerImpl(circuit, designerState, SVGs);
}
