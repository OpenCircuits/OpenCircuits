import {DEFAULT_SIZE} from "core/utils/Constants";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {serializable} from "serialeazy";

import {ConstantSpacePositioner} from "core/models/ports/positioners/ConstantSpacePositioner";

import {DigitalComponent} from "digital/models/DigitalComponent";
import {InputPort} from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";

@serializable("Decoder")
export class Decoder extends DigitalComponent {

    public constructor() {
        super(new ClampedValue(2,1,8),
              new ClampedValue(4,2,Math.pow(2,8)),
              V(DEFAULT_SIZE, DEFAULT_SIZE*2),
              new ConstantSpacePositioner<InputPort>("left", DEFAULT_SIZE),
              new ConstantSpacePositioner<OutputPort>("right", DEFAULT_SIZE));

        // activate 0th port for initial state
        super.activate(true, 0);
    }

    public activate(): void {
        // Convert binary input to index of which output should be on
        const num = this.getInputPorts()
                .map(port => (port.getIsOn() ? 1 : 0))
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
