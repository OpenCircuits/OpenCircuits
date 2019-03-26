import {IO_PORT_RADIUS} from "../../../utils/Constants";

import {Vector,V} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";
import {Component} from "../Component";

export class WirePort extends Component {

	public constructor() {
		super(new ClampedValue(1,1,1), new ClampedValue(1,1,1), V(2*IO_PORT_RADIUS, 2*IO_PORT_RADIUS));

		// Set origin = target position so that they overlap and look like 1 dot
		this.inputs [0].setTargetPos(this.inputs [0].getOriginPos());
		this.outputs[0].setTargetPos(this.outputs[0].getOriginPos());
	}

	// @Override
	public activate() {
		super.activate(this.inputs[0].getIsOn());
	}

	public getInputDir(): Vector {
		return this.transform.getMatrix().mul(V(-1, 0)).sub(this.getPos()).normalize();
	}

	public getOutputDir(): Vector {
		return this.transform.getMatrix().mul(V( 1, 0)).sub(this.getPos()).normalize();
	}

	public getDisplayName() {
		return "Port";
	}

	public getXMLName(): string {
		return "port";
	}
}
