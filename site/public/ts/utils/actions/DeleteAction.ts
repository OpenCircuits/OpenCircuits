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

    public execute(): void {
        this.designer.removeObject(this.obj);
    }

    public undo(): void {
        this.designer.addObject(this.obj);
    }

}
