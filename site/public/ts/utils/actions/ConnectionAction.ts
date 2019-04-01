import {Action} from "./Action";
import {CircuitDesigner} from "../../models/CircuitDesigner";
import {InputPort} from "../../models/ioobjects/InputPort";
import {OutputPort} from "../../models/ioobjects/OutputPort";
import {Wire} from "../../models/ioobjects/Wire";

export class ConnectionAction implements Action {
    private designer: CircuitDesigner;

    private input: OutputPort;
    private output: InputPort;

    public constructor(w: Wire) {
        this.designer = w.getDesigner();

        this.input = w.getInput();
        this.output = w.getOutput();
    }

    public execute(): void {
        this.designer.createWire(this.input, this.output);
    }

    public undo(): void {
        this.designer.removeWire(this.output.getInput());
    }

}
