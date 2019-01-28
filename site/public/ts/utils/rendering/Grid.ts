import {Renderer} from "./Renderer";
import {Camera} from "../Camera";

var GRID_SIZE = 50;

export var Grid = (function() {

    return {
        render(renderer: Renderer, camera: Camera) {
            var step = GRID_SIZE/camera.getZoom();

            var cpos = camera.getPos().scale(1.0/camera.getZoom()).sub(renderer.getSize().scale(0.5));

            var cpx = cpos.x - Math.floor(cpos.x / step) * step;
            if (cpx < 0) cpx += step;
            var cpy = cpos.y - Math.floor(cpos.y / step) * step;
            if (cpy < 0) cpy += step;

            // Batch-render the lines = uglier code + way better performance
            renderer.save();
            renderer.setStyles(undefined, '#999', 1.0 / camera.getZoom());
            renderer.beginPath();
            for (var x = -cpx; x <= renderer.getSize().x-cpx+step; x += step) {
                renderer.pathLine(x, 0, x, renderer.getSize().y);
            }
            for (var y = -cpy; y <= renderer.getSize().y-cpy+step; y += step) {
                renderer.pathLine(0, y, renderer.getSize().x, y);
            }
            renderer.closePath();
            renderer.stroke();
            renderer.restore();
        }
    };
})();
