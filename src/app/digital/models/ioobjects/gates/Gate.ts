import {Vector} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {Prop} from "core/models/PropInfo";

import {Positioner} from "core/models/ports/positioners/Positioner"

import {DigitalComponent} from "digital/models/DigitalComponent";

import {InputPort} from "digital/models/ports/InputPort";

//
// Gate is an abstract superclass for simple logical gates.
// Gate should always be a component with exactly 1 output port
//
export abstract class Gate extends DigitalComponent {

    public constructor(not: boolean, inputPortCount: ClampedValue, size: Vector,
                       inputPositioner?: Positioner<InputPort>) {
        super(inputPortCount, new ClampedValue(1), size, inputPositioner, undefined, { not });
        this.setProp("not", not);
    }

    // @Override
    public override activate(on: boolean, i = 0): void {
        super.activate((this.getProp("not") ? !on : on), i);
    }

    public override setProp(key: string, val: Prop): void {
        super.setProp(key, val);

        // if flipped then flip output
        if (key === "not") {
            this.outputs.first.activate(
                 !val &&  this.outputs.first.getIsOn() ||
                !!val && !this.outputs.first.getIsOn()
            );
        }
    }

}
