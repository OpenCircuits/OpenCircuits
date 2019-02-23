import {DEFAULT_SIZE} from "../../../utils/Constants";

import {V} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";
import {SeparatedComponentCollection} from "../../../utils/ComponentUtils";
import {Component} from "../Component";

import {ICData} from "./ICData";

export class IC extends Component {
    private data: ICData;

    private collection: SeparatedComponentCollection;

    public constructor(data: ICData) {
        super(new ClampedValue(data.getInputCount()),
              new ClampedValue(data.getOutputCount()), V(DEFAULT_SIZE, DEFAULT_SIZE));
        this.data = data;
        this.collection = this.data.copy(); // Copy internals

        // Redirect activate function for output objects
        for (let i = 0; i < this.getOutputPortCount(); i++) {
            let port = this.getOutputPort(i);
            let output = this.collection.outputs[i];
            output.activate = (on) => {
                port.activate(on);
            }
        }
    }

    public update(): void {
        // Update size
        this.transform.setSize(this.data.getSize());

        // Update port positions
        for (let i = 0; i < this.inputs.length; i++)
            this.inputs[i].setTargetPos(this.data.getInputPos(i));
        for (let i = 0; i < this.outputs.length; i++)
            this.outputs[i].setTargetPos(this.data.getOutputPos(i));
    }

    public activate(): void {
        // Activate corresponding input object
        for (let i = 0; i < this.getInputPortCount(); i++) {
            let port = this.getInputPort(i);
            let input = this.collection.inputs[i];
            input.activate(port.getIsOn());
        }
    }

    public getDisplayName(): string {
        return "IC";
    }

    public getXMLName(): string {
        return "ic";
    }

    public getImageName(): string {
        return "constLow.svg";
    }

}
