import {Transform} from "math/Transform";

import {SeparatedComponentCollection,
        CopyGroup} from "analog/utils/ComponentUtils";

import {Action} from "./Action";

import {EECircuitDesigner} from "analog/models/EECircuitDesigner";
import {EEObject} from "analog/models/eeobjects/EEObject";

export class CopyGroupAction implements Action {
    private designer: EECircuitDesigner;

    private initialGroup: Array<EEObject>;
    private copy: SeparatedComponentCollection;

    private transforms: Array<Transform>;

    public constructor(designer: EECircuitDesigner, initialGroup: Array<EEObject>, group: SeparatedComponentCollection) {
        this.designer = designer;
        this.initialGroup = initialGroup;
        this.copy = group;

        this.transforms = group.getAllComponents().map(c => c.getTransform());
    }

    public execute(): Action {
        this.copy = CopyGroup(this.initialGroup);

        // Copy over transforms
        const components = this.copy.getAllComponents();
        for (let i = 0; i < components.length; i++) {
            components[i].setPos(this.transforms[i].getPos());
            components[i].setAngle(this.transforms[i].getAngle());
        }

        this.designer.addGroup(this.copy);

        return this;
    }

    public undo(): Action {
        // Remove wires first
        for (const wire of this.copy.wires)
            this.designer.removeWire(wire);

        // Remove objects
        for (const obj of this.copy.getAllComponents())
            this.designer.removeObject(obj);

        return this;
    }

}
