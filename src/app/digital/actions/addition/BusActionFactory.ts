import {GroupAction} from "core/actions/GroupAction";
import {ConnectionAction} from "core/actions/addition/ConnectionAction";

import {InputPort} from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";
import {Port} from "core/models";


export function CreateBusAction(outputPorts: OutputPort[], inputPorts: InputPort[]): GroupAction {
    if (inputPorts.length !== outputPorts.length)
        throw new Error("Expected equal size input and output ports to bus!");

    const action = new GroupAction();
    if (inputPorts.length === 0)
        return action;

    const designer = inputPorts[0].getParent().getDesigner();
    if (!designer)
        throw new Error("CreateBusAction failed: Designer not found");


    // Sort inputs/outputs by their position
    const sortByPos = (a: Port, b: Port) => {
        const p1 = a.getWorldTargetPos(), p2 = b.getWorldTargetPos();
        if (Math.abs(p2.y - p1.y) <= .25){ // If same-ish-y, sort by x from LtR
            return p1.x - p2.x;
        }
        return p1.y - p2.y; // Sort by y-pos from Top to Bottom
    }

    inputPorts.sort(sortByPos);
    outputPorts.sort(sortByPos);

    // Connect ports by descending y-pos unless they are almost horizontal
    // in which they are connected left to right
    for(let currPort = 0; currPort < inputPorts.length; currPort++){
         // Create action
         action.add(new ConnectionAction(designer, outputPorts[currPort]!, inputPorts[currPort]!));
         // wire.setAsStraight(true); @TODO
    }

    return action;
}
