import {Action} from "core/actions/Action";

import {Component} from "core/models/Component";
import {Wire} from "core/models/Wire";

export class ShiftAction implements Action {
    private obj: Component | Wire;
    private i: number;

    public constructor(obj: Component | Wire) {
        this.obj = obj;
    }

    public execute(): Action {
        const designer = this.obj.getDesigner();
        this.i = designer.shift(this.obj);

        return this;
    }

    public undo(): Action {
        const designer = this.obj.getDesigner();
        designer.shift(this.obj, this.i);

        return this;
    }

}
