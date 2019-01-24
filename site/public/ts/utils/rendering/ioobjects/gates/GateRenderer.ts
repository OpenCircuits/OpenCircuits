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

// import {Images} from "../../../Images";

// import {ANDGate} from "../../../models/ioobjects/gates/ANDGate";
// import {Switch} from "../../../models/ioobjects/inputs/Switch";
// import {LED} from "../../../models/ioobjects/outputs/LED";

export var GateRenderer = (function() {

    let drawQuadCurve = function(renderer: Renderer, dx: number, size: Vector, inputs: number, borderCol: string): void {
        let amt = 2 * Math.floor(inputs / 4) + 1;
        for (let i = 0; i < amt; i++) {
            let d = (i - Math.floor(amt/2)) * size.y;
            let h = DEFAULT_BORDER_WIDTH;
            let l1 = -size.y/2;
            let l2 = +size.y/2;

            let s = size.x/2 - h;
            let l = size.x/5 - h;

            let p1 = V(-s, l1 + d);
            let p2 = V(-s, l2 + d);
            let c  = V(-l, d);

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
                let l1 = -(transform.getSize().y/2)*(0.5-gate.getInputPortCount()/2);
                let l2 = -(transform.getSize().y/2)*(gate.getInputPortCount()/2-0.5);

                let s = (transform.getSize().x-DEFAULT_BORDER_WIDTH)/2;
                let p1 = V(-s, l1);
                let p2 = V(-s, l2);

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
