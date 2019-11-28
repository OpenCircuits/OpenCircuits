import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {XMLNode} from "core/utils/io/xml/XMLNode";

import {InputPort} from "../../ports/InputPort";
import {Positioner} from "core/models/ports/positioners/Positioner"

import {DigitalComponent} from "digital/models/DigitalComponent";
import {serialize} from "core/utils/Serializer";

//
// Latch is an abstract superclass for general latches.
//
export abstract class Latch extends DigitalComponent {
    @serialize
    protected clock: boolean = false;

    @serialize
    protected state: boolean = false;

    protected constructor(numInputs: number, inputPositioner?: Positioner<InputPort>) {
        super(new ClampedValue(numInputs), new ClampedValue(2), V(70, 70), inputPositioner);

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
