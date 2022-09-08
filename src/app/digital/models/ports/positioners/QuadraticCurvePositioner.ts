import {serializable} from "serialeazy";

import {DEFAULT_BORDER_WIDTH} from "core/utils/Constants";

import {V} from "Vector";

import {Positioner} from "core/models/ports/positioners/Positioner";

import {InputPort} from "../InputPort";


@serializable("QuadraticCurvePositioner")
export class QuadraticCurvePositioner extends Positioner<InputPort> {

    public constructor() {
        super("left");
    }

    /**
     * Port positioning for OR/XOR gates along the quadratic curves.
     *
     * @param ports The array of ports (either in or out ports).
     */
    public override updatePortPositions(ports: InputPort[]): void {
        super.updatePortPositions(ports);

        ports.forEach((port) => {
            const parent = port.getParent();

            let t = ((port.getOriginPos().y) / parent.getSize().y + 0.5) % 1;
            if (t < 0)
                t += 1;

            // @TODO move to a MathUtils QuadCurve function or something
            const s = parent.getSize().x/2 - DEFAULT_BORDER_WIDTH;
            const l = parent.getSize().x/5 - DEFAULT_BORDER_WIDTH;
            const t2 = 1 - t;

            // Calculate x position along quadratic curve
            const x = (t2*t2)*(-s) + 2*t*(t2)*(-l) + (t*t)*(-s);
            port.setOriginPos(V(x, port.getOriginPos().y));
        });
    }

}
