import {Action} from "../Action";
import {ReversableAction} from "../ReversableAction";

import {Component} from "../../../models/ioobjects/Component";
import {InputPort} from "../../../models/ports/InputPort";
import {OutputPort} from "../../../models/ports/OutputPort";
import {Wire} from "../../../models/ioobjects/Wire";

export class ConnectionAction extends ReversableAction {
    private c1: Component;
    private i1: number;
    private c2: Component;
    private i2: number;

    public constructor(input: OutputPort, output: InputPort, flip: boolean = false) {
        super(flip);

        // Get components
        this.c1 = input.getParent();
        this.c2 = output.getParent();

        // Find indices of the ports
        this.i1 = this.c1.getOutputPorts().indexOf(input);
        this.i2 = this.c2.getInputPorts().indexOf(output);
    }

    public normalExecute(): Action {
        const designer = this.c1.getDesigner();
        designer.connect(this.c1, this.i1,  this.c2, this.i2);

        return this;
    }

    public normalUndo(): Action {
        const designer = this.c1.getDesigner();
        const wire = this.c1.getOutputs()[this.i1];
        designer.removeWire(wire);

        return this;
    }

}

export class DisconnectAction extends ConnectionAction {
    public constructor(wire: Wire) {
        super(wire.getInput(), wire.getOutput(), true);
    }
}
