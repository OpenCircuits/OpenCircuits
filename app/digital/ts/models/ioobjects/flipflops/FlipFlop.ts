import {Vector} from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {serialize} from "core/utils/Serializer";

import {Positioner} from "core/models/ports/positioners/Positioner";

import {InputPort} from "digital/models/ports/InputPort";
import {DigitalComponent} from "digital/models/DigitalComponent";

//
// FlipFlop is an abstract superclass for general flip flops.
//
export abstract class FlipFlop extends DigitalComponent {
    @serialize
    protected clock: boolean = false;

    @serialize
    protected state: boolean = false;

    @serialize
    protected lastClock: boolean = false;

    public constructor(numInputs: number, size: Vector, inputPositioner?: Positioner<InputPort>) {
        super(new ClampedValue(numInputs), new ClampedValue(2), size, inputPositioner);

        this.getOutputPort(0).setName("Q'");
        this.getOutputPort(1).setName("Q ");
    }
}
