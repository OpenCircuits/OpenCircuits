import {Action} from "core/actions/Action";

import {AnyObj} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";

import {GroupAction}      from "../GroupAction";
import {ReversableAction} from "../ReversableAction";


/**
 * PlaceAction represents the action of placing a new Component into the CircuitDesigner.
 */
class PlaceAction extends ReversableAction {
    private readonly circuit: CircuitController<AnyObj>;
    private readonly obj: AnyObj;

    /**
     * Initializes a PlaceAction given the CircuitDesigner, Component, and a flip boolean.
     *
     * @param circuit The CircuitDesigner this action is done on.
     * @param obj     The Component being placed.
     * @param flip    The flip boolean, false for a PlaceAction, true for a DeleteAction.
     */
    public constructor(circuit: CircuitController<AnyObj>, obj: AnyObj, flip = false) {
        super(flip);

        this.circuit = circuit;
        this.obj = obj;

        this.execute();
    }

    /**
     * Executes a PlaceAction by adding the object to the designer.
     *
     * @returns 'this' PlaceAction after execution.
     * @throws If `this.obj` is already in the circuit.
     */
    public normalExecute(): Action {
        this.circuit.addObj(this.obj);

        return this;
    }

    /**
     * Undoes a PlaceAction by removing the object from the designer.
     *
     * @returns 'this' PlaceAction after undoing.
     * @throws If `this.obj` isn't in the circuit.
     */
    public normalUndo(): Action {
        this.circuit.removeObj(this.obj);

        return this;
    }

    public getName(): string {
        return `Placed ${this.obj.kind}[${this.obj.id}]`;
    }

}

export function Place(circuit: CircuitController<AnyObj>, obj: AnyObj) {
    return new PlaceAction(circuit, obj);
}
export function Delete(circuit: CircuitController<AnyObj>, obj: AnyObj) {
    return new PlaceAction(circuit, obj, true);
}

/**
 * Creates a GroupAction for multiple PlaceActions.
 *
 * @param circuit The CircuitDesigner the actions are being done on.
 * @param objs    The Components of each action.
 * @returns       A GroupAction representing the PlaceActions of every Component.
 */
export function PlaceGroup(circuit: CircuitController<AnyObj>, objs: AnyObj[]): GroupAction {
    return new GroupAction(
        objs.map((o) => new PlaceAction(circuit, o)),
        "Group Place Action"
    );
}
