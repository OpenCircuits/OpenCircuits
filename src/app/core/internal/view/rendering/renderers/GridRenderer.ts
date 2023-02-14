import {V} from "Vector";
import {RenderState} from "../RenderState";


export function RenderGrid({ camera, renderer, options }: RenderState) {
    const step = options.gridSize;

    const size = renderer.size.scale(camera.zoom);

    const cpx = size.scale(0.5).x;
    const cpy = size.scale(0.5).y;

    // Batch-render the lines = uglier code + way better performance
    renderer.save();
    renderer.toWorldSpace();
    renderer.setStyle(options.gridStyle);
    renderer.beginPath();
    for (let x = -cpx; x <= cpx + step; x += step)
        renderer.pathLine(V(x, -cpy), V(x, cpy));
    for (let y = -cpy; y <= cpy + step; y += step)
        renderer.pathLine(V(-cpx, y), V(cpx, y));
    renderer.closePath();
    renderer.stroke();
    renderer.restore();
}