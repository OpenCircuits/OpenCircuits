import {Action} from "./Action";
import {CircuitDesigner} from "../../models/CircuitDesigner";
import {InputPort} from "../../models/ioobjects/InputPort";
import {OutputPort} from "../../models/ioobjects/OutputPort";
import {WirePort} from "../../models/ioobjects/other/WirePort";

import {BezierCurve} from "../math/BezierCurve";

export class SplitWireAction implements Action {
    private designer: CircuitDesigner;

    private input: OutputPort;
    private port: WirePort;
    private output: InputPort;

    private c1: BezierCurve;
    private c2: BezierCurve;

    public constructor(input: OutputPort, port: WirePort, output: InputPort) {
        this.designer = port.getDesigner();

        this.input = input;
        this.port = port;
        this.output = output;

        this.c1 = port.getInputs()[0].getShape();
        this.c2 = port.getOutputs()[0].getShape();
    }

    public execute(): void {
        this.designer.removeWire(this.output.getInput());
        this.designer.addObject(this.port);
        const wire1 = this.designer.createWire(this.input, this.port.getInputPort(0));
        const wire2 = this.designer.createWire(this.port.getOutputPort(0), this.output);
        wire1.getShape().setC2(this.c1.getC2());
        wire2.getShape().setC1(this.c2.getC1());
    }

    public undo(): void {
        const wire1 = this.port.getInputs()[0];
        const wire2 = this.port.getOutputs()[0];
        this.designer.removeWire(wire1);
        this.designer.removeWire(wire2);
        this.designer.removeObject(this.port);
        this.designer.createWire(this.input, this.output);
    }

}
