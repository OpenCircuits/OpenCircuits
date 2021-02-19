import {Action} from "core/actions/Action";

import {CircuitDesigner} from "core/models";
import {Component} from "core/models/Component";
import {Wire} from "core/models/Wire";


export class ShiftAction implements Action {
    private designer: CircuitDesigner;
    private obj: Component | Wire;
    private i: number;

    public constructor(designer: CircuitDesigner, obj: Component | Wire) {
        this.designer = designer;
        this.obj = obj;
    }

    public execute(): Action {
        this.i = this.designer.shift(this.obj);

        return this;
    }

    public undo(): Action {
        this.designer.shift(this.obj, this.i);

        return this;
    }

}
