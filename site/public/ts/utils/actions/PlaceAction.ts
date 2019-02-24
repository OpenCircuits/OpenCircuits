import {Action} from "./Action";
import {CircuitDesigner} from "../../models/CircuitDesigner";
import {Component} from "../../models/ioobjects/Component";

export class PlaceAction implements Action {
    private designer: CircuitDesigner;
    private obj: Component;

    public constructor(designer: CircuitDesigner, obj: Component) {
        this.designer = designer;
        this.obj = obj;
        // Place action is implicitly executed
        this.execute();
    }

    public execute(): void {
        this.designer.addObject(this.obj);
    }

    public undo(): void {
        this.designer.removeObject(this.obj);
    }

}
