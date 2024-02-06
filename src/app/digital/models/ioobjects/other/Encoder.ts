import {serializable} from "serialeazy";

import {V} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {ConstantSpacePositioner} from "core/models/ports/positioners/ConstantSpacePositioner";

import {DigitalComponent} from "digital/models/DigitalComponent";

import {InputPort}  from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";


@serializable("Encoder")
export class Encoder extends DigitalComponent {

    public constructor() {
        super(new ClampedValue(4,2,Math.pow(2,8)),
              new ClampedValue(2,1,8),
              V(1, 2),
              new ConstantSpacePositioner<InputPort>("left", 1),
              new ConstantSpacePositioner<OutputPort>("right", 1));
        this.updatePortNames();
    }

    private updatePortNames(): void {
        this.inputs.getPorts().forEach((p, i) => {
            if (p.getName() === "")
                p.setName(`I${i}`);
        });
        this.outputs.getPorts().forEach((p, i) => {
            if (p.getName() === "")
                p.setName(`O${i}`);
        });
    }

    public override setOutputPortCount(val: number): void {
        // Update size
        const newSize = V((1 + (val - 1)/20), Math.pow(2, val)/2);
        this.setSize(newSize);

        super.setOutputPortCount(val);

        // Update port names
        this.inputs.updatePortPositions();
        this.outputs.updatePortPositions();
        this.updatePortNames();
    }

    public override activate(): void {
        // Filter ports that are on then map to their indices
        const onPorts = this.getInputPorts().filter((p) => p.getIsOn());
        if (onPorts.length !== 1)
            return; // Undefined behavior

        // Get index of which port is on
        const index = this.getInputPorts().indexOf(onPorts[0]);

        // Convert index to list of bits in binary
        const bits = [...index.toString(2).padStart(this.outputs.length, "0")].reverse();
        bits.forEach((bit, i) => {
            super.activate(bit === "1", i);
        });
    }

    public getDisplayName(): string {
        return "Encoder";
    }
}
