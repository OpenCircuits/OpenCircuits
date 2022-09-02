

// export class CircuitRenderer {

import {CircuitInfo} from "core/utils/CircuitInfo"

import {Renderer} from "./Renderer"



// }

type RendererInstance<T> = {
    render: (renderer: Renderer, info: CircuitInfo, extra?: T) => void;
}
type RendererInstance2<O, T> = {
    render: (renderer: Renderer, info: CircuitInfo, thing: O, extra?: T) => void;
    renderAll: (renderer: Renderer, info: CircuitInfo, things: O[], extra?: T) => void;
}


// export const CircuitRenderer = <T extends RendererInstance<any, any>[]>(...instances: T) => {

// }

export const CreateRenderers = <A, B1, B2, C1, C2, D, E>(
    renderer: Renderer,
    info: CircuitInfo,
    renderers: {
        gridRenderer: RendererInstance<A>;
        wireRenderer: RendererInstance2<B1, B2>;
        componentRenderer: RendererInstance2<C1, C2>;
        toolRenderer: RendererInstance<D>;
        debugRenderer: RendererInstance<E>;
    }
) => ({
    renderer,
    info,
    Grid: {
        render: (extra?: A) => renderers.gridRenderer.render(renderer, info, extra),
    },
    Wires: {
        render:    (wire:  B1,   extra?: B2) => renderers.wireRenderer.render   (renderer, info, wire,  extra),
        renderAll: (wires: B1[], extra?: B2) => renderers.wireRenderer.renderAll(renderer, info, wires, extra),
    },
    Components: {
        render:    (obj:  C1,   extra?: C2) => renderers.componentRenderer.render   (renderer, info, obj,  extra),
        renderAll: (objs: C1[], extra?: C2) => renderers.componentRenderer.renderAll(renderer, info, objs, extra),
    },
    Tools: {
        render: (extra?: D) => renderers.toolRenderer.render(renderer, info, extra),
    },
    Debug: {
        render: (extra?: E) => renderers.debugRenderer.render(renderer, info, extra),
    },
});


