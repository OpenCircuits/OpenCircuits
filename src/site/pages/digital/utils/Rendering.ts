import {ToolManager} from "core/tools/ToolManager";

import {CreateRenderers} from "core/rendering/CreateRenderers";
import {Grid}            from "core/rendering/Grid";
import {Renderer}        from "core/rendering/Renderer";
import {DebugRenderer}   from "core/rendering/DebugRenderer";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";

import {ComponentRenderer} from "digital/rendering/ioobjects/ComponentRenderer";
import {WireRenderer}      from "digital/rendering/ioobjects/WireRenderer";
import {ToolRenderer}      from "digital/rendering/ToolRenderer";


type Info = {
    canvas: HTMLCanvasElement;
    info: DigitalCircuitInfo;
    toolManager: ToolManager;
}
export function GetRenderFunc({canvas, info, toolManager}: Info) {
    const renderer = new Renderer(canvas);

    const renderers = CreateRenderers(renderer, info, {
        gridRenderer: Grid,
        wireRenderer: WireRenderer,
        componentRenderer: ComponentRenderer,
        toolRenderer: ToolRenderer,
        debugRenderer: DebugRenderer
    });

    return function render() {
        const {Grid, Wires, Components, Tools, Debug} = renderers;
        const {designer, selections} = info;

        renderer.clear();

        Grid.render();

        Wires.renderAll(designer.getWires(), selections.get());
        Components.renderAll(designer.getObjects(), selections.get());

        Tools.render(toolManager);

        Debug.render();
    }
}
