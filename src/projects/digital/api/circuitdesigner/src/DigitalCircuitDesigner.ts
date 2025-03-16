import {CreateCircuit, DigitalCircuit} from "digital/api/circuit/public";
import {DigitalTypes} from "digital/api/circuit/public/impl/DigitalCircuitState";

import {CircuitDesigner} from "shared/api/circuitdesigner/public/CircuitDesigner";
import {CircuitDesignerImpl, ToolConfig} from "shared/api/circuitdesigner/public/impl/CircuitDesigner";
import {CircuitDesignerState} from "shared/api/circuitdesigner/public/impl/CircuitDesignerState";
import {ToolRenderer} from "shared/api/circuitdesigner/tools/renderers/ToolRenderer";
import {ToolManager} from "shared/api/circuitdesigner/public/impl/ToolManager";

import {SVGs} from "./rendering/svgs";

export interface DigitalCircuitDesigner extends CircuitDesigner<DigitalCircuit> {}

export function CreateDesigner(toolConfig: ToolConfig, renderers: ToolRenderer[], dragTime?: number) {
    const [circuit, state] = CreateCircuit();

    // create view and attach renderers as post-process rendering
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
            debugPrimBounds: false,

            debugComponentBounds: false,
            debugPortBounds:      false,
            debugWireBounds:      false,

            debugPressableBounds: false,
        },
    };

    const designer = new CircuitDesignerImpl(circuit, designerState, SVGs, { dragTime });

    designer.viewport.subscribe("onrender", (ev) => {
        renderers.forEach((toolRenderer) => toolRenderer.render({
            designer, renderer: ev.renderer,
        }));
    })

    return designer;
}
