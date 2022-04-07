import {SELECTED_BORDER_COLOR,
        DEFAULT_BORDER_COLOR,
        SELECTED_FILL_COLOR,
        DEFAULT_BORDER_WIDTH,
        DEFAULT_ON_COLOR,
        GRAPH_LINE_WIDTH} from "core/utils/Constants";

import {V} from "Vector";

import {Camera} from "math/Camera";

import {Renderer} from "core/rendering/Renderer";
import {Style} from "core/rendering/Style";
import {Rectangle} from "core/rendering/shapes/Rectangle";

import {Oscilloscope} from "analog/models/eeobjects";


export const OscilloscopeRenderer = (() => {
    return {
        render(renderer: Renderer, _: Camera, o: Oscilloscope, selected: boolean): void {
            const transform = o.getTransform();
            const size = transform.getSize();

            const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
            const fillCol   = (selected ? SELECTED_FILL_COLOR   : "#ffffff");
            const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);

            renderer.draw(new Rectangle(V(), size), style);

            const allData = o.getData();
            if (!allData || Object.entries(allData).length === 0)
                return;

            // Draw signals graphs
            renderer.save();
            renderer.setStyle(new Style(undefined, DEFAULT_ON_COLOR, GRAPH_LINE_WIDTH));
            renderer.setPathStyle({ lineCap: "square" })
            renderer.beginPath();

            // Find value range
            const [minVal, maxVal] = Object.values(allData).reduce<[number, number]>(
                ([prevMin, prevMax], cur) =>
                    cur.reduce<[number,number]>(([prevMin, prevMax], cur) => [
                        Math.min(prevMin, cur),
                        Math.max(prevMax, cur),
                    ], [prevMin, prevMax]),
                [Infinity, -Infinity]
            );

            // Calculate offset to account for border/line widths
            const offset = (GRAPH_LINE_WIDTH + DEFAULT_BORDER_WIDTH)/2;

            Object.entries(allData).forEach(([_, data]) => {
                // Calculate y-scale with 0.05 padding on top/bottom
                const yscale = size.y * 0.9 / (maxVal - minVal);

                // Calculate the positions for each signal
                const dx = (size.x - 2*offset)/(data.length - 1);
                const positions = data.map((s, i) => V(
                    -size.x/2 + offset + offset + i*dx, // x-position: linear space
                     (s - (minVal + maxVal)/2) * yscale // y-position: based on signal value
                ));

                // Draw the graph
                renderer.moveTo(positions[0]);
                for (let s = 0; s < data.length-1; s++)
                    renderer.lineWith(positions[s].add(dx, 0));
            });

            renderer.closePath();
            renderer.stroke();
            renderer.restore();
        },
    }
})();
