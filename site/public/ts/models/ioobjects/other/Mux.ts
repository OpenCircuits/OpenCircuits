import {DEFAULT_SIZE} from "../../../utils/Constants";

import {V} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";

import {InputPort} from "../../ports/InputPort";
import {InputPortSet} from "../../ports/PortSets";
import {MuxSelectPositioner} from "../../ports/positioners/MuxSelectPositioner";

import {Component} from "../Component";

export abstract class Mux extends Component {
	protected selects: InputPortSet;

    public constructor(inputPortCount: ClampedValue, outputPortCount: ClampedValue) {
        super(inputPortCount, outputPortCount, V(DEFAULT_SIZE, DEFAULT_SIZE));

        this.selects = new InputPortSet(this, new ClampedValue(2, 1, 8), new MuxSelectPositioner());
    }

    public setSelectPortCount(val: number): void {
		// Calculate size
		const width = Math.max(DEFAULT_SIZE/2*(val-1), DEFAULT_SIZE);
		const height = DEFAULT_SIZE/2*Math.pow(2, val);
		this.transform.setSize(V(width+10, height));

        this.selects.setPortCount(val);
    }

    public getSelectPortCount(): number {
        return this.selects.length;
    }

	// @Override
	public getInputPorts(): Array<InputPort> {
		return super.getInputPorts().concat(this.selects.getPorts());
	}

}
