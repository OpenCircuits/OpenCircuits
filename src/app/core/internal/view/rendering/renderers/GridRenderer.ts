import {V, Vector} from "Vector";
import {RenderState} from "../RenderState";


export function RenderGrid({ camera, renderer, options }: RenderState) {
    const step = options.gridSize;

    const size = Vector.Ceil(renderer.size.scale(camera.zoom * step / 2)).add(1);
    const offset = Vector.Floor(camera.pos.scale(1 / step)).scale(step);

    // Batch-render the lines = uglier code + way better performance
    renderer.save();
    renderer.toWorldSpace();
    renderer.setStyle(options.gridStyle);
    renderer.beginPath();
    for (let x = -size.x; x <= size.x; x += step) {
        renderer.pathLine(
            V(x, -size.y).add(offset),
            V(x,  size.y).add(offset)
        );
    }
    for (let y = -size.y; y <= size.y; y += step) {
        renderer.pathLine(
            V(-size.x, y).add(offset),
            V( size.x, y).add(offset)
        );
    }
    renderer.closePath();
    renderer.stroke();
    renderer.restore();
}
