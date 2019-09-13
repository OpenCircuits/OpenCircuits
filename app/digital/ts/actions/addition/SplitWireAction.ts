import {Action} from "../Action";
import {GroupAction} from "../GroupAction";
import {ReversableAction} from "../ReversableAction";
import {CircuitDesigner} from "../../../models/CircuitDesigner";
import {InputPort} from "../../../models/ports/InputPort";
import {OutputPort} from "../../../models/ports/OutputPort";
import {WirePort} from "../../../models/ioobjects/other/WirePort";

export class SplitWireAction extends ReversableAction {
    private designer: CircuitDesigner;

    private input: OutputPort;
    private output: InputPort;
    private port: WirePort;

    public constructor(input: OutputPort, output: InputPort, port: WirePort, flip: boolean = false) {
        super(flip);
        this.designer = input.getParent().getDesigner();

        this.input = input;
        this.output = output;
        this.port = port;
    }

    public normalExecute(): Action {
        this.designer.removeWire(this.output.getInput());
        this.designer.addObject(this.port);
        this.designer.createWire(this.input, this.port.getInputPort(0));
        this.designer.createWire(this.port.getOutputPort(0), this.output);

        return this;
    }

    public normalUndo(): Action {
        this.designer.removeWire(this.port.getInputs()[0]);
        this.designer.removeWire(this.port.getOutputs()[0]);
        this.designer.removeObject(this.port);
        this.designer.createWire(this.input, this.output);

        return this;
    }
}

export class SnipWireAction extends SplitWireAction {
    public constructor(port: WirePort) {
        super(port.getInputs()[0].getInput(), port.getOutputs()[0].getOutput(), port, true);
    }
}


export function CreateGroupSnipAction(ports: Array<WirePort>): GroupAction {
    return ports.reduce((acc, p) => {
        return acc.add(new SnipWireAction(p)) as GroupAction;
    }, new GroupAction());
}
