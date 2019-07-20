import {DEFAULT_BORDER_WIDTH,
        DEFAULT_BORDER_COLOR,
        DEFAULT_FILL_COLOR,
        SELECTED_BORDER_COLOR,
        SELECTED_FILL_COLOR,
        GATE_NOT_CIRCLE_RADIUS} from "../../../Constants";
import {Vector,V} from "../../../math/Vector";

import {Renderer} from "../../Renderer";
import {Camera} from "../../../Camera";

import {Gate} from "../../../../models/ioobjects/gates/Gate";
import {ANDGate} from "../../../../models/ioobjects/gates/ANDGate";
import {ORGate} from "../../../../models/ioobjects/gates/ORGate";
import {XORGate} from "../../../../models/ioobjects/gates/XORGate";

import {Circle} from "../../shapes/Circle";
import {Line} from "../../shapes/Line";
import {QuadCurve} from "../../shapes/QuadCurve";
import {Style} from "../../Style";

export const GateRenderer = (() => {

    const drawQuadCurve = function(renderer: Renderer, dx: number, size: Vector, inputs: number, borderCol: string): void {
        const style = new Style(undefined, borderCol, DEFAULT_BORDER_WIDTH);

        const amt = 2 * Math.floor(inputs / 4) + 1;
        for (let i = 0; i < amt; i++) {
            const d = (i - Math.floor(amt/2)) * size.y;
            const h = DEFAULT_BORDER_WIDTH;
            const l1 = -size.y/2;
            const l2 = +size.y/2;

            const s = size.x/2 - h;
            const l = size.x/5 - h;

            const p1 = V(-s + dx, l1 + d);
            const p2 = V(-s + dx, l2 + d);
            const c  = V(-l + dx, d);

            renderer.draw(new QuadCurve(p1, p2, c), style);
        }
    }

    const drawANDLines = function(renderer: Renderer, size: Vector, inputs: number, borderCol: string): void {
        const style = new Style(undefined, borderCol, DEFAULT_BORDER_WIDTH);

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

            if (gate.isNot()) {
                const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);
                const l = transform.getSize().x/2 + 5;
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
                drawQuadCurve(renderer, 0, transform.getSize(), gate.numInputs(), borderCol);
                drawQuadCurve(renderer, -12, transform.getSize(), gate.numInputs(), borderCol);
            }


        }
    };
})();
