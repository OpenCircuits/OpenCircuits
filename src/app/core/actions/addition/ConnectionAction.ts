import {Action} from "core/actions/Action";
import {ReversableAction} from "../ReversableAction";

import {Wire} from "core/models/Wire";
import {Port} from "core/models/ports/Port";
import {GroupAction} from "../GroupAction";
import {CircuitDesigner} from "core/models/CircuitDesigner";

/**
 * ConnectionAction represents the action of connecting two
 * ports with a wire.
 */
export class ConnectionAction extends ReversableAction {
    private designer: CircuitDesigner;
    private wire: Wire;

    private p1: Port;
    private p2: Port;

    /**
     * Initializes a ConnectionAction given the CircuitDesigner and a Wire
     * 
     * @param designer The CircuitDesigner this action is being done on
     * @param w The Wire being connected
     */
    public constructor(designer: CircuitDesigner, w: Wire);

    /**
     * Initializes a ConnectionAction given the CircuitDesigner and two Ports
     * 
     * @param designer the CircuitDesigner this action is being done on
     * @param p1 The first Port being connected
     * @param p2 The second Port being connected
     */
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
            this.p2 = p2!;
        }
    }

    /**
     * Executes the ConnectionAction by creating the Wire and connecting
     * it to the proper Ports
     * 
     * @returns 'this' ConnectionAction after execution
     */
    public normalExecute(): Action {
        this.designer.addWire(this.wire);

        this.p1.connect(this.wire);
        this.p2.connect(this.wire);

        return this;
    }

    /**
     * Undoes the ConnectionAction by removing the Wire and
     * disconnecting it from the two Ports
     * 
     * @returns 'this' ConnectionAction after undoing
     */
    public normalUndo(): Action {
        this.designer.removeWire(this.wire);

        this.p1.disconnect(this.wire);
        this.p2.disconnect(this.wire);

        return this;
    }

    /**
     * Gets the Wire associated with this ConnectionAction
     * 
     * @returns the Wire in this connection
     */
    public getWire(): Wire {
        return this.wire;
    }

    public getName(): string {
        return `Connected ${this.p1.getParent().getName()} to ${this.p2.getParent().getName()}`;
    }

}

/**
 * DisconnectAction represents the action of disconnecting a Wire
 * from two Ports
 */
export class DisconnectAction extends ConnectionAction {
    /**
     * Initializes a DisconnectAction given a CircuitDesigner and a Wire
     * 
     * @param designer the CircuitDesigner the action is done on
     * @param wire the Wire being disconnected
     */
    public constructor(designer: CircuitDesigner, wire: Wire) {
        super(designer, wire);
    }
}

/**
 * Creates a GroupAction of DisconnectActions
 * 
 * @param designer the CircuitDesigner the actions are done on
 * @param wires the Wires being disconnected
 * @returns a GroupAction representing the DisconnectActions of each Wire
 */
export function CreateGroupDisconnectAction(designer: CircuitDesigner, wires: Wire[]): GroupAction {
    return new GroupAction(wires.map(w => new DisconnectAction(designer, w)));
}
