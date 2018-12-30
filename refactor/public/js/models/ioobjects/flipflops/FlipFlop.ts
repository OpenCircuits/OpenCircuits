import {Vector} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";
import {Component} from "../Component";

//
// FlipFlop is an abstract superclass for general flip flops.
//
export abstract class FlipFlop extends Component {
	protected clock: boolean = false;
	protected state: boolean = false;
	protected last_clock: boolean = false;

    constructor(numInputs: number, numOutputs: number, size: Vector) {
        super(new ClampedValue(numInputs), new ClampedValue(numOutputs), size);
    }

}
