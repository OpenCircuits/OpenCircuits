import {DEFAULT_BORDER_WIDTH,
        IO_PORT_RADIUS,
        IO_PORT_BORDER_WIDTH} from "../../utils/Constants";

import {Vector,V}     from "Vector";
import {Transform}    from "math/Transform";
import {RectContains} from "math/MathUtils";
import {ClampedValue} from "math/ClampedValue";
import {XMLNode}      from "core/utils/io/xml/XMLNode";

import {CullableObject}   from "./CullableObject";
import {EEWire}       from "./EEWire";
import {EEPort}       from "./EEPort";
import {InputPort}  from "./InputPort";
import {OutputPort} from "./OutputPort";

export abstract class EEComponent extends CullableObject {
    protected inputs: Array<InputPort>;
    protected outputs: Array<OutputPort>;

    protected inputPortCount: ClampedValue;
    protected outputPortCount: ClampedValue;

    protected transform: Transform;

    protected constructor(inputPortCount: ClampedValue, outputPortCount: ClampedValue, size: Vector) {
        super();

        this.inputPortCount = inputPortCount;
        this.outputPortCount = outputPortCount;

		this.inputs = [];
		this.outputs = [];

        this.transform = new Transform(V(0,0), size, 0);

		// Create ports
        this.setInputPortCount(inputPortCount.getValue());
        this.setOutputPortCount(outputPortCount.getValue());
    }

    /**
     * Default behavior for port positioning to
     *  be evenly spaced along the height of this
     *  component.
     * @param arr The array of ports (either in or out ports)
     */
    protected updatePortPositions(arr: Array<EEPort>): void {
        for (let i = 0; i < arr.length; i++) {
            // Calculate y position of port
            let l = -this.transform.getSize().y/2*(i - arr.length/2 + 0.5);
            if (i === 0) l--;
            if (i === arr.length-1) l++;

            // Set y positions
            let port = arr[i];
            port.setOriginPos(V(port.getOriginPos().x, l));
            port.setTargetPos(V(port.getTargetPos().x, l));
        }
    }

    protected setPortCount(arr: Array<EEPort>, val: ClampedValue, newVal: number, type: typeof InputPort | typeof OutputPort) {
        // no need to update if value is already
        //  the current amount
        if (newVal == arr.length)
            return;

        // set count (will auto-clamp)
        val.setValue(newVal);

        // add or remove ports to meet target
        while (arr.length > val.getValue())
            arr.pop();
        while (arr.length < val.getValue())
            arr.push(new type(this));

        // update positions
        this.updatePortPositions(arr);
    }

	public connect(i: number, w: EEWire) : void {
		this.outputs[i].connect(w);
	}

	public setInput(i: number, w: EEWire): void {
		this.inputs[i].setInput(w);
	}

    /**
     * Set the number of InputPorts of this component.
     *  The value will be clamped and positions of ports
     *  will be updated.
     * @param val The new number of ports
     */
    public setInputPortCount(val: number): void {
        this.setPortCount(this.inputs, this.inputPortCount, val, InputPort);
    }

    /**
     * Set the number of OutputPorts of this component.
     *  The value will be clamped and positions of ports
     *  will be updated.
     * @param val The new number of ports
     */
    public setOutputPortCount(val: number): void {
        this.setPortCount(this.outputs, this.outputPortCount, val, OutputPort);
    }

    public setPos(v: Vector): void {
        this.transform.setPos(v);
    }

    public setAngle(a: number): void {
        this.transform.setAngle(a);
    }

    public setRotationAbout(a: number, c: Vector): void {
        this.transform.setRotationAbout(a, c);
    }

    /**
     * Transform the given local-space vector
     *  to world space relative to this transform
     * @param v The point relative to this component
     */
    public transformPoint(v: Vector): Vector {
        return this.transform.getMatrix().mul(v);
    }

    /**
     * Determines whether or not a point is within
     *  this component's "pressable" bounds (always false)
     *  for most components
     * @param  v The point
     * @return   True if the point is within this component,
     *           false otherwise
     */
    public isWithinPressBounds(v: Vector): boolean {
        return false;
    }

    /**
     * Determines whether or not a point is within
     *  this component's "selectable" bounds
     * @param  v The point
     * @return   True if the point is within this component,
     *           false otherwise
     */
    public isWithinSelectBounds(v: Vector): boolean {
        return RectContains(this.getTransform(), v) &&
               !this.isWithinPressBounds(v);
    }

    public getInputPort(i: number): InputPort {
        return this.inputs[i];
    }

    public getInputPortCount(): number {
        return this.inputs.length;
    }

    public getInputPorts(): Array<InputPort> {
        return this.inputs.slice(); // Shallow copy
    }

    public getInputs(): Array<EEWire> {
        let arr = [];
        for (let i = 0; i < this.inputs.length; i++) {
            let input = this.inputs[i].getInput();
            if (input != undefined)
                arr.push(input);
        }
        return arr;
    }

    public numInputs(): number {
        return this.inputs.length;
    }

    public numOutputs(): number {
        return this.outputs.length;
    }

    public getOutputPort(i: number): OutputPort {
        return this.outputs[i];
    }

    public getOutputPortCount(): number {
        return this.outputs.length;
    }

    public getOutputPorts(): Array<OutputPort> {
        return this.outputs.slice(); // Shallow copy
    }

    public getOutputs(): Array<EEWire> {
        let arr: Array<EEWire> = [];
        for (let i = 0; i < this.outputs.length; i++)
            arr = arr.concat(this.outputs[i].getConnections());
        return arr;
    }

    public getPorts(): Array<EEPort> {
        let ports: Array<EEPort> = [];
        ports = ports.concat(this.getInputPorts());
        ports = ports.concat(this.getOutputPorts());
        return ports;
    }

    public getPos(): Vector {
        return this.transform.getPos();
    }

    public getSize(): Vector {
        return this.transform.getSize();
    }

    public getAngle(): number {
        return this.transform.getAngle();
    }

    public getTransform(): Transform {
        return this.transform;
    }

    public getMinPos(): Vector {
        let min = V(Infinity, Infinity);
        // Find minimum pos from corners of transform
        this.transform.getCorners().forEach((v) => {
            v = v.sub(V(DEFAULT_BORDER_WIDTH, DEFAULT_BORDER_WIDTH));
            min = Vector.min(min, v);
        });

        // Find minimum pos from ports
        this.getPorts().forEach((p) => {
            let v = p.getWorldTargetPos();
            v = v.sub(V(IO_PORT_RADIUS+IO_PORT_BORDER_WIDTH, IO_PORT_RADIUS+IO_PORT_BORDER_WIDTH));
            min = Vector.min(min, v);
        });

        return min;
    }

    public getMaxPos(): Vector {
        let max = V(-Infinity, -Infinity);
        // Find maximum pos from corners of transform
        this.transform.getCorners().forEach((v) => {
            v = v.add(V(DEFAULT_BORDER_WIDTH, DEFAULT_BORDER_WIDTH));
            max = Vector.max(max, v);
        });

        // Find maximum pos from ports
        this.getPorts().forEach((p) => {
            let v = p.getWorldTargetPos();
            v = v.add(V(IO_PORT_RADIUS+IO_PORT_BORDER_WIDTH, IO_PORT_RADIUS+IO_PORT_BORDER_WIDTH));
            max = Vector.max(max, v);
        });

        return max;
    }

    public copy(): EEComponent {
        let copy = <EEComponent>super.copy();

        // Copy properties
        copy.transform = this.transform.copy();
        copy.inputPortCount  = this.inputPortCount.copy();
        copy.outputPortCount = this.outputPortCount.copy();
        copy.setInputPortCount(this.getInputPortCount());
        copy.setOutputPortCount(this.getOutputPortCount());

        // Copy port positions
        let ports = this.getPorts();
        let copyPorts = copy.getPorts();
        for (let i = 0; i < ports.length; i++) {
            copyPorts[i].setOriginPos(ports[i].getOriginPos());
            copyPorts[i].setTargetPos(ports[i].getTargetPos());
        }

        return copy;
    }

    public save(node: XMLNode): void {
        super.save(node);
        node.addVectorAttribute("", this.getPos());
        node.addAttribute("angle", this.getAngle());
    }

    public load(node: XMLNode): void {
        super.load(node);
        this.setPos(node.getVectorAttribute(""));
        this.setAngle(node.getFloatAttribute("angle"));
    }

	public getImageName(): string {
        return undefined;
    }

}
