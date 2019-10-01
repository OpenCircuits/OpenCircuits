import {Action} from "core/actions/Action";
import {ReversableAction} from "../ReversableAction";

import {Component} from "core/models/Component";
import {Wire} from "core/models/Wire";
import {Port} from "core/models/ports/Port";

export class ConnectionAction extends ReversableAction {
    private c1: Component;
    private i1: number;
    private c2: Component;
    private i2: number;

    public constructor(p1: Port, p2: Port, flip: boolean = false) {
        super(flip);

        // Get components
        this.c1 = p1.getParent();
        this.c2 = p2.getParent();

        // Find indices of the ports
        this.i1 = this.c1.indexOfPort(p1);
        this.i2 = this.c2.indexOfPort(p2);
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
