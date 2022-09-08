import {GetPath} from "core/utils/ComponentUtils";

import {Action} from "core/actions/Action";

import {CircuitDesigner, Component, Port} from "core/models";

import {DeletePath}  from "../compositions/DeletePath";
import {GroupAction} from "../GroupAction";


export abstract class PortChangeAction<T extends Component> implements Action {
    protected designer?: CircuitDesigner;
    protected obj: T;

    protected targetCount: number;
    protected initialCount: number;

    private wireDeletionAction: GroupAction;

    protected constructor(designer: CircuitDesigner | undefined, obj: T, target: number) {
        this.designer = designer;
        this.obj = obj;

        this.targetCount = target;
        this.initialCount = this.getPorts().length;
    }

    private createAction(): GroupAction {
        const action = new GroupAction([], "Port Change Action");
        const ports = this.getPorts();

        // Disconnect all wires from each port
        //  that will be remove if target < ports.length
        while (ports.length > this.targetCount) {
            const wires = ports.pop()!.getWires();
            if (wires.length > 0 && !this.designer)
                throw new Error("PortChangeAction failed: designer not found");
            action.add(wires.map((w) => DeletePath(this.designer!, GetPath(w))));
        }

        return action;
    }

    protected abstract getPorts(): Port[];

    public execute(): Action {
        // If executing for the first time, then get
        //  all wires that are going to be removed
        if (!this.wireDeletionAction)
            this.wireDeletionAction = this.createAction();
        else
            this.wireDeletionAction.execute();

        return this;
    }

    public undo(): Action {
        this.wireDeletionAction.undo();

        return this;
    }

    public getName(): string {
        return "Port Change";
    }
}
