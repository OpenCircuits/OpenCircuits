import {RenderOptions} from "core/utils/RenderQueue";

import {CreateRenderers} from "core/rendering/CreateRenderers";
import {Renderer}        from "core/rendering/Renderer";

import {DebugRenderer} from "core/rendering/renderers/DebugRenderer";
import {GridRenderer}  from "core/rendering/renderers/GridRenderer";
import {ToolRenderer}  from "core/rendering/renderers/ToolRenderer";
import {WireRenderer}  from "core/rendering/renderers/WireRenderer";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import {ComponentRenderer} from "analog/rendering/renderers/ComponentRenderer";


type Info = {
    canvas: HTMLCanvasElement;
    info: AnalogCircuitInfo;
}
export function GetRenderFunc({ canvas, info }: Info) {
    const renderer = new Renderer(canvas);

    const renderers = CreateRenderers(renderer, info, {
        gridRenderer:      GridRenderer,
        wireRenderer:      WireRenderer,
        componentRenderer: ComponentRenderer,
        toolRenderer:      ToolRenderer,
        debugRenderer:     DebugRenderer,
    });

    return function render({ useGrid }: RenderOptions = { useGrid: true }) {
        const { Grid, Wires, Components, Tools, Debug } = renderers;
        const { designer, selections, toolManager } = info;

        renderer.clear();

        if (useGrid)
            Grid.render();

        Wires.renderAll(designer.getWires(), selections.get());
        Components.renderAll(designer.getObjects(), selections.get());

        Tools.render(toolManager);

        Debug.render();
    }
}
