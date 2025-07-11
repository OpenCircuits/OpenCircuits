import {CreateCircuit} from "analog/api/circuit/public";

import {CircuitDesigner, ToolConfig} from "shared/api/circuitdesigner/public/CircuitDesigner";
import {CircuitDesignerImpl} from "shared/api/circuitdesigner/public/impl/CircuitDesigner";
import {CanvasTextMeasurer} from "shared/api/circuitdesigner/public/impl/rendering/CanvasTextMeasurer";
import {ToolRenderer} from "shared/api/circuitdesigner/tools/renderers/ToolRenderer";

import {SVGs} from "./rendering/svgs";


export interface AnalogCircuitDesigner extends CircuitDesigner {}

export function CreateDesigner(
    toolConfig: ToolConfig,
    renderers: ToolRenderer[],
    dragTime?: number,
    circuit = CreateCircuit(),
) {
    // Add text measurer
    // TODO: Figure out a better way/place to set this
    circuit["ctx"].renderOptions.textMeasurer = new CanvasTextMeasurer();

    const designer = new CircuitDesignerImpl(circuit, circuit["ctx"], SVGs, { dragTime, toolConfig });

    // TODO: Maybe move this logic into the CircuitDesignerImpl?
    designer.viewport.subscribe("onrender", (ev) => {
        renderers.forEach((toolRenderer) => toolRenderer.render({
            designer, renderer: ev.renderer,
        }));
    })

    return designer;
}
