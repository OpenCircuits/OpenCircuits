import {serializable} from "serialeazy";

import {DEFAULT_SIZE} from "core/utils/Constants";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {ConstantSpacePositioner} from "core/models/ports/positioners/ConstantSpacePositioner";

import {DigitalComponent} from "digital/models/DigitalComponent";
import {InputPort} from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";
import { PortsToDecimal } from "digital/utils/ComponentUtils";

@serializable("Comparator")
export class Comparator extends DigitalComponent {

    public constructor() {
        super(new ClampedValue(4, 2, 16),
              new ClampedValue(3), //3 shorthand for all
              V(DEFAULT_SIZE, DEFAULT_SIZE*2),
              new ConstantSpacePositioner<InputPort>("left", DEFAULT_SIZE), // update later ->>> default, maybe add a distinction between the two inputs
              new ConstantSpacePositioner<OutputPort>("right", DEFAULT_SIZE));

        this.activate();
    }

    public activate(): void {
        const a = PortsToDecimal(this.getInputPorts().slice(0,this.getInputPortCount().getValue()/2));
        const b = PortsToDecimal(this.getInputPorts().slice(this.getInputPortCount().getValue()/2));
        super.activate(a<b,0);
        super.activate(a===b, 1);
        super.activate(a>b, 2);

    }

    public getDisplayName(): string {
        return "Comparator";
    }
}