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


export const OscilloscopeRenderer = (() => {
    return {
        render(renderer: Renderer, info: AnalogCircuitInfo, o: Oscilloscope, selected: boolean): void {
            const transform = o.getTransform();
            const size = transform.getSize();

            const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
            const fillCol   = (selected ? SELECTED_FILL_COLOR   : "#ffffff");
            const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);

            renderer.draw(new Rectangle(V(), size), style);

            if (!info.sim || !info.sim.hasData())
                return;
            const curPlot = info.sim.getCurPlotID();
            if (!curPlot)
                return;

            const { showAxes, showLegend, vecs } = o.getConfig();

            const enabledVecIDs = (Object.keys(vecs) as Array<`${string}.${string}`>).filter(id => vecs[id].enabled);
            const allData = enabledVecIDs.map(id => info.sim!.getVecData(id));

            if (!allData || Object.entries(allData).length === 0)
                return;

            // Indepdendent axis data is always last element
            const xDataRaw = info.sim!.getVecData(info.sim!.getFullVecIDs()[info.sim!.getFullVecIDs().length-1]);

            // Calculate offset to account for border/line widths
            const offset = (GRAPH_LINE_WIDTH + DEFAULT_BORDER_WIDTH)/2;

            // Get sampled data
            //  - uniform samples of `xData`
            //    (also negate it since y is down in canvas-land)
            const [xData, ...sampledData] = [xDataRaw, ...allData].map((data) => {
                const samples = Math.min(data.length, o.getProp("samples") as number);

                return Array(samples).fill(0)
                    .map((_, i) => -data[Math.floor(i * data.length / samples)]);
            });

            // Find value range
            const minX = xData[0], maxX = xData[xData.length-1];
            const [minVal, maxVal] = sampledData.reduce<[number, number]>(
                ([prevMin, prevMax], cur) =>
                    cur.reduce<[number,number]>(([prevMin, prevMax], cur) => [
                        Math.min(prevMin, cur),
                        Math.max(prevMax, cur),
                    ], [prevMin, prevMax]),
                [Infinity, -Infinity]
            );

            // Calculate scales and offsets
            const scale = V(
                (size.x - 2*offset) / (maxX   - minX),
                 size.y * 0.9       / (maxVal - minVal)
            );
            const dpos = V(
                -(maxX + minX)/2,
                -(minVal + maxVal)/2
            );

            // Draw signals graphs
            renderer.save();
            renderer.setPathStyle({ lineCap: "square" });

            sampledData.forEach((data, i) => {
                // Calculate the positions for each signal
                const positions = data.map((s, i) => V(xData[i], s).add(dpos).scale(scale));

                const color = vecs[enabledVecIDs[i]].color;

                renderer.setStyle(new Style(undefined, color, GRAPH_LINE_WIDTH));
                renderer.beginPath();

                // Draw the graph
                renderer.moveTo(positions[0]);
                for (let s = 0; s < data.length-1; s++)
                    renderer.lineWith(positions[s+1]);

                renderer.closePath();
                renderer.stroke();
            });

            renderer.restore();
        },
    }
})();
