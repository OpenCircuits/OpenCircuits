import {Action} from "core/actions/Action";

import {CircuitDesigner} from "core/models/CircuitDesigner";
import {Component} from "core/models/Component";

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

    public execute(): Action {
        this.action.execute();

        return this;
    }

    public undo(): Action {
        this.action.undo();

        return this;
    }

}
