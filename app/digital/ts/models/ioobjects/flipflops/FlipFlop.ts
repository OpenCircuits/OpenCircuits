import {Vector} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {XMLNode} from "core/utils/io/xml/XMLNode";

import {InputPort} from "../../ports/InputPort";
import {Positioner} from "core/models/ports/positioners/Positioner";

import {DigitalComponent} from "digital/models/DigitalComponent";

//
// FlipFlop is an abstract superclass for general flip flops.
//
export abstract class FlipFlop extends DigitalComponent {
    protected clock: boolean = false;
    protected state: boolean = false;
    protected lastClock: boolean = false;

    public constructor(numInputs: number, size: Vector, inputPositioner?: Positioner<InputPort>) {
        super(new ClampedValue(numInputs), new ClampedValue(2), size, inputPositioner);

        this.getOutputPort(0).setName("Q'");
        this.getOutputPort(1).setName("Q ");
    }

    public save(node: XMLNode): void {
        super.save(node);

        node.addAttribute("inputs", this.numInputs());
        node.addAttribute("outputs", this.numOutputs());
    }

    public load(node: XMLNode): void {
        super.load(node);

        this.setInputPortCount(node.getIntAttribute("inputs"));
        this.setOutputPortCount(node.getIntAttribute("outputs"));
    }
}
