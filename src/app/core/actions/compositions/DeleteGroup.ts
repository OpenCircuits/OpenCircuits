import {GetAllPaths, GetPath} from "core/utils/ComponentUtils";
import {ObjSet}               from "core/utils/ObjSet";

import {GroupAction} from "core/actions/GroupAction";

import {Delete} from "core/actions/units/Place";

import {AnyNode, AnyObj, AnyPort} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";


/**
 * Creates a Separated group from the given list of objects.
 *  It also retrieves all "paths" going out from each object.
 *
 * @param circuit The circuit.
 * @param objects The list of objects.
 * @param full    True if you want to return everything in the circuit otherwise
 *                returns only the wires/nodes connected to the selected wire.
 * @returns       A SeparatedComponentCollection of the objects.
 */
 function GatherDeleteGroup(circuit: CircuitController<AnyObj>, objects: AnyObj[], full = true) {
    const group = new ObjSet(objects);

    // Gather all connecting paths
    const { components, wires } = group;

    const paths = [...new Set([
             ...wires.flatMap((w) => GetPath(circuit, w, full)),
        ...components.flatMap((c) => GetAllPaths(circuit, c, full)),
    ])];

    return new ObjSet<AnyObj>([...objects, ...paths]);
}

export function DeleteGroup(circuit: CircuitController<AnyObj>, objects: AnyObj[]): GroupAction {
    const { components, wires } = GatherDeleteGroup(circuit, objects, false);

    // go through all wires and get their input component
    const inputComps = wires
        .flatMap((wire) => [wire.p1, wire.p2])
        .map((portID) => circuit.getPortParent(circuit.getObj(portID) as AnyPort));

    // filter out duplicates and non-nodes
    const inputNodes = inputComps.filter((comp) => (comp.kind === circuit.getNodeKind())) as AnyNode[];
    const inputNodesNoDuplicates = new Set(inputNodes.filter((node) => !objects.includes(node)));

    // loop through each input component and check if all of its output wires are in `wires`
    for (const inputNode of inputNodesNoDuplicates) {
        const [p1, p2] = circuit.getPortsFor(inputNode);
        const found = circuit.getWiresFor(p1).every((wire) => wires.includes(wire)) ||
                      circuit.getWiresFor(p2).every((wire) => wires.includes(wire));

        // if so then we want to also delete it
        // call CreateDeleteGroupAction again but with the current node includes in `objects`
        // and then just return early
        if (found) // TODO: Make this better cause it's pretty inefficient
            return DeleteGroup(circuit, [inputNode, ...objects]);
    }

    // Get all ports to delete from each component
    const ports = [...new Set(components.flatMap((c) => circuit.getPortsFor(c)))];

    // Create actions for deletion of wires then objects
    //  order matters because the components need to be added
    //  (when undoing) before the wires can be connected
    return new GroupAction(
        [...wires, ...ports, ...components].map((o) => Delete(circuit, o)),
        "Delete Group"
    );
}
