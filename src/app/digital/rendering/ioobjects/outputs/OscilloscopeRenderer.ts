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

import {Oscilloscope} from "digital/models/ioobjects";


export const OscilloscopeRenderer = (() => {
    return {
        render(renderer: Renderer, _: Camera, o: Oscilloscope, selected: boolean): void {
            const transform = o.getTransform();
            const size = transform.getSize();

            const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
            const fillCol   = (selected ? SELECTED_FILL_COLOR   : "#ffffff");
            const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);

            renderer.draw(new Rectangle(V(), size), style);

            // Draw signals graphs
            renderer.save();
            renderer.setStyle(new Style(undefined, DEFAULT_ON_COLOR, GRAPH_LINE_WIDTH));
            renderer.setPathStyle({ lineCap: "square" })
            renderer.beginPath();

            const allSignals = o.getSignals();
            for (let i = 0; i < allSignals.length; i++) {
                const signals = allSignals[i].slice(0, o.getNumSamples());

                // Get y-offset for i'th graph
                const dy = -size.y/2 + (i + 0.5)*o.getDisplaySize().y;

                if (signals.length <= 1)
                    continue;

                // Calculate offset to account for border/line widths
                const offset = (GRAPH_LINE_WIDTH + DEFAULT_BORDER_WIDTH)/2;

                // Calculate the positions for each signal
                const dx = (size.x - 2*offset)/(o.getNumSamples() - 1);
                const positions = signals.map((s, i) => V(
                    -o.getDisplaySize().x/2 + offset + i*dx,     // x-position: linear space
                    o.getDisplaySize().y * (s ? -1/3 : 1/3) + dy // y-position: based on signal value
                ));

                // Draw the graph
                renderer.moveTo(positions[0]);
                for (let s = 0; s < signals.length-1; s++) {
                    // Draws a vertical line so that the jump looks better
                    //  from 0 -> 1 or 1 -> 0
                    if (s > 0 && signals[s-1] !== signals[s])
                        renderer.lineWith(positions[s]);
                    renderer.lineWith(positions[s].add(dx, 0));
                }
            }

            renderer.closePath();
            renderer.stroke();
            renderer.restore();
        }
    };
})();
