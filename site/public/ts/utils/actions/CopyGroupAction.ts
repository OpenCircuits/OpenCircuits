import {SeparatedComponentCollection,
        CopyGroup} from "../ComponentUtils";

import {Action} from "./Action";
import {CircuitDesigner} from "../../models/CircuitDesigner";
import {IOObject} from "../../models/ioobjects/IOObject";

export class CopyGroupAction implements Action {
    private designer: CircuitDesigner;

    private initialGroup: Array<IOObject>;
    private copy: SeparatedComponentCollection;

    public constructor(designer: CircuitDesigner, initialGroup: Array<IOObject>, group: SeparatedComponentCollection) {
        this.designer = designer;
        this.initialGroup = initialGroup;
        this.copy = group;
    }

    public execute(): void {
        this.designer.addGroup(this.copy = CopyGroup(this.initialGroup));
    }

    public undo(): void {
        // Remove wires first
        for (const wire of this.copy.wires)
            this.designer.removeWire(wire);

        // Remove objects
        for (const obj of this.copy.getAllComponents())
            this.designer.removeObject(obj);
    }

}
