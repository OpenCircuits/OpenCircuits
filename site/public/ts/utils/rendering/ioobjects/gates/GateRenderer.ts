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

export const GateRenderer = (function() {

    const drawQuadCurve = function(renderer: Renderer, dx: number, size: Vector, inputs: number, borderCol: string): void {
        const amt = 2 * Math.floor(inputs / 4) + 1;
        for (let i = 0; i < amt; i++) {
            const d = (i - Math.floor(amt/2)) * size.y;
            const h = DEFAULT_BORDER_WIDTH;
            const l1 = -size.y/2;
            const l2 = +size.y/2;

            const s = size.x/2 - h;
            const l = size.x/5 - h;

            const p1 = V(-s, l1 + d);
            const p2 = V(-s, l2 + d);
            const c  = V(-l, d);

            renderer.quadCurve(p1.x+dx, p1.y, p2.x+dx, p2.y, c.x+dx, c.y, borderCol, DEFAULT_BORDER_WIDTH);
        }
    }

    return {
        render(renderer: Renderer, camera: Camera, gate: Gate, selected: boolean) {
            let transform = gate.getTransform();

            var fillCol = (selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR);
            var borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);

            if (gate.isNot()) {
                let l = transform.getSize().x/2 + 5;
                renderer.circle(l, 0, GATE_NOT_CIRCLE_RADIUS, fillCol, borderCol, DEFAULT_BORDER_WIDTH);
            }

            if (gate instanceof ANDGate) {
                // Draw line to visually match input ports
                const l1 = -(transform.getSize().y/2)*(0.5-gate.getInputPortCount()/2);
                const l2 = -(transform.getSize().y/2)*(gate.getInputPortCount()/2-0.5);

                const s = (transform.getSize().x-DEFAULT_BORDER_WIDTH)/2;
                const p1 = V(-s, l1);
                const p2 = V(-s, l2);

                renderer.line(p1.x, p1.y, p2.x, p2.y, borderCol, DEFAULT_BORDER_WIDTH);
            }
            else if (gate instanceof ORGate) {
                // Draw curve to visually match input ports
                drawQuadCurve(renderer, 0, transform.getSize(), gate.getInputPortCount(), borderCol);
            }
            else if (gate instanceof XORGate) {
                // Draw curves to visually match input ports
                drawQuadCurve(renderer, 0, transform.getSize(), gate.getInputPortCount(), borderCol);
                drawQuadCurve(renderer, -12, transform.getSize(), gate.getInputPortCount(), borderCol);
            }


        }
    };
})();
