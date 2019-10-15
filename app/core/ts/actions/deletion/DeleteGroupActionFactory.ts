import {GroupAction} from "core/actions/GroupAction";
import {DeleteAction} from "core/actions/addition/PlaceAction";
import {DisconnectAction} from "core/actions/addition/ConnectionAction";

import {GatherGroup} from "core/utils/ComponentUtils";

import {IOObject} from "core/models/IOObject";

export function CreateDeleteGroupAction(objects: IOObject[]): GroupAction {
    const action = new GroupAction();

    const allDeletions = GatherGroup(objects);
    const components = allDeletions.getComponents();
    const wires = allDeletions.getWires();

    // Create actions for deletion of wires then objects
    //  order matters because the components need to be added
    //  (when undoing) before the wires can be connected
    action.add(wires.map((wire)     => new DisconnectAction(wire)));
    action.add(components.map((obj) => new DeleteAction(obj)));

    return action;
}
