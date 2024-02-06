import {DEFAULT_BORDER_COLOR,
        DEFAULT_BORDER_WIDTH,
        DEFAULT_CURVE_BORDER_WIDTH,
        DEFAULT_FILL_COLOR,
        GATE_NOT_CIRCLE_RADIUS,
        SELECTED_BORDER_COLOR,
        SELECTED_FILL_COLOR} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {Camera} from "math/Camera";

import {Renderer} from "core/rendering/Renderer";
import {Style}    from "core/rendering/Style";

import {Circle}    from "core/rendering/shapes/Circle";
import {Line}      from "core/rendering/shapes/Line";
import {QuadCurve} from "core/rendering/shapes/QuadCurve";

import {ANDGate} from "digital/models/ioobjects/gates/ANDGate";
import {Gate}    from "digital/models/ioobjects/gates/Gate";
import {ORGate}  from "digital/models/ioobjects/gates/ORGate";
import {XORGate} from "digital/models/ioobjects/gates/XORGate";

/**
 * Renders Gates using the following steps:
 * - Choose fill and border colour as per selection status
 * - If Not Gate (of any kind), draw not circle
 * - If AND Gate, draw AND gate line to match number of input ports
 * - If OR Gate, draw quad curve(s) to match number of input ports
 * - If XOR Gate, draw double quad curve(s) to match number of input ports.
 */
export const GateRenderer = (() => {

    const drawQuadCurve = function(renderer: Renderer, dx: number, size: Vector,
                                   inputs: number, borderCol: string): void {
        // Border width increased to account for curve not being able to cover small visual clips
        const style = new Style(undefined, borderCol, DEFAULT_CURVE_BORDER_WIDTH);
        const amt = 2 * Math.floor(inputs / 4) + 1;

        // Renders a specialized shorter curve for an xor and xnor gate (dx != 0) when there are 2 or 3 ports (amt == 1)
        const [lNumMod, sMod] = (amt === 1 && dx !== 0) ? ([0.014, 0]) : ([0, 0.012]);
        for (let i = 0; i < amt; i++) {
            const d = (i - Math.floor(amt / 2)) * size.y;
            const h = DEFAULT_BORDER_WIDTH;
            const l1 = -size.y / 2 + lNumMod;
            const l2 = +size.y / 2 - lNumMod;

            const s = size.x / 2 - h + sMod;
            const l = size.x / 5 - h;

            const p1 = V(-s + dx, l1 + d);
            const p2 = V(-s + dx, l2 + d);
            const c = V(-l + dx, d);
            if (amt === 1 && dx !== 0) {
                renderer.draw(new QuadCurve(p1, p2, c), style);
            }
            else if (amt !== 1 || dx !== 0) {
                renderer.save();
                renderer.setPathStyle({ lineCap: "round" });
                renderer.draw(new QuadCurve(p1, p2, c), style);
                renderer.restore();
            }
        }
    }

    const drawANDLines = function(renderer: Renderer, size: Vector, inputs: number, borderCol: string): void {
        const style = new Style(undefined, borderCol, DEFAULT_CURVE_BORDER_WIDTH);

        // Draw line to visually match input ports
        const l1 = -(size.y/2)*(0.5-inputs/2);
        const l2 =  (size.y/2)*(0.5-inputs/2);

        const s = (size.x-DEFAULT_BORDER_WIDTH)/2;
        const p1 = V(-s, l1);
        const p2 = V(-s, l2);

        renderer.draw(new Line(p1, p2), style);
    }

    return {
        render(renderer: Renderer, _: Camera, gate: Gate, selected: boolean): void {
            const transform = gate.getTransform();

            const fillCol = (selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR);
            const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);

            if (gate.getProp("not") === true) {
                const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);
                const l = transform.getSize().x/2 + GATE_NOT_CIRCLE_RADIUS;
                renderer.draw(new Circle(V(l, 0), GATE_NOT_CIRCLE_RADIUS), style);
            }

            if (gate instanceof ANDGate) {
                // Draw AND gate line to match ports
                drawANDLines(renderer, transform.getSize(), gate.numInputs(), borderCol);
            }
            else if (gate instanceof ORGate) {
                // Draw curve to visually match input ports
                drawQuadCurve(renderer, 0, transform.getSize(), gate.numInputs(), borderCol);
            }
            else if (gate instanceof XORGate) {
                // Draw curves to visually match input ports
                drawQuadCurve(renderer,     0, transform.getSize(), gate.numInputs(), borderCol);
                drawQuadCurve(renderer, -0.24, transform.getSize(), gate.numInputs(), borderCol);
            }
        },
    };
})();
