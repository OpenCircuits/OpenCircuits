import {Vector,V} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";
import {XMLNode} from "../../../utils/io/xml/XMLNode";
import {Component} from "../Component";
import {Port} from "../../ports/Port";
import {InputPort} from "../../ports/InputPort";

//
// FlipFlop is an abstract superclass for general flip flops.
//
export abstract class FlipFlop extends Component {
	protected clock: boolean = false;
	protected state: boolean = false;
	protected last_clock: boolean = false;

	public constructor(numInputs: number, size: Vector) {
		super(new ClampedValue(numInputs), new ClampedValue(2), size);
		this.getOutputPort(0).setName("Q'");
		this.getOutputPort(1).setName("Q ");
	}

	protected updatePortPositions(arr: Array<Port>): void {
		super.updatePortPositions(arr);

		// Positioning for JK and SR flip flops
		if (arr.length == 3) {
			{
				let port = arr[0];
				let l = (-this.transform.getSize().y/2*(0 - arr.length/2 + 0.5) - 1) * 3/4;
				port.setOriginPos(V(port.getOriginPos().x, l));
				port.setTargetPos(V(port.getTargetPos().x, l));
			}
			{
				let port = arr[2];
				let l = (-this.transform.getSize().y/2*(2 - arr.length/2 + 0.5) + 1) * 3/4;
				port.setOriginPos(V(port.getOriginPos().x, l));
				port.setTargetPos(V(port.getTargetPos().x, l));
			}
		}
	}

	public save(node: XMLNode): void {
		super.save(node);

		node.addAttribute("inputs", this.getInputPortCount());
		node.addAttribute("outputs", this.getOutputPortCount());
	}

	public load(node: XMLNode): void {
		super.load(node);

		this.setInputPortCount(node.getIntAttribute("inputs"));
		this.setOutputPortCount(node.getIntAttribute("outputs"));
	}
}
