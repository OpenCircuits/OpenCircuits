import {Action} from "../Action";
import {GroupAction} from "../GroupAction";
import {ReversableAction} from "../ReversableAction";

import {EECircuitDesigner} from "analog/models/EECircuitDesigner";
import {InputPort} from "analog/models/eeobjects/InputPort";
import {OutputPort} from "analog/models/eeobjects/OutputPort";
import {Node} from "analog/models/eeobjects/Node";

export class SplitWireAction extends ReversableAction {
    private designer: EECircuitDesigner;

    private input: OutputPort;
    private output: InputPort;
    private port: Node;

    public constructor(input: OutputPort, output: InputPort, port: Node, flip: boolean = false) {
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
    public constructor(port: Node) {
        super(port.getInputs()[0].getInput(), port.getOutputs()[0].getOutput(), port, true);
    }
}


export function CreateGroupSnipAction(ports: Array<Node>): GroupAction {
    return ports.reduce((acc, p) => {
        return acc.add(new SnipWireAction(p));
    }, new GroupAction());
}
