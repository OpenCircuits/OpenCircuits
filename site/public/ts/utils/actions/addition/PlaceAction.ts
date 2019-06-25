import {Action} from "../Action";
import {CircuitDesigner} from "../../../models/CircuitDesigner";
import {Component} from "../../../models/ioobjects/Component";

export class PlaceAction implements Action {
    private designer: CircuitDesigner;
    private obj: Component;

    public constructor(designer: CircuitDesigner, obj: Component) {
        this.designer = designer;
        this.obj = obj;
    }

    public execute(): Action {
        this.designer.addObject(this.obj);

        return this;
    }

    public undo(): Action {
        this.designer.removeObject(this.obj);

        return this;
    }

}
