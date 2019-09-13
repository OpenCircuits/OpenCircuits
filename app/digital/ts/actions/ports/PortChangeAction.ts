import {Action} from "../Action";
import {GroupAction} from "../GroupAction";
import {CreateDeletePathAction} from "../deletion/DeletePathActionFactory";

import {CircuitDesigner} from "../../../models/CircuitDesigner";
import {Component} from "../../../models/ioobjects/Component";
import {Port} from "../../../models/ports/Port";
import {GetPath} from "../../ComponentUtils";

export abstract class PortChangeAction implements Action {
    protected designer: CircuitDesigner;

    protected obj: Component;

    protected targetCount: number;
    protected initialCount: number;

    protected action: Action;

    protected constructor(obj: Component, target: number, initialCount: number) {
        this.designer = obj.getDesigner();

        this.obj = obj;
        this.targetCount = target;
        this.initialCount = initialCount;
    }

    protected createAction(ports: Array<Port>, target: number): GroupAction {
        const group = new GroupAction();

        // Disconnect all the wires coming out from
        //  each port that will be removed
        while (ports.length > target) {
            const port = ports.pop();
            port.getWires().forEach((w) =>
                group.add(CreateDeletePathAction(GetPath(w)))
            );
        }

        return group;
    }

    public execute(): Action {
        this.action.execute();

        return this;
    }

    public undo(): Action {
        this.action.undo();

        return this;
    }

}
