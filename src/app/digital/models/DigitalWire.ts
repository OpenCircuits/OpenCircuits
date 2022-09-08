import {serializable, serialize} from "serialeazy";

import {DEFAULT_ON_COLOR} from "core/utils/Constants";

import {Port} from "core/models";

import {Wire} from "core/models/Wire";

import {DigitalNode} from "./ioobjects/other/DigitalNode";

import {DigitalComponent, InputPort, OutputPort} from "./index";



@serializable("DigitalWire")
export class DigitalWire extends Wire {
    @serialize
    protected override p1: OutputPort;
    @serialize
    protected override p2: InputPort;

    @serialize
    private isOn: boolean;

    public constructor(input?: OutputPort, output?: InputPort) {
        super(input!, output!);

        this.p1 = input!;
        this.p2 = output!;
        this.isOn = false;
    }

    public activate(signal: boolean): void {
        // Don't do anything if signal is same as current state
        if (signal === this.isOn)
            return;

        this.isOn = signal;
        if (this.p2 !== undefined)
            this.p2.activate(signal);
    }

    public override canConnectTo(port: Port): boolean {
        if (!super.canConnectTo(port))
            return false;

        // If p1 is defined then `port` must be an InputPort to connect
        if (this.p1 && port instanceof InputPort) {
            // If `port` is an InputPort then it
            //  must not already have a connection
            return port.getInput() === undefined;
        }

        // if p2 is defined then `port` must be an OutputPort
        return (this.p2 && port instanceof OutputPort);
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

    public override getDisplayColor(): string {
        return (this.getInput()?.getIsOn() ? DEFAULT_ON_COLOR : super.getDisplayColor());
    }

    public getIsOn(): boolean {
        return this.isOn;
    }
}
