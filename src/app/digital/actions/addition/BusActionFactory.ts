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
    const sortByAngle = (a: number, b: number) => {
        return a - b;
    }

    // Get average components
    const avgOutputTransform = calcAvgComp(outputPorts.map(p => p.getParent()));
    const avgInputTransform  = calcAvgComp( inputPorts.map(p => p.getParent()));

    // Get relative positions for each port in average-component-space
    const outputTargetPositions = outputPorts.map(o => avgOutputTransform.toLocalSpace(o.getWorldTargetPos()));
    const inputTargetPositions  =  inputPorts.map(o =>  avgInputTransform.toLocalSpace(o.getWorldTargetPos()));

    // Get angles of each port in local space
    const outputAngles = outputTargetPositions.map(p => p.angle());
    const inputAngles  =  inputTargetPositions.map(p => p.angle()).map(a => (a < 0 ? a + 2*Math.PI : a));

    // Associate the ports with their angle
    const outputMap = new Map(outputAngles.map((a, i) => [a, outputPorts[i]]));
    const inputMap  = new Map( inputAngles.map((a, i) => [a,  inputPorts[i]]));

    outputAngles.sort(sortByAngle);
    inputAngles.sort(sortByAngle).reverse();

    // Connect Ports according to their target pos on the Average Component
    return new GroupAction(inputAngles.map((inputAngle, i) =>
        new ConnectionAction(designer, inputMap.get(inputAngle)!, outputMap.get(outputAngles[i])!)
    ), "Bus Action");
}
