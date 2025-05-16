import {Rect}      from "math/Rect";
import {Transform} from "math/Transform";

import {PrimRenderer} from "./PrimRenderer";


export function DebugRenderBounds(
    primRenderer: PrimRenderer,
    ctx: CanvasRenderingContext2D,
    bounds: Rect | Transform,
    color: string,
) {
    primRenderer.render(ctx, {
        kind:      "Rectangle",
        transform: (bounds instanceof Transform ? bounds : Transform.FromRect(bounds)),
        style:     {
            fill:   color,
            stroke: {
                color: "#000000",
                size:  0.02,
            },
            alpha: 0.5,
        },
    });
}
