import {SELECTED_BORDER_COLOR,
        DEFAULT_BORDER_COLOR,
        SELECTED_FILL_COLOR,
        DEFAULT_BORDER_WIDTH} from "core/utils/Constants";

import {V} from "Vector";

import {Renderer} from "core/rendering/Renderer";
import {Style} from "core/rendering/Style";
import {Rectangle} from "core/rendering/shapes/Rectangle";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";
import {Oscilloscope} from "analog/models/eeobjects";
import {GRID_LINE_COLOR} from "core/rendering/Styles";


const GRAPH_LINE_WIDTH = 1;
const GRAPH_MARGIN = V(15, 15);

const AXIS_MARK_FONT_SIZE = 12;
const AXIS_LABEL_FONT_SIZE = 15;

const AXIS_PTS = 5 / 400; // 5 pts / 400 units of size
const GRID_PTS = 2; // (N+1) grid points / 1 axis pt

const AXIS_MARK_LENGTH = 8;
const AXIS_TEXT_PADDING = 4;
const AXIS_PLOT_PADDING = 4;


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

            const { showAxes, showLegend, showGrid, vecs } = o.getConfig();

            const enabledVecIDs = (Object.keys(vecs) as Array<`${string}.${string}`>).filter(id => vecs[id].enabled);
            const allData = enabledVecIDs.map(id => info.sim!.getVecData(id));

            if (!allData || Object.entries(allData).length === 0)
                return;

            // Indepdendent axis data is always last element
            const xDataRaw = info.sim!.getVecData(info.sim!.getFullVecIDs()[info.sim!.getFullVecIDs().length-1]);

            // Get sampled data
            //  - uniform samples of `xData`
            const [xData, ...sampledData] = [xDataRaw, ...allData].map((data) => {
                const samples = Math.min(data.length, o.getProp("samples") as number);

                return Array(samples).fill(0)
                    .map((_, i) => data[Math.floor(i * data.length / samples)]);
            });

            // TODO: Normalize data to best unit

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
            let offset = { left: 0, right: 0, top: 0, bottom: 0 };
            if (showAxes) {
                offset.left += 20 + AXIS_LABEL_FONT_SIZE*2 + AXIS_MARK_FONT_SIZE;
                offset.bottom += 20 + AXIS_LABEL_FONT_SIZE + AXIS_MARK_FONT_SIZE;
                offset.top += 10;
                offset.right += 10;
            }
            const graphSize = size // Size for graphable area: axes/legend/grid/plot
                // Account for border/stroke-width
                .sub(GRAPH_LINE_WIDTH + DEFAULT_BORDER_WIDTH)
                .sub(GRAPH_MARGIN.scale(2));
            const plotSize = graphSize.sub(
                V(offset.left + offset.right, offset.top + offset.bottom)
            ); // Size for just plot area
            const scale = plotSize.scale(V(1/(maxX - minX), 1/(maxVal - minVal)));
            const dpos = V(maxX + minX, minVal + maxVal).scale(-1/2);
            const plotOffset = V(offset.left - offset.right, offset.bottom - offset.top).scale(V(0.5, -0.5));

            // DEBUG:
            // renderer.draw(new Rectangle(V(), graphSize), new Style(undefined, "#eeeeee", 1));
            // renderer.draw(new Rectangle(plotOffset, plotSize), new Style(undefined, "#ff00ff", 1));

            const numXMarks = Math.max(5, Math.ceil(AXIS_PTS * size.x));
            const numYMarks = Math.max(5, Math.ceil(AXIS_PTS * size.y));

            const axisPadding = AXIS_MARK_LENGTH/2 + AXIS_PLOT_PADDING;
            const axesPositions = [
                V(-graphSize.x/2 + offset.left - axisPadding, -graphSize.y/2),
                V(-graphSize.x/2 + offset.left - axisPadding,  graphSize.y/2 - offset.bottom + axisPadding),
                V( graphSize.x/2,                              graphSize.y/2 - offset.bottom + axisPadding),
            ];
            const x0 = axesPositions[0].x + axisPadding, xf = x0 + plotSize.x;
            const y0 = axesPositions[0].y + offset.top, yf = y0 + plotSize.y;

            // Draw grid
            if (showGrid) {
                renderer.save();
                renderer.setPathStyle({ lineCap: "square" });
                renderer.setStyle(new Style(undefined, GRID_LINE_COLOR, 0.5), 0.5);

                const numGridMarksX = (GRID_PTS + 1) * numXMarks;
                const numGridMarksY = (GRID_PTS + 1) * numYMarks;

                const xGridPts = Array(numGridMarksX).fill(0).map((_, i, arr) => V(
                    x0 + (xf - x0)*i/(arr.length-1),
                    axesPositions[1].y
                ));
                const yGridPts = Array(numGridMarksY).fill(0).map((_, i, arr) => V(
                    axesPositions[0].x,
                    y0 + (yf - y0)*i/(arr.length-1),
                ));

                renderer.beginPath();

                xGridPts.forEach((pt) => {
                    renderer.pathLine(pt, pt.sub(0, plotSize.y + axisPadding + offset.top));
                });
                yGridPts.forEach((pt) => {
                    renderer.pathLine(pt.add(plotSize.x + axisPadding + offset.right, 0), pt);
                });

                renderer.closePath()
                renderer.stroke();

                renderer.restore();
            }


            // Draw axes
            if (showAxes) {
                renderer.save();
                renderer.setPathStyle({ lineCap: "square" });
                renderer.setStyle(new Style(undefined, "#000000", 1));

                renderer.strokePath(axesPositions);

                // Calculate all positions of x/y axis markings
                const xAxisText = Array(numXMarks).fill(0).map((_, i, arr) => ({
                    pos: V(x0 + (xf - x0)/(arr.length-1)*i, axesPositions[1].y),
                    text: (minX + (maxX - minX)*i/(arr.length-1)).toFixed(2),
                }));
                const yAxisText = Array(numYMarks).fill(0).map((_, i, arr) => ({
                    pos: V(axesPositions[0].x, y0 + (yf - y0)/(arr.length-1)*(arr.length-1-i)),
                    text: (minVal + (maxVal - minVal)*i/(arr.length-1)).toFixed(2),
                }));

                // Draw marks on axes
                renderer.beginPath();
                xAxisText.forEach(({ pos }) => {
                    renderer.pathLine(pos.add(0, -AXIS_MARK_LENGTH/2), pos.add(0, AXIS_MARK_LENGTH/2));
                });
                yAxisText.forEach(({ pos }) => {
                    renderer.pathLine(pos.add(-AXIS_MARK_LENGTH/2, 0), pos.add(AXIS_MARK_LENGTH/2, 0));
                });
                renderer.closePath();
                renderer.stroke();

                // Draw text on axes
                const padding = AXIS_MARK_LENGTH/2 + AXIS_TEXT_PADDING;
                const axisMarkFont = `lighter ${AXIS_MARK_FONT_SIZE}px arial`;
                xAxisText.forEach(({ pos, text }) => {
                    renderer.text(text, pos.add(0, padding), "center", "#000000", axisMarkFont, "top");
                });
                yAxisText.forEach(({ pos, text }) => {
                    renderer.text(text, pos.add(-padding, 0), "right", "#000000", axisMarkFont);
                });

                // Label axes
                const axisLabelFont = `lighter ${AXIS_LABEL_FONT_SIZE}px arial`;
                const xLabelPos = V((xf + x0)/2, graphSize.y/2);
                const yLabeLpos = V(-graphSize.x/2, (yf + y0)/2);
                renderer.text("time (s)", xLabelPos, "center", "#000000", axisLabelFont, "bottom");
                renderer.text("Voltage (V)", yLabeLpos, "center", "#000000", axisLabelFont, "top", -Math.PI/2);

                renderer.restore();
            }



            // Draw signals graphs
            renderer.save();
            renderer.setPathStyle({ lineCap: "round" });

            sampledData.forEach((data, i) => {
                // Calculate the positions for each signal
                const positions = data.map(
                    // Negate data-y-value since y is down in canvas-land
                    (s, i) => V(xData[i], minVal + maxVal - s).add(dpos).scale(scale).add(plotOffset),
                );

                const color = vecs[enabledVecIDs[i]].color;

                renderer.setStyle(new Style(undefined, color, GRAPH_LINE_WIDTH));

                renderer.strokePath(positions);
            });

            renderer.restore();
        },
    }
})();
