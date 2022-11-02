import { GRID_LINE_COLOR } from "core/utils/rendering/Styles";

import { DEFAULT_CURVE_BORDER_WIDTH } from "core/utils/Constants";

import {DEFAULT_BORDER_COLOR,
        DEFAULT_BORDER_WIDTH,
        SELECTED_BORDER_COLOR,
        SELECTED_FILL_COLOR} from "core/utils/Constants";

import {V} from "Vector";

import {linspace, linspaceDX} from "math/MathUtils";
import {Margin, Rect}         from "math/Rect";

import { Renderer } from "core/utils/rendering/Renderer";

import { Style } from "core/utils/rendering/Style";

import { Line } from "core/utils/rendering/shapes/Line";

import { Rectangle } from "core/utils/rendering/shapes/Rectangle";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import { Oscilloscope, AnalogPortGroup } from "core/models/types/analog";

import { AnalogViewInfo } from "../AnalogViewInfo";

import { ComponentView } from "core/views/ComponentView";

import {RenderInfo}    from "core/views/BaseView";


const GRAPH_LINE_WIDTH = 0.02;
const AXIS_LINE_WIDTH = 0.02;
const GRID_LINE_WIDTH = 0.01;

const DISPLAY_PADDING = Margin(0.3, 0.3);

const AXIS_PTS = 5 / 8; // 5 pts / 8 units of size
const AXIS_MARK_FONT_SIZE = 0.25;
const AXIS_LABEL_FONT_SIZE = 0.3;

const AXIS_MARK_LENGTH = 0.16;

const AXIS_MARK_FONT = `lighter ${AXIS_MARK_FONT_SIZE}px arial`;
const AXIS_LABEL_FONT = `lighter ${AXIS_LABEL_FONT_SIZE}px arial`;
const AXIS_TEXT_OFFSET = AXIS_MARK_LENGTH/2 + 0.08;

const AXES_INFO_MARGIN = Margin(
    0.24 + AXIS_LABEL_FONT_SIZE*2 + AXIS_MARK_FONT_SIZE,
    0,
    0.24 + AXIS_LABEL_FONT_SIZE + AXIS_MARK_FONT_SIZE,
    0,
);
const AXES_MARGIN = Margin(
    AXIS_MARK_LENGTH/2 + 0.08,
    0.2,
    AXIS_MARK_LENGTH/2 + 0.08,
    0.2,
);


const GRID_PTS = 2; // (N+1) grid points / 1 axis pt

const LEGEND_AREA = 2;
const LEGEND_PADDING = Margin(0.2, 0.2, 0, 0);
const LEGEND_TITLE_FONT_SIZE = 0.3;
const LEGEND_ENTRY_FONT_SIZE = 0.2;
const LEGEND_TITLE_FONT = `normal ${LEGEND_TITLE_FONT_SIZE}px arial`;
const LEGEND_ENTRY_FONT = `lighter ${LEGEND_ENTRY_FONT_SIZE}px arial`;


function toShape(rect: Rect): Rectangle {
    return new Rectangle(rect.center, rect.size);
}

export type ScopeConfig = {
    showAxes: boolean;
    showLegend: boolean;
    showGrid: boolean;
    vecs: Record<`${string}.${string}`, {
        enabled: boolean;
        color: string;
    }>;
}
export type ScopeProp = {
    //nothing
}
// export class OscilloscopeView extends ComponentView<Oscilloscope, AnalogViewInfo> {
//     public constructor(info: AnalogViewInfo, obj: Oscilloscope) {
//         super(info, obj, V(1, 1), "oscilloscope.svg");
//     }

//     protected override renderComponent({ renderer, selections }: RenderInfo): void {
//         const selected = selections.has(this.obj.id);

//         const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);

//         const style = new Style(undefined, borderCol, DEFAULT_CURVE_BORDER_WIDTH);

//         // Get size of model
//         const size = this.transform.get().getSize();

//         // Get current number of inputs
//         const inputs = this.circuit.getPortsFor(this.obj)
//             .filter((p) => p.group === AnalogPortGroup.Input).length;

//         // Draw line to visually match input ports
//         const l1 = -(inputs-1)/2*(0.5 - DEFAULT_BORDER_WIDTH/2) - DEFAULT_BORDER_WIDTH/2;
//         const l2 =  (inputs-1)/2*(0.5 - DEFAULT_BORDER_WIDTH/2) + DEFAULT_BORDER_WIDTH/2;

//         const s = (size.x-DEFAULT_BORDER_WIDTH)/2;
//         const p1 = V(-s, l1);
//         const p2 = V(-s, l2);

//         renderer.draw(new Line(p1, p2), style);
//     }

//     public override getBounds(): Rect {
//         // Get current number of inputs
//         const inputs = this.circuit.getPortsFor(this.obj)
//             .filter((p) => p.group === AnalogPortGroup.Input).length;
//         return super.getBounds().expand(V(0, ((inputs-1)/2*(0.5 - DEFAULT_BORDER_WIDTH/2) + DEFAULT_BORDER_WIDTH/2)));
//     }
// }

export class OscilloscopeView extends ComponentView<Oscilloscope, AnalogViewInfo> {
    private config: ScopeConfig;
    private prop: ScopeProp;
    public constructor(info: AnalogViewInfo, obj: Oscilloscope) {
        super(info, obj, V(1, 1), "oscilloscope.svg");
        this.config = {
            showAxes:   true,
            showLegend: true,
            showGrid:   true,
            vecs:       {},
        };
    }

    public getConfig() {
        return this.config;
    }
    public getProp() {
        return this.prop;
    }
    protected override renderComponent({ renderer, selections }: RenderInfo): void {
        const selected = selections.has(this.obj.id);

        const transform = this.getTransform();
        const size = transform.getSize();
        const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);

        const fillCol = (selected ? SELECTED_FILL_COLOR : "#ffffff");
        const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);

        renderer.draw(new Rectangle(V(), size), style);

        if (!this.info.sim || !this.info.sim.hasData())
            return;
        const curPlot = this.info.sim.getCurPlotID();
        if (!curPlot)
            return;

        const { showAxes, showLegend, showGrid, vecs } = this.getConfig();


        const enabledVecIDs = (Object.keys(vecs) as Array<`${string}.${string}`>).filter((id) => vecs[id].enabled);
        const allData = enabledVecIDs.map((id) => this.info.sim!.getVecData(id));

        if (!allData || Object.entries(allData).length === 0)
            return;

        // Indepdendent axis data is always last element
        const xDataRaw = this.info.sim!.getVecData(this.info.sim!.getFullVecIDs()[this.info.sim!.getFullVecIDs().length - 1]);

        // Get sampled data
        //  - uniform samples of `xData`
        const [xData, ...sampledData] = [xDataRaw, ...allData].map((data) => {
            const samples = Math.min(data.length, this.getProp() as number);

            return new Array(samples).fill(0)
                .map((_, i) => data[Math.floor(i * data.length / samples)]);
        });

        // TODO: Normalize data to best unit

        // Find value range
        const minX = xData[0], maxX = xData.at(-1)!;
        const [minVal, maxVal] = sampledData.reduce<[number, number]>(
            ([prevMin, prevMax], cur) =>
                cur.reduce<[number, number]>(([prevMin, prevMax], cur) => [
                    Math.min(prevMin, cur),
                    Math.max(prevMax, cur),
                ], [prevMin, prevMax]),
            [Infinity, -Infinity]
        );

        // Subdivide area into bounding box rectangles for each segment of the graph display
        //   baseRect    : => Area for entire graph display
        //   innerRect   : => Area for inner display, this essentially pads the entire display with whitespace
        //   axesInfoRect: => Area for all the axes info + labels + grid + plot
        //   axesGridRect: => Area just for axes + grid + plot
        //   plotRect    : => Area just for the plot
        //   legendRect  : => Area for the legend
        const baseRect = new Rect(V(0, 0), size);
        const innerRect = baseRect.subMargin(DISPLAY_PADDING);
        const axesInfoRect = innerRect.subMargin((showLegend ? { right: LEGEND_AREA } : {}));
        const axesGridRect = axesInfoRect.subMargin((showAxes ? AXES_INFO_MARGIN : {}));
        const plotRect = axesGridRect.subMargin((showAxes ? AXES_MARGIN : {}));
        const legendRect = innerRect.subMargin({ left: axesInfoRect.width }).subMargin(LEGEND_PADDING);

        // Debug drawing  FIXING LATER
        // if (this.info.debugOptions.debugSelectionBounds) {
        //     renderer.draw(toShape(baseRect), new Style("#999999", "#000000", 0.02));
        //     renderer.draw(toShape(innerRect), new Style("#ff0000", "#000000", 0.02));
        //     renderer.draw(toShape(axesInfoRect), new Style("#00ff00", "#000000", 0.02));
        //     renderer.draw(toShape(axesGridRect), new Style("#0000ff", "#000000", 0.02));
        //     renderer.draw(toShape(plotRect), new Style("#ff00ff", "#000000", 0.02));
        //     renderer.draw(toShape(legendRect), new Style("#00ffff", "#000000", 0.02));
        // }

        if (showGrid)
            drawGrid(axesGridRect, plotRect);

        if (showAxes)
            drawAxes(axesInfoRect, axesGridRect, plotRect);

        drawGraphs(plotRect);

        if (showLegend)
            drawLegend(legendRect);

        function getMarks(bounds: Rect) {
            const num = V(
                Math.max(0.1, Math.ceil(AXIS_PTS * size.x)),
                Math.max(0.1, Math.ceil(AXIS_PTS * size.y))
            );
            return {
                xs:    linspace(bounds.left, bounds.right, num.x),
                ys:    linspace(bounds.bottom, bounds.top, num.y),
                xVals: linspace(minX, maxX, num.x).map((v) => v.toFixed(2)),
                yVals: linspace(minVal, maxVal, num.y).map((v) => v.toFixed(2)),
            }
        }

        function drawGrid(bounds: Rect, innerBounds: Rect) {
            renderer.save();
            renderer.setPathStyle({ lineCap: "square" });
            renderer.setStyle(new Style(undefined, GRID_LINE_COLOR, GRID_LINE_WIDTH), 0.5);
            const marks = getMarks(innerBounds);

            // We want to evenly space the grid such that it hits each axis-mark
            //  and then has `GRID_PTS` number of lines in between each axis-mark
            const dx = (marks.xs[1] - marks.xs[0]) / (GRID_PTS + 1);
            const dy = (marks.ys[1] - marks.ys[0]) / (GRID_PTS + 1);

            const xGridPts = linspaceDX(innerBounds.left, bounds.right, dx);
            const yGridPts = linspaceDX(innerBounds.bottom, bounds.top, dy);

            renderer.strokeVLines(xGridPts, bounds.bottom, bounds.height, "bottom");
            renderer.strokeHLines(yGridPts, bounds.left, bounds.width, "left");

            renderer.restore();
        }

        function drawAxes(outerBounds: Rect, bounds: Rect, innerBounds: Rect) {
            renderer.save();
            renderer.setPathStyle({ lineCap: "square" });
            renderer.setStyle(new Style(undefined, "#000000", AXIS_LINE_WIDTH));

            // Draw each axis
            renderer.strokePath([bounds.topLeft, bounds.bottomLeft, bounds.bottomRight]);

            const marks = getMarks(innerBounds);

            // Create and draw marks on the axes
            renderer.strokeVLines(marks.xs, bounds.bottom, AXIS_MARK_LENGTH, "middle");
            renderer.strokeHLines(marks.ys, bounds.left, AXIS_MARK_LENGTH, "center");

            // Draw axis mark text
            marks.xVals.forEach((text, i) => {
                const pos = V(marks.xs[i], bounds.bottom - AXIS_TEXT_OFFSET);
                renderer.text(text, pos, "center", "#000000", AXIS_MARK_FONT, "top");
            });
            marks.yVals.forEach((text, i) => {
                const pos = V(bounds.left - AXIS_TEXT_OFFSET, marks.ys[i]);
                renderer.text(text, pos, "right", "#000000", AXIS_MARK_FONT, "middle");
            });

            // Label axes
            const xLabelPos = V(innerBounds.x, outerBounds.bottom);
            const yLabelPos = V(outerBounds.left, innerBounds.y);
            renderer.text("time (s)", xLabelPos, "center", "#000000", AXIS_LABEL_FONT, "bottom");
            renderer.text("Voltage (V)", yLabelPos, "center", "#000000", AXIS_LABEL_FONT, "top", -Math.PI / 2);

            renderer.restore();
        }

        function drawLegend(bounds: Rect) {
            renderer.save();

            renderer.text("Legend", V(bounds.left, bounds.top), "left", "#000000", LEGEND_TITLE_FONT, "top");

            const boxSize = 0.2;
            enabledVecIDs.forEach((id, i) => {
                const color = vecs[id].color;
                const y = bounds.top - i * (boxSize + 0.1) - 0.7;

                // Draw box
                const box = Rect.From({
                    left:   bounds.left,
                    right:  bounds.left + boxSize,
                    bottom: y,
                    top:    y + boxSize,
                }, true);
                renderer.draw(toShape(box), new Style(color), 1);

                // Draw text
                renderer.text(id, V(box.right + 0.1, box.y), "left", "#000000", LEGEND_ENTRY_FONT, "middle");
            });

            renderer.restore();
        }

        function drawGraphs(bounds: Rect) {
            renderer.save();
            renderer.setPathStyle({ lineCap: "round" });

            // Get data bounds as a rectangle
            const dataBounds = Rect.From({ left: minX, right: maxX, bottom: minVal, top: maxVal });

            const scale = V(bounds.width / dataBounds.width, bounds.height / dataBounds.height);

            sampledData.forEach((data, i) => {
                // Calculate position for each data point
                const positions = data.map(
                    (s, i) => V(xData[i], s)
                        .sub(dataBounds.center)
                        .scale(scale)
                        .add(bounds.center)
                );
                const color = vecs[enabledVecIDs[i]].color;

                renderer.setStyle(new Style(undefined, color, GRAPH_LINE_WIDTH));
                renderer.strokePath(positions);
            });

            renderer.restore();
        }

        
    }
};
