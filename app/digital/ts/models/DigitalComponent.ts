import {Component} from "core/models/Component";
import {DigitalCircuitDesigner} from "./DigitalCircuitDesigner";
import {Port} from "core/models/ports/Port";
import {ClampedValue} from "math/ClampedValue";
import {Vector} from "Vector";
import {Positioner} from "core/models/ports/positioners/Positioner";
import {InputPort, InputPortSet} from "./ports/InputPort";
import {OutputPort, OutputPortSet} from "./ports/OutputPort";
import {Wire} from "core/models/Wire";
import {DigitalWire} from "./DigitalWire";

export abstract class DigitalComponent extends Component {
    protected designer: DigitalCircuitDesigner;

    protected inputs:  InputPortSet;
    protected outputs: OutputPortSet;

    protected constructor(inputPortCount: ClampedValue, outputPortCount: ClampedValue, size: Vector,
                          inputPositioner?: Positioner<InputPort>, outputPositioner?: Positioner<OutputPort>) {
        super(size);

        this.inputs  = new InputPortSet (this, inputPortCount, inputPositioner);
        this.outputs = new OutputPortSet(this, outputPortCount, outputPositioner);
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
        if (this.outputs.isEmpty())
            return;

        this.outputs.get(i).activate(signal);
    }


    public setDesigner(designer?: DigitalCircuitDesigner): void {
        this.designer = designer;
    }


    public setInputPortCount(val: number): void {
        this.inputs.setPortCount(val);
        this.onTransformChange();
    }

    public setOutputPortCount(val: number): void {
        this.outputs.setPortCount(val);
        this.onTransformChange();
    }


    public getInputPort(i: number): InputPort {
        return this.inputs.get(i);
    }

    public getInputPortPos(i: number): Vector {
        return this.getInputPort(i).getWorldTargetPos();
    }

    public getInputPorts(): InputPort[] {
        return this.inputs.getPorts();
    }

    public getInputPortCount(): ClampedValue {
        return this.inputs.getCount();
    }

    public getInputs(): DigitalWire[] {
        // Get each wire connected to each InputPort
        //  and then filter out the null ones
        return this.getInputPorts().map((p) => p.getInput())
                .filter((w) => w != null);
    }

    public numInputs(): number {
        return this.inputs.length;
    }


    public getOutputPort(i: number): OutputPort {
        return this.outputs.get(i);
    }

    public getOutputPortPos(i: number): Vector {
        return this.getOutputPort(i).getWorldTargetPos();
    }

    public getOutputPorts(): OutputPort[] {
        return this.outputs.getPorts();
    }

    public getOutputPortCount(): ClampedValue {
        return this.outputs.getCount();
    }

    public getOutputs(): DigitalWire[] {
        // Accumulate all the OutputPort connections
        return this.getOutputPorts().reduce(
            (acc, p) => acc.concat(p.getConnections()), []
        );
    }

    public numOutputs(): number {
        return this.outputs.length;
    }
    
    public getPorts(): Port[] {
        return (<Port[]>this.getInputPorts()).concat(this.getOutputPorts());
    }

    public getConnections(): DigitalWire[] {
        return this.getInputs().concat(this.getOutputs());
    }


    public getDesigner(): DigitalCircuitDesigner {
        return this.designer;
    }


    public copy(): DigitalComponent {
        const copy = <DigitalComponent>super.copy();

        copy.inputs = this.inputs.copy(copy);
        copy.outputs = this.outputs.copy(copy);

        return copy;
    }

}