import {CreateRenderers} from "core/rendering/CreateRenderers";
import {Grid}            from "core/rendering/Grid";
import {Renderer}        from "core/rendering/Renderer";
import {DebugRenderer}   from "core/rendering/DebugRenderer";

import {RenderOptions} from "core/utils/RenderQueue";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";

import {ComponentRenderer} from "digital/rendering/ioobjects/ComponentRenderer";
import {WireRenderer}      from "digital/rendering/ioobjects/WireRenderer";
import {ToolRenderer}      from "digital/rendering/ToolRenderer";


type Info = {
    canvas: HTMLCanvasElement;
    info: DigitalCircuitInfo;
}
export function GetRenderFunc({canvas, info}: Info) {
    const renderer = new Renderer(canvas);

    const renderers = CreateRenderers(renderer, info, {
        gridRenderer: Grid,
        wireRenderer: WireRenderer,
        componentRenderer: ComponentRenderer,
        toolRenderer: ToolRenderer,
        debugRenderer: DebugRenderer
    });

    return function render({useGrid}: RenderOptions = { useGrid: true }) {
        const {Grid, Wires, Components, Tools, Debug} = renderers;
        const {designer, selections, toolManager} = info;

        renderer.clear();

        if (useGrid)
            Grid.render();

        Wires.renderAll(designer.getWires(), selections.get());
        Components.renderAll(designer.getObjects(), selections.get());

        Tools.render(toolManager);

        Debug.render();
    }
}
