import {GatherGroup, IOObjectSet} from "core/utils/ComponentUtils";

import {GroupAction}      from "core/actions/GroupAction";
import {DeleteAction}     from "core/actions/addition/PlaceAction";
import {DisconnectAction} from "core/actions/addition/ConnectionAction";

import {CircuitDesigner, Wire} from "core/models";
import {IOObject} from "core/models/IOObject";
import {SelectionsWrapper} from "core/utils/SelectionsWrapper";
import {Selectable} from "core/utils/Selectable";
import {isGeneratorFunction} from "util/types";


export function CreateDeleteGroupAction(designer: CircuitDesigner, objects: IOObject[]): GroupAction {
    const action = new GroupAction();
    
    const allDeletions = GatherGroup(objects, false);
    const components = allDeletions.getComponents();
    const wires = allDeletions.getWires();

    // Create actions for deletion of wires then objects
    //  order matters because the components need to be added
    //  (when undoing) before the wires can be connected
    
    action.add(wires.map((wire)     => new DisconnectAction(designer, wire)));
    action.add(components.map((obj) => new DeleteAction(designer, obj)));
    
    return action;
}




