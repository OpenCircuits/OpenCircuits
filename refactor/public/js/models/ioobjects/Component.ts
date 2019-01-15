import {Vector,V}     from "../../utils/math/Vector";
import {Transform}    from "../../utils/math/Transform";
import {ClampedValue} from "../../utils/ClampedValue";
import {XMLNode}      from "../../utils/io/xml/XMLNode";

import {IOObject}   from "./IOObject";
import {Wire}       from "./Wire";
import {Port}       from "./Port";
import {InputPort}  from "./InputPort";
import {OutputPort} from "./OutputPort";

export abstract class Component extends IOObject {
    protected inputs: Array<InputPort>;
    protected outputs: Array<OutputPort>;

    protected inputPortCount: ClampedValue;
    protected outputPortCount: ClampedValue;

    protected transform: Transform;

    // constructor(context, x, y, w, h, img, isPressable, maxInputs, maxOutputs, selectionBoxWidth, selectionBoxHeight) {
	protected constructor(inputPortCount: ClampedValue, outputPortCount: ClampedValue, size: Vector) {
        super();

        this.inputPortCount = inputPortCount;
        this.outputPortCount = outputPortCount;

		this.inputs = [];
		this.outputs = [];

        this.transform = new Transform(V(0,0), size, 0);

		// Create and initialize each port
		// for (var i = 0; i < inputPortCount.getValue(); i++)
		// 	this.inputs.push(new InputPort(this));
        this.setInputPortCount(inputPortCount.getValue());
		for (var i = 0; i < outputPortCount.getValue(); i++)
			this.outputs.push(new OutputPort(this));
	}

    /**
     * Default behavior for port positioning to
     *  be evenly spaced along the height of this
     *  component.
     * @param arr The array of ports (either in or out ports)
     */
    protected updatePortPositions(arr: Array<Port>): void {
        for (var i = 0; i < arr.length; i++) {
            // Calculate y position of port
            var l = -this.transform.getSize().y/2*(i - arr.length/2 + 0.5);
            if (i === 0) l--;
            if (i === arr.length-1) l++;

            // Set y positions
            var port = arr[i];
            port.setOriginPos(V(port.getOriginPos().x, l));
            port.setTargetPos(V(port.getTargetPos().x, l));
        }
    }

    /**
     * Activates this component with the given signal
     *  through the output port at index i
     * @param signal The signal (on or off)
     * @param i      The index of the output port
     *               Must be 0 <= i < outputs.length
     */
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

    /**
     * Set the number of InputPorts of this component.
     *  The value will be clamped and positions of ports
     *  will be updated.
     * @param val The new number of ports
     */
    public setInputPortCount(val: number): void {
        // no need to update if value is already
        //  the current amount
        if (val == this.inputs.length)
            return;

        // set count (will auto-clamp)
        this.inputPortCount.setValue(val);

        // add or remove ports to meet target
        while (this.inputs.length > this.inputPortCount.getValue())
            this.inputs.pop();
        while (this.inputs.length < this.inputPortCount.getValue())
            this.inputs.push(new InputPort(this));

        // update positions
        this.updatePortPositions(this.inputs);
    }

    public setPos(v: Vector): void {
        this.transform.setPos(v);
    }

    /**
     * Transform the given local-space vector
     *  to world space relative to this transform
     * @param v The point relative to this component
     */
    public transformPoint(v: Vector): Vector {
        return this.transform.getMatrix().mul(v);
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

    public getPos(): Vector {
        return this.transform.getPos();
    }

    public getAngle(): number {
        return this.transform.getAngle();
    }

    public getTransform(): Transform {
        return this.transform;
    }

    public save(node: XMLNode): void {
        super.save(node);
        node.addElement("x", this.getPos().x);
        node.addElement("y", this.getPos().y);
        node.addElement("angle", this.getAngle());
    }

    public load(node: XMLNode): void {

    }

	abstract getImageName(): string;
}
