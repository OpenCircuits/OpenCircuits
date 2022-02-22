import {GroupAction} from "core/actions/GroupAction";
import {ConnectionAction} from "core/actions/addition/ConnectionAction";

import {InputPort} from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";
import { Port } from "core/models";
import { GRID_SIZE } from "core/utils/Constants";


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

    var currPort:number = 0;
    for(currPort = 0; currPort < inputPorts.length; currPort++){
         // Create action
         action.add(new ConnectionAction(designer, outputPorts[currPort]!, inputPorts[currPort]!));
         // wire.setAsStraight(true); @TODO
    }




    // Connect closest pairs of input and output ports
    // while (outputPorts.length > 0) {
    //     // Find closest pair of input and output ports
    //     const max = {dist: -Infinity, in: undefined as InputPort | undefined, out: undefined as OutputPort | undefined};
    //     outputPorts.forEach((outPort) => {

    //         // Find the closest input port
    //         const min = {dist: Infinity, in: undefined as InputPort | undefined};
    //         inputPorts.forEach((inPort) => {
    //             // Calculate distance between target pos of ports
    //             const dist = outPort.getWorldTargetPos().distanceTo(inPort.getWorldTargetPos());
    //             if (dist < min.dist) {
    //                 min.dist = dist;
    //                 min.in = inPort;
    //             }
    //         });

    //         if (min.dist > max.dist) {
    //             max.dist = min.dist;
    //             max.in = min.in;
    //             max.out = outPort;
    //         }
    //     });

    //     // Create action
    //     action.add(new ConnectionAction(designer, max.out!, max.in!));
    //     // wire.setAsStraight(true); @TODO

    //     // Remove ports from array
    //     inputPorts.splice(inputPorts.indexOf(max.in!), 1);
    //     outputPorts.splice(outputPorts.indexOf(max.out!), 1);
    // }

    return action;
}
