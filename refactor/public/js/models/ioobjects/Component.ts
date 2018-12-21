import {Vector,V}  from "../../utils/math/Vector";
import {Transform} from "../../utils/math/Transform";

import {IOObject}   from "./IOObject";
import {Wire}       from "./Wire";
import {InputPort}  from "./InputPort";
import {OutputPort} from "./OutputPort";

export abstract class Component extends IOObject {
    protected inputs: Array<InputPort>;
    protected outputs: Array<OutputPort>;

    protected transform: Transform;

    // constructor(context, x, y, w, h, img, isPressable, maxInputs, maxOutputs, selectionBoxWidth, selectionBoxHeight) {
	constructor(numInputs: number, numOutputs: number, isPressable: boolean, size: Vector = V(1, 1)) {
        super();

		this.inputs = [];
		this.outputs = [];

        this.transform = new Transform(V(0,0), size, 0);

		// Create and initialize each port
		for (var i = 0; i < numInputs; i++)
			this.inputs.push(new InputPort(this));
		for (var i = 0; i < numOutputs; i++)
			this.outputs.push(new OutputPort(this));
	}

	public activate(signal: boolean, i: number = 0): void {
		// Don't try to activate an Output component since it has no outputs
		if (this.outputs.length == 0)
			return;

		this.outputs[i].activate(signal);
	}

	public connect(i: number, w: Wire) : void {
		this.outputs[i].connect(w);
	}

	public setInput(i: number, w: Wire): void {
		this.inputs[i].setInput(w);
	}

    public setPos(v: Vector): void {
        this.transform.setPos(v);
    }

	public getInputPort(i: number): InputPort {
		return this.inputs[i];
	}

    public getInputPortCount(): number {
        return this.inputs.length;
    }

	public getOutputPort(i: number): OutputPort {
		return this.outputs[i];
	}

    public getOutputPortCount(): number {
        return this.outputs.length;
    }

    public getInputs(): Array<Wire> {
        var arr = [];
        for (var i = 0; i < this.inputs.length; i++) {
            var input = this.inputs[i].getInput();
            if (input != undefined)
                arr.push(input);
        }
        return arr;
    }

    public getOutputs(): Array<Wire> {
        var arr: Array<Wire> = [];
        for (var i = 0; i < this.outputs.length; i++)
            arr = arr.concat(this.outputs[i].getConnections());
        return arr;
    }

    public getTransform(): Transform {
        return this.transform;
    }

	abstract getImageName(): string;
}
