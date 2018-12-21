import {Vector} from "../../../utils/math/Vector";
import {Component} from "../Component";

//
// Gate is an abstract superclass for simple logical gates.
// Gate should always be a component with exactly 1 output port
//
export abstract class Gate extends Component {
    protected not: boolean = false;

    constructor(not: boolean, numInputs: number, size: Vector) {
        super(numInputs, 1, false, size);
        this.setNot(not);
    }

    // @Override
    public activate(on: boolean, i: number = 0): void {
        super.activate((this.not ? !on : on), i);
    }

    private setNot(not: boolean): void {
        // if flipped then flip output
        if (not != this.not)
            this.outputs[0].activate(!this.outputs[0].getIsOn());
        this.not = not;

        // change name to be the not'd name if name wasn't manually set by user
        if (!this.name.isSet())
            this.name.changeName(this.getDisplayName());
    }

}
