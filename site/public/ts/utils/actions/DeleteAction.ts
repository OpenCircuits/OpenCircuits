import {Action} from "./Action";
import {CircuitDesigner} from "../../models/CircuitDesigner";
import {Component} from "../../models/ioobjects/Component";

export class DeleteAction implements Action {
    private designer: CircuitDesigner;
    private obj: Component;

    public constructor(obj: Component) {
        this.designer = obj.getDesigner();
        this.obj = obj;
    }

    public execute(): Action {
        this.designer.removeObject(this.obj);

        return this;
    }

    public undo(): Action {
        this.designer.addObject(this.obj);

        return this;
    }

}
