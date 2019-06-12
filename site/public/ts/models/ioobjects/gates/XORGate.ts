import {DEFAULT_BORDER_WIDTH} from "../../../utils/Constants";

import {V} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";
import {Gate} from "./Gate";

import {Port} from "../../ports/Port";
import {OutputPort} from "../../ports/OutputPort";

export class XORGate extends Gate {

	constructor(not: boolean = false) {
		super(not, new ClampedValue(2,2,8), V(60, 50));
	}

	/**
     * Port positiong for XOR gate along the quadratic curves
     *
     * @param arr The array of ports (either in or out ports)
     */
    protected updatePortPositions(arr: Array<Port>): void {
		super.updatePortPositions(arr);

		// If output ports then ignore curve behavior
		if (arr.length > 0 && arr[0] instanceof OutputPort)
			return;

        for (const port of arr) {
			let t = ((port.getOriginPos().y) / this.getSize().y + 0.5) % 1.0;
			if (t < 0) t += 1.0;

			// @TODO move to a MathUtils QuadCurve function or something
			const s = this.getSize().x/2 - DEFAULT_BORDER_WIDTH;
			const l = this.getSize().x/5 - DEFAULT_BORDER_WIDTH;
			const t2 = 1 - t;

			// Calculate x position along quadratic curve
			const x = (t2*t2)*(-s) + 2*t*(t2)*(-l) + (t*t)*(-s);
            port.setOriginPos(V(x, port.getOriginPos().y));
        }
    }

	// @Override
	public activate() {
		let on = false;
		for (const input of this.getInputPorts())
			on = (on !== input.getIsOn());
		super.activate(on);
	}

	public getDisplayName() {
		return this.not ? "XNOR Gate" : "XOR Gate";
	}

	public getImageName() {
		return "or.svg";
	}

    public getXMLName(): string {
        return "xor";
    }
}
