import {Action} from "core/actions/Action";

import {GetPath} from "core/utils/ComponentUtils";

import {CircuitDesigner} from "core/models/CircuitDesigner";
import {Component} from "core/models/Component";
import {Port} from "core/models/ports/Port";

import {GroupAction} from "../GroupAction";
import {CreateDeletePathAction} from "../deletion/DeletePathActionFactory";


export abstract class PortChangeAction implements Action {
    protected designer: CircuitDesigner;

    protected targetCount: number;
    protected initialCount: number;

    private wireDeletionAction: GroupAction;

    protected constructor(designer: CircuitDesigner, target: number, initialCount: number) {
        this.designer = designer;

        this.targetCount = target;
        this.initialCount = initialCount;
    }

    private createAction(): GroupAction {
        const action = new GroupAction();
        const ports = this.getPorts();

        // Disconnect all wires from each port
        //  that will be remove if target < ports.length
        while (ports.length > this.targetCount) {
            const wires = ports.pop().getWires();
            action.add(wires.map(w => CreateDeletePathAction(this.designer, GetPath(w))));
        }

        return action;
    }

    protected abstract getPorts(): Port[];

    public execute(): Action {
        // If executing for the first time, then get
        //  all wires that are going to be removed
        if (!this.wireDeletionAction)
            this.wireDeletionAction = this.createAction();
        this.wireDeletionAction.execute();

        return this;
    }

    public undo(): Action {
        this.wireDeletionAction.undo();

        return this;
    }

}
