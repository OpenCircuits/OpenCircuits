import {CreateCircuit} from "digital/api/circuit/public";
import {DigitalTypes} from "digital/api/circuit/public/impl/DigitalCircuitState";

import {CircuitDesigner} from "shared/api/circuitdesigner/public/CircuitDesigner";
import {CircuitDesignerImpl, ToolConfig} from "shared/api/circuitdesigner/public/impl/CircuitDesigner";
import {CircuitDesignerState} from "shared/api/circuitdesigner/public/impl/CircuitDesignerState";
import {CanvasTextMeasurer} from "shared/api/circuitdesigner/public/impl/rendering/CanvasTextMeasurer";
import {ToolRenderer} from "shared/api/circuitdesigner/tools/renderers/ToolRenderer";
import {ToolManager} from "shared/api/circuitdesigner/public/impl/ToolManager";

import {SVGs} from "./rendering/svgs";

export interface DigitalCircuitDesigner extends CircuitDesigner<DigitalTypes> {}

export function CreateDesigner(
    toolConfig: ToolConfig<DigitalTypes>,
    renderers: ToolRenderer[],
    dragTime?: number,
    [circuit, state] = CreateCircuit(),
) {
    // Add text measurer
    state.renderOptions.textMeasurer = new CanvasTextMeasurer();

    // create view and attach renderers as post-process rendering
    const designerState: CircuitDesignerState<DigitalTypes> = {
        circuitState: state,

        toolManager: new ToolManager<DigitalTypes>(toolConfig.defaultTool, toolConfig.tools),

        isLocked:      false,
        curPressedObj: undefined,
        margin:        { left: 0, right: 0, top: 0, bottom: 0 },
        debugOptions:  {
            debugPrims:              false,
            debugPrimBounds:         false,
            debugPrimOrientedBounds: false,

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
