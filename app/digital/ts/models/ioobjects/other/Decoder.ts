import {DEFAULT_SIZE} from "core/utils/Constants";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {XMLNode}      from "core/utils/io/xml/XMLNode";

import {ConstantSpacePositioner} from "core/models/ports/positioners/ConstantSpacePositioner";
import {InputPort} from "../../ports/InputPort";
import {OutputPort} from "../../ports/OutputPort";

import {DigitalComponent} from "digital/models/DigitalComponent";

export class Decoder extends DigitalComponent {

    public constructor() {
        super(new ClampedValue(2,1,8),
              new ClampedValue(4,2,Math.pow(2,8)),
              V(DEFAULT_SIZE, DEFAULT_SIZE*2),
              new ConstantSpacePositioner<InputPort>(DEFAULT_SIZE/2),
              new ConstantSpacePositioner<OutputPort>(DEFAULT_SIZE/2));
    }

    public activate(): void {
        let num = 0;
        for (let i = 0; i < this.inputs.length; i++)
            num = num | ((this.inputs.get(i).getIsOn() ? 1 : 0) << i);

        // Turn everything off except i === num
        for (let i = 0; i < this.outputs.length; i++)
            super.activate(i === num, i);
    }

    public setInputPortCount(val: number): void {
        this.transform.setSize(V(DEFAULT_SIZE, DEFAULT_SIZE/2*Math.pow(2, val)));
        super.setInputPortCount(val);
        super.setOutputPortCount(Math.pow(2, val));
    }

    public getDisplayName(): string {
        return "Decoder";
    }

    public getXMLName(): string {
        return "decoder";
    }

    // @Override
    public save(node: XMLNode): void {
        super.save(node);
        node.addAttribute("inputs",this.numInputs());
    }

    // @Override
    public load(node: XMLNode): void {
        super.load(node);
        this.setInputPortCount(node.getIntAttribute("inputs"))
    }

}
