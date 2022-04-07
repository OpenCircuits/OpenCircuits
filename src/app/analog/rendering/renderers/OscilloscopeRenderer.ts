import {SELECTED_BORDER_COLOR,
        DEFAULT_BORDER_COLOR,
        SELECTED_FILL_COLOR,
        DEFAULT_BORDER_WIDTH,
        GRAPH_LINE_WIDTH} from "core/utils/Constants";

import {V} from "Vector";

import {Renderer} from "core/rendering/Renderer";
import {Style} from "core/rendering/Style";
import {Rectangle} from "core/rendering/shapes/Rectangle";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";
import {Oscilloscope} from "analog/models/eeobjects";


const selectColor = (val: number) => {
    return `hsl(${val*137.508}, 80%, 75%)`;
}

const selectColor2 = (i: number, numCols: number) => {
    return `hsl(${i*360/numCols}, 80%, 45%)`;
}

export const OscilloscopeRenderer = (() => {
    return {
        render(renderer: Renderer, info: AnalogCircuitInfo, o: Oscilloscope, selected: boolean): void {
            const transform = o.getTransform();
            const size = transform.getSize();

            const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
            const fillCol   = (selected ? SELECTED_FILL_COLOR   : "#ffffff");
            const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);

            renderer.draw(new Rectangle(V(), size), style);

            if (!info.sim)
                return;
            const curPlot = info.sim.getCurPlotID();
            if (!curPlot)
                return;
            const allData = o.getEnabledVecs().map(id => info.sim!.getVecData(id));
            if (!allData || Object.entries(allData).length === 0)
                return;

            // Calculate offset to account for border/line widths
            const offset = (GRAPH_LINE_WIDTH + DEFAULT_BORDER_WIDTH)/2;

            // Get sampled data
            //  - uniformly spaced with `samples` number of points for performance
            //    (also negate it since y is down in canvas-land)
            const sampledData = allData.map((data) => {
                const samples = Math.min(data.length, o.getProp("samples") as number);

                return Array(samples).fill(0)
                    .map((_, i) => -data[Math.floor(i * data.length / samples)]);
            });

            // Find value range
            const [minVal, maxVal] = sampledData.reduce<[number, number]>(
                ([prevMin, prevMax], cur) =>
                    cur.reduce<[number,number]>(([prevMin, prevMax], cur) => [
                        Math.min(prevMin, cur),
                        Math.max(prevMax, cur),
                    ], [prevMin, prevMax]),
                [Infinity, -Infinity]
            );

            // Draw signals graphs
            renderer.save();
            renderer.setPathStyle({ lineCap: "square" });

            sampledData.forEach((data, i) => {
                // Calculate y-scale with 0.05 padding on top/bottom
                const yscale = size.y * 0.9 / (maxVal - minVal);


                // Calculate the positions for each signal
                const dx = (size.x - 2*offset)/(data.length - 1);
                const dy = -(minVal + maxVal)/2;
                const positions = data
                    .map((s, i) => V(
                        -size.x/2 + offset + i*dx, // x-position: linear space
                        (s + dy) * yscale          // y-position: based on signal value
                    ));

                const color = selectColor2(i, sampledData.length);//colors[i];//randomColor(hash(key));

                renderer.setStyle(new Style(undefined, color, GRAPH_LINE_WIDTH));
                renderer.beginPath();

                // Draw the graph
                renderer.moveTo(positions[0]);
                for (let s = 0; s < data.length-1; s++)
                    renderer.lineWith(positions[s].add(dx, 0));

                renderer.closePath();
                renderer.stroke();
            });

            renderer.restore();
        },
    }
})();
