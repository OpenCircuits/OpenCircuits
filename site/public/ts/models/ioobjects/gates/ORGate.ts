import {DEFAULT_BORDER_WIDTH} from "../../../utils/Constants";

import {V} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";
import {Gate} from "./Gate";

import {Port} from "../Port";
import {OutputPort} from "../OutputPort";

export class ORGate extends Gate {

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

        for (let i = 0; i < arr.length; i++) {
            let port = arr[i];
			let t = ((port.getOriginPos().y) / this.getSize().y + 0.5) % 1.0;
			if (t < 0) t += 1.0;

			// @TODO move to a MathUtils QuadCurve function or something
			let s = this.getSize().x/2 - DEFAULT_BORDER_WIDTH;
			let l = this.getSize().x/5 - DEFAULT_BORDER_WIDTH;
			let t2 = 1 - t;

			// Calculate x position along quadratic curve
			let x = (t2*t2)*(-s) + 2*t*(t2)*(-l) + (t*t)*(-s);
            port.setOriginPos(V(x, port.getOriginPos().y));
        }
    }

	// @Override
	public activate() {
		var on = false;
		for (var i = 0; i < this.inputs.length; i++)
			on = (on || this.inputs[i].getIsOn());
		super.activate(on);
	}

	public getDisplayName() {
		return this.not ? "NOR Gate" : "OR Gate";
	}

	public getImageName() {
		return "or.svg";
	}

    public getXMLName(): string {
        return "or";
    }
}
