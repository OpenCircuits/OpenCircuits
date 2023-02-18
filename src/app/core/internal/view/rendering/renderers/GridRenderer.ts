import {V} from "Vector";
import {RenderState} from "../RenderState";


export function RenderGrid({ camera, renderer, options }: RenderState) {
    const step = options.gridSize;

    const size = renderer.size.scale(camera.zoom/2);

    const cpx = Math.ceil(size.x)*step;
    const cpy = Math.ceil(size.y)*step;

    // Batch-render the lines = uglier code + way better performance
    renderer.save();
    renderer.toWorldSpace();
    renderer.setStyle(options.gridStyle);
    renderer.beginPath();
    for (let x = -cpx; x <= cpx; x += step)
        renderer.pathLine(V(x, -cpy), V(x, cpy));
    for (let y = -cpy; y <= cpy; y += step)
        renderer.pathLine(V(-cpx, y), V(cpx, y));
    renderer.closePath();
    renderer.stroke();
    renderer.restore();
}
