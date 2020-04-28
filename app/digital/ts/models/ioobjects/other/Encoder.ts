import {DEFAULT_SIZE} from "core/utils/Constants";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {serializable} from "serialeazy";

import {ConstantSpacePositioner} from "core/models/ports/positioners/ConstantSpacePositioner";

import {DigitalComponent} from "digital/models/DigitalComponent";
import {InputPort} from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";

@serializable("Encoder")
export class Encoder extends DigitalComponent {

    public constructor() {
        super(new ClampedValue(4,2,Math.pow(2,8)),
              new ClampedValue(2,1,8),
              V(DEFAULT_SIZE, DEFAULT_SIZE*2),
              new ConstantSpacePositioner<InputPort>(DEFAULT_SIZE/2),
              new ConstantSpacePositioner<OutputPort>(DEFAULT_SIZE/2));
        this.setBinaryLabels();
    }

    public activate(): void {
        // Filter ports that are on then map to their indices
        const onPorts = this.getInputPorts().filter((p) => p.getIsOn());
        if (onPorts.length != 1)
            return; // Undefined behavior

        // Get index of which port is on
        const index = this.getInputPorts().indexOf(onPorts[0]);

        // Convert index to list of bits in binary
        const bits = index.toString(2).padStart(this.outputs.length, "0").split("").reverse();
        bits.forEach((bit, i) => {
            super.activate(bit == "1", i);
        });
    }

    public setOutputPortCount(val: number): void {
        // Calculate width using an approximation of the text with of a single "0" = 8.342285
        const padding = 8;
        const width = Math.max(2 * padding + val * 8.342285, DEFAULT_SIZE);
        this.transform.setSize(V(width, DEFAULT_SIZE/2*Math.pow(2, val)));
        super.setOutputPortCount(val);
        this.setBinaryLabels();
    }

    public getDisplayName(): string {
        return "Encoder";
    }

    public setBinaryLabels(): void {
        const ports = this.getInputPorts();
        const digitCount = Math.log2(ports.length);
        let numStr = "0".repeat(digitCount);

        for (let i = 0; i < Math.pow(2, digitCount); i++) {
            ports[i].setName(numStr);
            numStr = (numStr.substr(0, numStr.lastIndexOf("0")) + "1").padEnd(digitCount, "0");
        }
    }
}
