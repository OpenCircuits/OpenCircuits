import {Action} from "core/actions/Action";
import {ReversableAction} from "../ReversableAction";

import {Wire} from "core/models/Wire";
import {Port} from "core/models/ports/Port";
import {GroupAction} from "../GroupAction";
import {CircuitDesigner} from "core/models/CircuitDesigner";

export class ConnectionAction extends ReversableAction {
    private designer: CircuitDesigner;
    private wire: Wire;

    public constructor(w: Wire);
    public constructor(p1: Port, p2: Port);
    public constructor(p1: Port | Wire, p2?: Port) {
        super(p1 instanceof Wire);

        if (p1 instanceof Wire) {
            this.designer = p1.getDesigner();
            this.wire = p1;
        } else {
            this.designer = p1.getParent().getDesigner();
            this.wire = this.designer.createWire(p1, p2);
        }
    }

    public normalExecute(): Action {
        this.designer.addWire(this.wire);

        const p1 = this.wire.getP1();
        const p2 = this.wire.getP2();
        p1.connect(this.wire);
        p2.connect(this.wire);

        return this;
    }

    public normalUndo(): Action {
        this.designer.removeWire(this.wire);

        const p1 = this.wire.getP1();
        const p2 = this.wire.getP2();
        p1.disconnect(this.wire);
        p2.disconnect(this.wire);

        return this;
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
