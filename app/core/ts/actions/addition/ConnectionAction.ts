import {Action} from "core/actions/Action";
import {ReversableAction} from "../ReversableAction";

import {Wire} from "core/models/Wire";
import {Port} from "core/models/ports/Port";
import {GroupAction} from "../GroupAction";
import {CircuitDesigner} from "core/models/CircuitDesigner";

export class ConnectionAction extends ReversableAction {
    private designer: CircuitDesigner;
    private wire: Wire;

    private p1: Port;
    private p2: Port;

    public constructor(w: Wire);
    public constructor(p1: Port, p2: Port);
    public constructor(p1: Port | Wire, p2?: Port) {
        super(p1 instanceof Wire);

        if (p1 instanceof Wire) {
            this.designer = p1.getDesigner();
            this.wire = p1;
            this.p1 = this.wire.getP1();
            this.p2 = this.wire.getP2();
        } else {
            this.p1 = p1;
            this.p2 = p2;
        }
    }

    public normalExecute(): Action {
        // Create wire on first execution just in case the parent of
        //  p1 or p2 has yet to be placed when this action is constructed
        if (!this.wire) {
            this.designer = this.p1.getParent().getDesigner();
            this.wire = this.designer.createWire(this.p1, this.p2);
        }

        this.designer.addWire(this.wire);

        this.p1.connect(this.wire);
        this.p2.connect(this.wire);

        return this;
    }

    public normalUndo(): Action {
        this.designer.removeWire(this.wire);

        this.p1.disconnect(this.wire);
        this.p2.disconnect(this.wire);

        return this;
    }

    public getWire(): Wire {
        return this.wire;
    }

}

export class DisconnectAction extends ConnectionAction {
    public constructor(wire: Wire) {
        super(wire);
    }
}

export function CreateGroupDisconnectAction(wires: Wire[]): GroupAction {
    return new GroupAction(wires.map(w => new DisconnectAction(w)));
}
