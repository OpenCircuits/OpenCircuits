import {Vector} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";
import {Name} from "../../../utils/Name";
import {XMLNode} from "../../../utils/io/xml/XMLNode";
import {Component} from "../Component";

//
// Gate is an abstract superclass for simple logical gates.
// Gate should always be a component with exactly 1 output port
//
export abstract class Gate extends Component {
    protected not: boolean = false;

    public constructor(not: boolean, inputPortCount: ClampedValue, size: Vector) {
        super(inputPortCount, new ClampedValue(1), size);
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
            this.name = new Name(this.getDisplayName());
    }

    public isNot(): boolean {
        return this.not;
    }

    public save(node: XMLNode): void {
        super.save(node);

        node.addAttribute("inputs", this.getInputPortCount());
        node.addAttribute("outputs", this.getOutputPortCount());
    }

    public load(node: XMLNode): void {
        super.load(node);

        this.setInputPortCount(node.getIntAttribute("inputs"));
        this.setOutputPortCount(node.getIntAttribute("outputs"));
    }

}
