import {Wire} from "core/models/Wire";
import {InputPort} from "./ports/InputPort";
import {OutputPort} from "./ports/OutputPort";
import {DigitalComponent} from "./DigitalComponent";
import {XMLNode} from "core/utils/io/xml/XMLNode";
import {DigitalNode} from "./ioobjects/other/DigitalNode";

export class DigitalWire extends Wire {
    protected p1: OutputPort;
    protected p2: InputPort;

    private isOn: boolean;

    public constructor(input: OutputPort, output: InputPort) {
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

    public copy(p1?: OutputPort, p2?: InputPort): DigitalWire {
        const copy = <DigitalWire>super.copy(p1, p2);
        copy.isOn = this.isOn;
        return copy;
    }

    public save(node: XMLNode): void {
        super.save(node);

        node.addAttribute("on", this.isOn);
    }

    public load(node: XMLNode): void {
        super.load(node);

        // load state and properties
        this.activate(node.getBooleanAttribute("on"));
        this.p1.activate(this.isOn);
    }
}
