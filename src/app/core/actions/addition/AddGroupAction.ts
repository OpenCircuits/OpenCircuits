import {GroupAction} from "../GroupAction";
import {PlaceAction} from "./PlaceAction";
import {ConnectionAction} from "./ConnectionAction";

import {IOObjectSet} from "core/utils/ComponentUtils";

import {CircuitDesigner} from "core/models/CircuitDesigner";
import {Action} from "../Action";


export class AddGroupAction implements Action {
    private designer: CircuitDesigner;
    private group: IOObjectSet;

    public constructor(designer: CircuitDesigner, group: IOObjectSet) {
        this.designer = designer;
        this.group = group;
    }

    public execute() {
        this.designer.addGroup(this.group);

        return this;
    }

    public undo() {
        this.group.getComponents().forEach(c => this.designer.removeObject(c));
        this.group.getWires().forEach(w => this.designer.removeWire(w));

        return this;
    }

    public getName(): string {
        return "Added Group Action"
    }
}
