import {V, Vector} from "Vector";
import {Transform} from "math/Transform";

import {GroupAction} from "core/actions/GroupAction";
import {ConnectionAction} from "core/actions/addition/ConnectionAction";

import {Component} from "core/models";

import {InputPort} from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";


export function CreateBusAction(outputPorts: OutputPort[], inputPorts: InputPort[]): GroupAction {
    if (inputPorts.length !== outputPorts.length)
        throw new Error("Expected equal size input and output ports to bus!");

    if (inputPorts.length === 0)
        return new GroupAction([], "Bus Action");

    const designer = inputPorts[0].getParent().getDesigner();
    if (!designer)
        throw new Error("CreateBusAction failed: Designer not found");

    // Basic idea is to take each input component and output component from each
    //  port and assemble them into a sort-of single giant input component and output component
    //  using the average positions/rotations of each input/output and then transform them
    //  into a space where they are aligned with eachother and connect the ports from top-to-bottom
    //  in this space.

    const calcAvgComp = (cs: Component[]) => {
        const avgPos = cs
            .map(c => c.getPos())
            .reduce((sum, cur) => sum.add(cur), V())
            .scale(1 / cs.length);

        // Use cos/sin to store each rotation in calculation of average
        //  because averaging an angle like -270 and 90 would lead to
        //  -90 when they are both actually the same angle
        const avgRot = cs
            .map(c => c.getAngle())
            .map(a => V(Math.cos(a), Math.sin(a)))
            .reduce((sum, cur) => sum.add(cur), V())
            .scale(1 / cs.length);

        return new Transform(avgPos, V(), avgRot.angle());
    }
    const sortByPos = (a: Vector, b: Vector) => {
        return a.y - b.y; // Sort by y-pos from Top to Bottom
    }

    // Get average components
    const avgOutputTransform = calcAvgComp(outputPorts.map(p => p.getParent()));
    const avgInputTransform  = calcAvgComp( inputPorts.map(p => p.getParent()));

    // Get relative positions for each port in average-component-space
    const outputTargetPositions = outputPorts.map(o => avgOutputTransform.toLocalSpace(o.getWorldTargetPos()));
    const inputTargetPositions  =  inputPorts.map(o =>  avgInputTransform.toLocalSpace(o.getWorldTargetPos()));

    // Associate the ports with their average component target position
    // Keep track of port associated with each position
    const inputMap  = new Map( inputTargetPositions.map((p, i) => [p,  inputPorts[i]]));
    const outputMap = new Map(outputTargetPositions.map((p, i) => [p, outputPorts[i]]));

    inputTargetPositions.sort(sortByPos);
    outputTargetPositions.sort(sortByPos);

    // Connect Ports according to their target pos on the Average Component
    return new GroupAction(inputTargetPositions.map((inputTargetPosition, i) =>
        new ConnectionAction(designer, inputMap.get(inputTargetPosition)!, outputMap.get(outputTargetPositions[i])!)
    ), "Bus Action");
}
