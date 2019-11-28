import {serializable, serialize} from "core/utils/Serializer";

import {Wire} from "core/models/Wire";

import {DigitalComponent} from "./DigitalComponent";
import {InputPort} from "./ports/InputPort";
import {OutputPort} from "./ports/OutputPort";
import {DigitalNode} from "./ioobjects/other/DigitalNode";

@serializable("DigitalWire")
export class DigitalWire extends Wire {
    @serialize
    protected p1: OutputPort;
    @serialize
    protected p2: InputPort;

    @serialize
    private isOn: boolean;

    public constructor(input?: OutputPort, output?: InputPort) {
        super(input, output);

        this.isOn = false;
    }

    public activate(signal: boolean): void {
        // Don't do anything if signal is same as current state
        if (signal == this.isOn)
            return;

        this.isOn = signal;
        if (this.p2 != null)
            this.p2.activate(signal);
    }

    public split(): DigitalNode {
        return new DigitalNode();
    }

    public getInput(): OutputPort {
        return this.p1;
    }

    public getInputComponent(): DigitalComponent {
        return this.p1.getParent();
    }

    public getOutput(): InputPort {
        return this.p2;
    }

    public getOutputComponent(): DigitalComponent {
        return this.p2.getParent();
    }

    public getIsOn(): boolean {
        return this.isOn;
    }
}
