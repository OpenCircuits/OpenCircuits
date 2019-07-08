import {Action} from "./Action";

import {IOObject} from "../../models/ioobjects/IOObject";

export class ShiftAction implements Action {
    private obj: IOObject;
    private i: number;

    public constructor(obj: IOObject) {
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
