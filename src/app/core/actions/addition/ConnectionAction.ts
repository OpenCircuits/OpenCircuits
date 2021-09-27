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

    public constructor(designer: CircuitDesigner, w: Wire);
    public constructor(designer: CircuitDesigner, p1: Port, p2: Port);
    public constructor(designer: CircuitDesigner, p1: Port | Wire, p2?: Port) {
        super(p1 instanceof Wire);

        this.designer = designer;

        if (p1 instanceof Wire) {
            this.wire = p1;
            this.p1 = this.wire.getP1();
            this.p2 = this.wire.getP2();
        } else {
            this.wire = this.designer.createWire(p1, p2);
            this.p1 = p1;
            this.p2 = p2;
        }
    }

    public normalExecute(): Action {
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
    public constructor(designer: CircuitDesigner, wire: Wire) {
        super(designer, wire);
    }
}

export function CreateGroupDisconnectAction(designer: CircuitDesigner, wires: Wire[]): GroupAction {
    return new GroupAction(wires.map(w => new DisconnectAction(designer, w)));
}
