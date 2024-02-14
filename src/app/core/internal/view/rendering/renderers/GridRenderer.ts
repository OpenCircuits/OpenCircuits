import {Rect}        from "math/Rect";
import {V, Vector}   from "Vector";
import {RenderState} from "../RenderState";


export function RenderGrid({ camera, renderer, options }: RenderState) {
    const step = options.gridSize;

    const size = renderer.size;

    const bounds = Rect.FromPoints(
        Vector.Ceil(size.scale(camera.zoom/2).sub(camera.x, camera.y)).scale(-1),
        Vector.Ceil(size.scale(camera.zoom/2).add(camera.x, camera.y)),
    );

    // Batch-render the lines = uglier code + way better performance
    renderer.save();
    renderer.setStyle(options.gridStyle);
    renderer.beginPath();
    for (let x = bounds.left; x <= bounds.right; x += step)
        renderer.pathLine(V(x, bounds.bottom), V(x, bounds.top));
    for (let y = bounds.bottom; y <= bounds.top; y += step)
        renderer.pathLine(V(bounds.left, y), V(bounds.right, y));
    renderer.closePath();
    renderer.stroke();
    renderer.restore();
}
