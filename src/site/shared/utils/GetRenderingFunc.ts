import {CircuitInfo}   from "core/utils/CircuitInfo";
import {RenderOptions} from "core/utils/RenderQueue";

import {Renderer} from "core/utils/rendering/Renderer";

import {DebugRenderer} from "core/utils/rendering/renderers/DebugRenderer";
import {GridRenderer}  from "core/utils/rendering/renderers/GridRenderer";
import {ToolRenderer}  from "core/utils/rendering/renderers/ToolRenderer";

import {AnyPort} from "core/models/types";


type Info = {
    canvas: HTMLCanvasElement;
    info: CircuitInfo;
    // This is a hack so that digital wires can draw on/off when being wired
    customWiringToolColor?: (originPort: AnyPort) => string;
}
export function GetRenderFunc({ canvas, info, customWiringToolColor }: Info) {
    const renderer = new Renderer(canvas);

    return function render({ useGrid }: RenderOptions = { useGrid: true }) {
        renderer.clear();

        if (useGrid)
            GridRenderer.render(renderer, info);

        info.viewManager.render({
            ...info,
            renderer,
        });

        ToolRenderer.render(renderer, info, customWiringToolColor);

        DebugRenderer.render(renderer, info);
    }
}
