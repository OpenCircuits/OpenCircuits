import {Action} from "./Action";
import {CircuitDesigner} from "../../models/CircuitDesigner";
import {InputPort} from "../../models/ports/InputPort";
import {OutputPort} from "../../models/ports/OutputPort";
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

    public execute(): Action {
        this.designer.createWire(this.input, this.output);

        return this;
    }

    public undo(): Action {
        this.designer.removeWire(this.output.getInput());

        return this;
    }

}
