import {V, Vector} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";
import {XMLNode} from "../../../utils/io/xml/XMLNode";
import {Component} from "../Component";

//
// Latch is an abstract superclass for general latches.
//
export abstract class Latch extends Component {
	protected clock: boolean = false;
	protected state: boolean = false;
	protected set: boolean = false;

	constructor(numInputs: number) {
		super(new ClampedValue(numInputs), new ClampedValue(2), V(60, 60));
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

	public getImageName() {
		return "";
	}
}
