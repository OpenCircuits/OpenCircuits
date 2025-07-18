import {CreateCircuit} from "digital/api/circuit/public";
import {DigitalAPITypes} from "digital/api/circuit/public/impl/DigitalCircuitContext";

import {CircuitDesigner, ToolConfig} from "shared/api/circuitdesigner/public/CircuitDesigner";
import {CircuitDesignerImpl} from "shared/api/circuitdesigner/public/impl/CircuitDesigner";
import {CanvasTextMeasurer} from "shared/api/circuitdesigner/public/impl/rendering/CanvasTextMeasurer";
import {ToolRenderer} from "shared/api/circuitdesigner/tools/renderers/ToolRenderer";

import {SVGs} from "./rendering/svgs";


export interface DigitalCircuitDesigner extends CircuitDesigner<DigitalAPITypes> {}

export function CreateDesigner(
    toolConfig: ToolConfig<DigitalAPITypes>,
    renderers: ToolRenderer[],
    dragTime?: number,
    circuit = CreateCircuit(),
) {
    // Add text measurer
    circuit["ctx"].renderOptions.textMeasurer = new CanvasTextMeasurer();

    const designer = new CircuitDesignerImpl(circuit, circuit["ctx"], SVGs, { dragTime, toolConfig });

    designer.viewport.subscribe("onrender", (ev) => {
        renderers.forEach((toolRenderer) => toolRenderer.render({
            designer, renderer: ev.renderer,
        }));
    })

    return designer;
}
