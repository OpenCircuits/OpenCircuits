import {Transform} from "math/Transform";

import {CopyGroup,
        IOObjectSet} from "core/utils/ComponentUtils";

import {Action} from "core/actions/Action";

import {CircuitDesigner} from "core/models/CircuitDesigner";
import {IOObject} from "core/models/IOObject";

export class CopyGroupAction implements Action {
    private designer: CircuitDesigner;

    private copy: IOObjectSet;

    private transforms: Transform[];

    public constructor(designer: CircuitDesigner, initialGroup: IOObject[]) {
        this.designer = designer;
        this.copy = CopyGroup(initialGroup);

        this.transforms = this.copy.getComponents().map(c => c.getTransform());
    }

    public execute(): Action {
        this.designer.addGroup(this.copy);

        return this;
    }

    public undo(): Action {
        // Remove wires first
        for (const wire of this.copy.getWires())
            this.designer.removeWire(wire);

        // Remove objects
        for (const obj of this.copy.getComponents())
            this.designer.removeObject(obj);

        return this;
    }

    public getCopies(): IOObjectSet {
        return this.copy;
    }

}
