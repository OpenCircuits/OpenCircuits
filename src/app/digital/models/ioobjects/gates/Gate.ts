import {Vector}       from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {serialize}    from "serialeazy";
import {Name}         from "core/utils/Name";

import {Positioner} from "core/models/ports/positioners/Positioner"

import {DigitalComponent} from "digital/models/DigitalComponent";
import {InputPort} from "digital/models/ports/InputPort";

//
// Gate is an abstract superclass for simple logical gates.
// Gate should always be a component with exactly 1 output port
//
export abstract class Gate extends DigitalComponent {
    @serialize
    protected not: boolean = false;

    public constructor(not: boolean, inputPortCount: ClampedValue, size: Vector, inputPositioner?: Positioner<InputPort>) {
        super(inputPortCount, new ClampedValue(1), size, inputPositioner);
        this.setNot(not);
    }

    // @Override
    public activate(on: boolean, i: number = 0): void {
        super.activate((this.not ? !on : on), i);
    }

    private setNot(not: boolean): void {
        // if flipped then flip output
        if (not !== this.not)
            this.outputs.first.activate(!this.outputs.first.getIsOn());
        this.not = not;

        // change name to be the not'd name if name wasn't manually set by user
        if (!this.name.isSet())
            this.name = new Name(this.getDisplayName());
    }

    public isNot(): boolean {
        return this.not;
    }

}
