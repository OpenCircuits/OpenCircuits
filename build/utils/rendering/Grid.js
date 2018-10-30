"use strict";

var V = require("../math/Vector").V;
var Renderer = require("./Renderer");
var Camera = require("../Camera");

var GRID_SIZE = 50;

var Grid = function () {

    return {
        render(renderer, camera) {
            var step = GRID_SIZE / camera.zoom;

            var cpos = V(camera.pos.x / camera.zoom - renderer.canvas.width / 2, camera.pos.y / camera.zoom - renderer.canvas.height / 2);

            var cpx = cpos.x - Math.floor(cpos.x / step) * step;
            if (cpx < 0) cpx += step;
            var cpy = cpos.y - Math.floor(cpos.y / step) * step;
            if (cpy < 0) cpy += step;

            // Batch-render the lines = uglier code + way better performance
            renderer.save();
            renderer.setStyles(undefined, '#999', 1 / camera.zoom);
            renderer.context.beginPath();
            for (var x = -cpx; x <= renderer.canvas.width - cpx + step; x += step) {
                renderer._line(x, 0, x, renderer.canvas.height);
            }
            for (var y = -cpy; y <= renderer.canvas.height - cpy + step; y += step) {
                renderer._line(0, y, renderer.canvas.width, y);
            }
            renderer.context.closePath();
            renderer.context.stroke();
            renderer.restore();
        }
    };
}();

module.exports = Grid;