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


function hash(str: string, digits?: number) {
    digits = digits ?? 8;
    const m = Math.pow(10, digits+1) - 1;
    const phi = Math.pow(10, digits) / 2 - 1;
    let n = 0;
    for (let i = 0; i < str.length; i++) {
        n = (n + phi * str.charCodeAt(i)) % m;
    }
    return n;
}

const randomColor = (() => {
    const Rand = (seed: number) => {
        let _seed = seed % 2147483647;
        if (_seed <= 0) _seed += 2147483646;

        const nextFloat = () => {
            const next = _seed * 16807 % 2147483647;
            _seed = next;
            return (next - 1) / 2147483646
        };

        return {
            randInt(min: number, max: number) {
                return Math.floor(nextFloat() * (max - min + 1)) + min;
            }
        }
    };

    return (hash: number) => {
        const r = Rand(hash ?? Math.floor(Math.random() * 2147483647));
        const h = r.randInt(0, 360);
        const s = r.randInt(42, 98);
        const l = r.randInt(40, 90);
        return `hsl(${h},${s}%,${l}%)`;
    };
})();


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
            const allData = info.sim.getVecs(curPlot).map(p => p.data.map(d => -d));
            if (!allData || Object.entries(allData).length === 0)
                return;

            // Calculate offset to account for border/line widths
            const offset = (GRAPH_LINE_WIDTH + DEFAULT_BORDER_WIDTH)/2;

            // Find value range
            const [minVal, maxVal] = Object.values(allData).reduce<[number, number]>(
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

            Object.entries(allData).forEach(([key, data]) => {
                // Calculate y-scale with 0.05 padding on top/bottom
                const yscale = size.y * 0.9 / (maxVal - minVal);

                // Calculate the positions for each signal
                const dx = (size.x - 2*offset)/(data.length - 1);
                const positions = data.map((s, i) => V(
                    -size.x/2 + offset + offset + i*dx, // x-position: linear space
                     (s - (minVal + maxVal)/2) * yscale // y-position: based on signal value
                ));

                const color = randomColor(hash(key));

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
