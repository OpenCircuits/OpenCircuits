import {V} from "Vector";

import {Transform} from "math/Transform";

import {GetAllPorts} from "core/utils/ComponentUtils";

import {GroupAction} from "core/actions/GroupAction";

import {Connect} from "core/actions/units/Connect";

import {Component, Port} from "core/models";

import {InputPort, OutputPort} from "digital/models";


/**
 * For use in component bussing (#1056):
 * Gathers all the ports of the given components that should be bus'd together.
 *
 * @param components The component to get the ports of.
 * @returns            A tuple of the input and output ports to bus.
 */
export function GetComponentBusPorts(components: Component[]): [InputPort[], OutputPort[]] {
    const EmptyInputPorts  = (p: Port): p is InputPort  => (p instanceof  InputPort && p.getWires().length === 0);
    const EmptyOutputPorts = (p: Port): p is OutputPort => (p instanceof OutputPort && p.getWires().length === 0);

    // Filter out components that don't have exclusively available input or output ports
    //  these are "ambiguous" components since we might need to bus to their inputs or outputs
    const ambiComps = components.filter((s) => (
        s.getPorts().some(EmptyInputPorts) === s.getPorts().some(EmptyOutputPorts)
    // Then filter out ones that have no available ports
    )).filter((c) => !(c.getPorts().every((p) => (p.getWires().length > 0))));

    // Output components are components where there are no empty input ports => there are only output ports
    const outputComps = components.filter((c) => (!c.getPorts().some(EmptyInputPorts)));
    // Input components are components where there are no empty output ports => there are only input ports
    const inputComps  = components.filter((c) => (!c.getPorts().some(EmptyOutputPorts)));

    // There cannot be input, output, and ambiguous components as this would be an ambigious case
    if (inputComps.length > 0 && outputComps.length > 0 && ambiComps.length > 0)
        return [[], []];

    const [finalInputComps, finalOutputComps] = (() => {
        // So, then there are only 3 cases:
        //  Only input and output components are selected (no ambiguous components)
        if (ambiComps.length === 0)
            return [inputComps, outputComps];
        //  Only input and ambiguous components are selected (no output components)
        if (outputComps.length === 0)
            return [inputComps, ambiComps];
        //  Only output and ambiguous components are selected (no input components)
        if (inputComps.length === 0)
            return [ambiComps, outputComps];
        return [[], []];
    })();

    return [
        GetAllPorts(finalInputComps).filter(EmptyInputPorts),
        GetAllPorts(finalOutputComps).filter(EmptyOutputPorts),
    ];
}


export function Bus(outputPorts: OutputPort[], inputPorts: InputPort[]): GroupAction {
    if (inputPorts.length !== outputPorts.length)
        throw new Error("Expected equal size input and output ports to bus!");

    if (inputPorts.length === 0)
        return new GroupAction([], "Bus Action");

    const designer = inputPorts[0].getParent().getDesigner();
    if (!designer)
        throw new Error("CreateBusAction failed: Designer not found");

    // Basic idea is to take each input component and output component from each
    //  port and assemble them into a sort-of single giant average input component and output component
    //  using the average positions/rotations of each input/output and then transform them
    //  into a space where they are aligned with eachother.
    // From there, each port-position is turned into an angle relative to this average component
    //  and then sorted in an anti-clockwise direction for the output component and a clockwise
    //  direction for the input component and matched accordingly. See https://www.desmos.com/calculator/yydnj2rj6z
    // Since this problem is technically a travelling salesman problem, there is no way to have an efficient
    //  exact solution, and so the downside here is that it assumes the flow of outputs -> inputs
    //  goes from left to right

    const calcAvgComp = (cs: Component[]) => {
        const avgPos = cs
            .map((c) => c.getPos())
            .reduce((sum, cur) => sum.add(cur), V())
            .scale(1 / cs.length);

        // Use cos/sin to store each rotation in calculation of average
        //  because averaging an angle like -270 and 90 would lead to
        //  -90 when they are both actually the same angle
        const avgRot = cs
            .map((c) => c.getAngle())
            .map((a) => V(Math.cos(a), Math.sin(a)))
            .reduce((sum, cur) => sum.add(cur), V())
            .scale(1 / cs.length);

        return new Transform(avgPos, V(), avgRot.angle());
    }
    const sortByAngle = (a: number, b: number) => a - b

    // Get average components
    const avgOutputTransform = calcAvgComp(outputPorts.map((p) => p.getParent()));
    const avgInputTransform  = calcAvgComp(inputPorts.map((p) => p.getParent()));

    // Get relative positions for each port in average-component-space
    const outputTargetPositions = outputPorts.map((o) => avgOutputTransform.toLocalSpace(o.getWorldTargetPos()));
    const inputTargetPositions  =  inputPorts.map((o) =>  avgInputTransform.toLocalSpace(o.getWorldTargetPos()));

    // Get angles of each port in local space
    const outputAngles = outputTargetPositions.map((p) => p.angle());
    const inputAngles  =  inputTargetPositions.map((p) => p.angle()).map((a) => (a < 0 ? a + 2*Math.PI : a));

    /* eslint-disable space-in-parens */
    // Associate the ports with their angle
    //  Needs to be a map of arrays, in the case where two ports share the exact same angle
    const outputMap = new Map<number, OutputPort[]>;
    const inputMap  = new Map<number, InputPort[]>;

    // Add each ports to the maps by angle
    outputAngles.forEach((a, i) => outputMap.set(a, [...(outputMap.get(a) ?? []), outputPorts[i]]));
     inputAngles.forEach((a, i) =>  inputMap.set(a, [...( inputMap.get(a) ?? []),  inputPorts[i]]));

    outputAngles.sort(sortByAngle);
    inputAngles.sort(sortByAngle).reverse();

    // Connect Ports according to their target pos on the Average Component
    return new GroupAction(inputAngles.map((inputAngle, i) =>
        // Pop the ports out of their map so they only get used once
        Connect(designer, inputMap.get(inputAngle)!.pop()!, outputMap.get(outputAngles[i])!.pop()!)
    ), "Bus Action");
}
