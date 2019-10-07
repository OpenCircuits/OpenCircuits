import {Action} from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";
import {CreateDeletePathAction} from "core/actions/deletion/DeletePathActionFactory";

import {CircuitDesigner} from "core/models/CircuitDesigner";
import {Component} from "core/models/Component";
import {Port} from "core/models/ports/Port";
import {GetPath} from "core/utils/ComponentUtils";

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

    protected createAction(ports: Port[], target: number): GroupAction {
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
