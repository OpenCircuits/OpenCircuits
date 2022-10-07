import {Action} from "core/actions/Action";

import {CircuitDesigner} from "core/models";

import {Component} from "core/models/Component";
import {Wire}      from "core/models/Wire";


class ShiftAction implements Action {
    private readonly designer: CircuitDesigner;
    private readonly obj: Component | Wire;
    private i: number;

    public constructor(designer: CircuitDesigner, obj: Component | Wire) {
        this.designer = designer;
        this.obj = obj;

        this.execute();
    }

    public execute(): Action {
        this.i = this.designer.shift(this.obj);

        return this;
    }

    public undo(): Action {
        this.designer.shift(this.obj, this.i);

        return this;
    }

    public getName(): string {
        return "Shift Object";
    }

    public getCustomInfo(): string[] {
        return [`${this.obj.getName()}: ${this.i}`];
    }
}

export function Shift(designer: CircuitDesigner, obj: Component | Wire) {
    return new ShiftAction(designer, obj);
}
