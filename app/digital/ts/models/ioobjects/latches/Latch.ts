import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {serialize} from "core/utils/Serializer";

import {Positioner} from "core/models/ports/positioners/Positioner"

import {DigitalComponent} from "digital/models/DigitalComponent";
import {InputPort} from "digital/models/ports/InputPort";

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

}
