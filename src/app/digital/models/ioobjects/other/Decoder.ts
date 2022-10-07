import {serializable} from "serialeazy";

import {V} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {ConstantSpacePositioner} from "core/models/ports/positioners/ConstantSpacePositioner";

import {DigitalComponent} from "digital/models/DigitalComponent";

import {InputPort}  from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";


@serializable("Decoder")
export class Decoder extends DigitalComponent {

    public constructor() {
        super(new ClampedValue(2,1,8),
              new ClampedValue(4,2,Math.pow(2,8)),
              V(1, 2),
              new ConstantSpacePositioner<InputPort>("left", 1),
              new ConstantSpacePositioner<OutputPort>("right", 1));

        // activate 0th port for initial state
        super.activate(true, 0);

        this.updatePortNames();
    }

    public updatePortNames(): void {
        this.inputs.getPorts().forEach((p, i) => {
            if (p.getName() === "")
                p.setName(`I${i}`);
        });
        this.outputs.getPorts().forEach((p, i) => {
            if (p.getName() === "")
                p.setName(`O${i}`);
        });
    }

    public override setInputPortCount(val: number): void {
        // Update size
        const newSize = V((1 + (val - 1)/20), Math.pow(2, val)/2);
        this.setSize(newSize);

        super.setInputPortCount(val);

        // Update port names
        this.inputs.updatePortPositions();
        this.outputs.updatePortPositions();
        this.updatePortNames();
    }

    public override activate(): void {
        // Convert binary input to index of which output should be on
        const num = this.getInputPorts()
                .map((port) => (port.getIsOn() ? 1 : 0))
                .reduce((prev, cur, i) => prev | (cur << i), 0);

        // Turn everything off except i === num
        this.getOutputPorts().forEach((_, i) => {
            super.activate(i === num, i);
        });
    }

    public getDisplayName(): string {
        return "Decoder";
    }
}
