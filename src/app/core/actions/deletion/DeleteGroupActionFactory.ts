import {GatherGroup} from "core/utils/ComponentUtils";

import {GroupAction}      from "core/actions/GroupAction";
import {DeleteAction}     from "core/actions/addition/PlaceAction";
import {DisconnectAction} from "core/actions/addition/ConnectionAction";

import {CircuitDesigner, isNode, Node} from "core/models";
import {IOObject} from "core/models/IOObject";

/**
 * Goes through group of selected IOObjects and deletes them along with other connected objects that need to be deleted.
 * 
 * @param designer is the CircuitDesigner the action is being done on.
 * @param objects are the IOObjects that are being added to the DeleteGroupAction.
 */
export function CreateDeleteGroupAction(designer: CircuitDesigner, objects: IOObject[]): GroupAction {

    const action = new GroupAction([], "Delete Group Action");

    const allDeletions = GatherGroup(objects,false);

    const components = allDeletions.getComponents();
    const wires = allDeletions.getWires();

   
    // go through all wires and get their input component
    const inputComps = wires.map(wire => wire.getP1Component());

    // filter out duplicates and non-nodes 
    const inputNodes = inputComps.filter(comp => isNode(comp)) as Node[];
    let inputNodesNoDuplicates = new Set(inputNodes.filter(node => !objects.includes(node)));
    console.log(inputNodesNoDuplicates);

    // loop through each input component and check if all of its output wires are in `wires`
    for(let inputComp of inputNodesNoDuplicates){
        
        const outputWires = inputComp.getP2().getWires();
        const found = outputWires.every(wire => wires.includes(wire));
       
        // if so then we want to also delete it
        // call CreateDeleteGroupAction again but with the current node includes in `objects`
        // and then just return early
        if(found){
            console.log("found", inputComp);
            var inputNode = inputComp as IOObject;
            return CreateDeleteGroupAction(designer, [inputNode, ...objects]);
            
          }

    }

    // Create actions for deletion of wires then objects
    //  order matters because the components need to be added
    //  (when undoing) before the wires can be connected
    action.add(wires.map((wire)     => new DisconnectAction(designer, wire)));
    action.add(components.map((obj) => new DeleteAction(designer, obj)));

    return action;
}
