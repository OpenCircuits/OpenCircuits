import {DEFAULT_SIZE} from "../../../utils/Constants";

import {V} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";

import {ConstantSpacePositioner} from "../../ports/positioners/ConstantSpacePositioner";
import {InputPort} from "../../ports/InputPort";
import {OutputPort} from "../../ports/OutputPort";

import {Component} from "../Component";

export class Encoder extends Component {

    public constructor() {
        super(new ClampedValue(4,2,Math.pow(2,8)),
              new ClampedValue(2,1,8),
              V(DEFAULT_SIZE, DEFAULT_SIZE*2),
              new ConstantSpacePositioner<InputPort>(DEFAULT_SIZE/2),
              new ConstantSpacePositioner<OutputPort>(DEFAULT_SIZE/2));
    }

    public activate(): void {
        // Filter ports that are on then map to their indices
        const onPorts = this.getInputPorts().filter((p) => p.getIsOn()).map((p, i) => i);
        if (onPorts.length != 1)
            return; // Undefined behavior

        let index = onPorts[0];
        for (let i = this.outputs.length-1; i >= 0; i--) {
            const num = 1 << i;
            const activate = (num <= index);

            super.activate(activate, i);
            if (activate)
                index -= num;
        }
    }

    public setInputPortCount(val: number) {
        this.transform.setSize(V(DEFAULT_SIZE, DEFAULT_SIZE/2*Math.pow(2, val)));
        super.setInputPortCount(Math.pow(2, val));
        super.setOutputPortCount(val);
    }

    public getDisplayName(): string {
        return "Encoder";
    }

    public getXMLName() {
        return "encoder";
    }

}
