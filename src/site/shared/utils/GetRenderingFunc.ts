import {CircuitInfo}   from "core/utils/CircuitInfo";
import {RenderOptions} from "core/utils/RenderQueue";

import {Renderer} from "core/utils/rendering/Renderer";

import {DebugRenderer} from "core/utils/rendering/renderers/DebugRenderer";
import {GridRenderer}  from "core/utils/rendering/renderers/GridRenderer";
import {ToolRenderer}  from "core/utils/rendering/renderers/ToolRenderer";


type Info = {
    canvas: HTMLCanvasElement;
    info: CircuitInfo;
}
export function GetRenderFunc({ canvas, info }: Info) {
    const renderer = new Renderer(canvas);

    return function render({ useGrid }: RenderOptions = { useGrid: true }) {
        renderer.clear();

        if (useGrid)
            GridRenderer.render(renderer, info);

        info.viewManager.render({
            ...info,
            renderer,
        });

        ToolRenderer.render(renderer, info);

        DebugRenderer.render(renderer, info);
    }
}
