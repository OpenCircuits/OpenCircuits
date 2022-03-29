import {GroupAction} from "core/actions/GroupAction";
import {ConnectionAction} from "core/actions/addition/ConnectionAction";
import {Port} from "core/models";

import {InputPort} from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";
import { DigitalComponent } from "digital/models";
import { Vector } from "Vector";
import { Transform } from "math/Transform";


export function CreateBusAction(outputPorts: OutputPort[], inputPorts: InputPort[]): GroupAction {
    if (inputPorts.length !== outputPorts.length)
        throw new Error("Expected equal size input and output ports to bus!");

    if (inputPorts.length === 0)
        return new GroupAction();

    const designer = inputPorts[0].getParent().getDesigner();
    if (!designer)
        throw new Error("CreateBusAction failed: Designer not found");

    let inPosSum = new Vector();
    let inSinSum = 0;
    let inCosSum = 0;
    inputPorts.forEach(((currPort) => {
        const component = currPort.getParent();
        inPosSum = inPosSum.add(component.getPos());
        // Y-axis is flipped so need to convert angle for math
        const angle = 2 * Math.PI - component.getAngle();
        inSinSum += Math.sin(angle);
        inCosSum += Math.cos(angle);
    }))
    
    const avgInPos = inPosSum.scale(1.0/inputPorts.length);
    // Convert back to flipped Y-axis
    const avgInRot = 2 * Math.PI - Math.atan2(inSinSum/inputPorts.length,inCosSum/inputPorts.length)
    const averageInputTransform = new Transform(avgInPos, new Vector(), avgInRot);
    const inputTargetPositions = inputPorts.map(o => averageInputTransform.toLocalSpace(o.getWorldTargetPos()));

    let outPosSum = new Vector();
    let outSinSum = 0;
    let outCosSum = 0;
    outputPorts.forEach(((currPort) => {
        const component = currPort.getParent();
        outPosSum = outPosSum.add(component.getPos());
        // Y-axis is flipped so need to convert angle for math
        const angle = 2 * Math.PI - component.getAngle();
        outSinSum += Math.sin(angle);
        outCosSum += Math.cos(angle);
    }))

    const avgOutPos = outPosSum.scale(1.0 / outputPorts.length);
    // Convert back to flipped Y-axis
    const avgOutRot = 2 * Math.PI - Math.atan2(outSinSum/outputPorts.length,outCosSum/outputPorts.length);
    const averageOutputTransform = new Transform(avgOutPos, new Vector(), avgOutRot);
    const outputTargetPositions = outputPorts.map(o => averageOutputTransform.toLocalSpace(o.getWorldTargetPos()));
    
    let inputMap = new Map<Vector,InputPort>()
    for(let currPort = 0; currPort < inputPorts.length; currPort++){
        inputMap.set(inputTargetPositions[currPort],inputPorts[currPort])
    }
    let outputMap = new Map<Vector,OutputPort>()
    for(let currPort = 0; currPort < outputPorts.length; currPort++){
        outputMap.set(outputTargetPositions[currPort],outputPorts[currPort])

    }

    const sortByPos = (a: Vector, b: Vector) => {
        return a.y - b.y; // Sort by y-pos from Top to Bottom
    }

    inputTargetPositions.sort(sortByPos);
    outputTargetPositions.sort(sortByPos);
    
    // Connect Ports according to their target pos on the Average Component
    return new GroupAction(inputTargetPositions.map((inputTargetPosition, i) =>
        new ConnectionAction(designer, inputMap.get(inputTargetPosition)!, outputMap.get(outputTargetPositions[i])!)
    ));
}