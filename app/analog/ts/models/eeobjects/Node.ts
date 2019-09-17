import {IO_PORT_RADIUS} from "../../utils/Constants";

import {Vector,V}     from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {EEComponent} from "./EEComponent";

export class Node extends EEComponent {


	public constructor() {
		super(new ClampedValue(1,1,40), new ClampedValue(1,1,40), V(2*IO_PORT_RADIUS, 2*IO_PORT_RADIUS));

		// Set origin = target position so that they overlap and look like 1 dot
		this.inputs [0].setTargetPos(this.inputs [0].getOriginPos());
		this.outputs[0].setTargetPos(this.outputs[0].getOriginPos());
	}


	public getInputDir(): Vector {
		return this.transform.getMatrix().mul(V(-1, 0)).sub(this.getPos()).normalize();
	}

	public getOutputDir(): Vector {
		return this.transform.getMatrix().mul(V( 1, 0)).sub(this.getPos()).normalize();
	}

	public getDisplayName() {
		return "Node";
	}

	public getXMLName(): string {
		return "node";
	}
}
