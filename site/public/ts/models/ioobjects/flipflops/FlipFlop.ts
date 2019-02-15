import {Vector} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";
import {XMLNode} from "../../../utils/io/xml/XMLNode";
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
		this.getOutputPort(0).setName("Q'");
		this.getOutputPort(1).setName("Q ");
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
