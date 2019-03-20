import {Vector,V} from "../../utils/math/Vector";
import {ClampedValue} from "../../utils/ClampedValue";
import {Component} from "./Component";

export class WirePort extends Component {
	constructor(not: boolean = false) {
		super(new ClampedValue(1,1,1), new ClampedValue(1,1,1), V(50, 50));
		//reset the target positions for the input and output
		//offset them by 1 so that the bezier curves will work correctly
		let v = V(this.inputs[0].getOriginPos().x - 1, this.inputs[0].getOriginPos().y);
		this.inputs[0].setTargetPos(v);
		v = V(this.outputs[0].getOriginPos().x + 1, this.outputs[0].getOriginPos().y);
		this.outputs[0].setTargetPos(v);
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
		return "wp";
	}
}
