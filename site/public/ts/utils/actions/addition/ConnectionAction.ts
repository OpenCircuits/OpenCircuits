import {Action} from "../Action";
import {ReversableAction} from "../ReversableAction";

import {CircuitDesigner} from "../../../models/CircuitDesigner";
import {Component} from "../../../models/ioobjects/Component";
import {InputPort} from "../../../models/ports/InputPort";
import {OutputPort} from "../../../models/ports/OutputPort";
import {Wire} from "../../../models/ioobjects/Wire";

export class ConnectionAction extends ReversableAction {
    private designer: CircuitDesigner;

    private c1: Component;
    private i1: number;
    private c2: Component;
    private i2: number;

    private wire: Wire;

    public constructor(input: OutputPort, output: InputPort, flip: boolean = false) {
        super(flip);

        this.designer = input.getParent().getDesigner();

        // Get components
        this.c1 = input.getParent();
        this.c2 = output.getParent();

        // Find indices of the ports
        this.i1 = this.c1.getOutputPorts().indexOf(input);
        this.i2 = this.c2.getInputPorts().indexOf(output);
    }

    public normalExecute(): Action {
        this.wire = this.designer.connect(this.c1, this.i1,  this.c2, this.i2);

        return this;
    }

    public normalUndo(): Action {
        this.designer.removeWire(this.wire);

        return this;
    }

}

export class DisconnectAction extends ConnectionAction {
    public constructor(wire: Wire) {
        super(wire.getInput(), wire.getOutput(), true);
    }
}
