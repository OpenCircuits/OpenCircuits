/* eslint-disable unicorn/no-null */
import {DigitalCircuit, isComponent, isInputPort, isOutputPort} from "digital/api/circuit/public";
import {DigitalComponent} from "digital/api/circuit/public/DigitalComponent";
import {DigitalPort} from "digital/api/circuit/public/DigitalPort";
import {CalculateMidpoint} from "math/MathUtils";
import {Transform} from "math/Transform";
import {useSelectionProps} from "shared/site/containers/SelectionPopup/modules/useSelectionProps";
import {V} from "Vector";


/**
 * For use in component bussing (#1056):
 * Gathers all the ports of the given components that should be bus'd together.
 *
 * @param components The component to get the ports of.
 * @returns          A tuple of the input and output ports to bus.
 */
function GetComponentBusPorts(components: DigitalComponent[]): [DigitalPort[], DigitalPort[]] {
    const EmptyInputPorts  = (p: DigitalPort) => (p.isInputPort  && p.connections.length === 0);
    const EmptyOutputPorts = (p: DigitalPort) => (p.isOutputPort && p.connections.length === 0);

    // Filter out components that don't have exclusively available input or output ports
    //  these are "ambiguous" components since we might need to bus to their inputs or outputs
    const ambiComps = components.filter((s) => (
        s.allPorts.some(EmptyInputPorts) === s.allPorts.some(EmptyOutputPorts)
    // Then filter out ones that have no available ports
    )).filter((c) => !(c.allPorts.every((p) => (p.connections.length > 0))));

    // Output components are components where there are no empty input ports => there are only output ports
    const outputComps = components.filter((c) => (!c.allPorts.some(EmptyInputPorts)));
    // Input components are components where there are no empty output ports => there are only input ports
    const inputComps  = components.filter((c) => (!c.allPorts.some(EmptyOutputPorts)));

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
        finalInputComps.flatMap<DigitalPort>((c) => c.allPorts).filter(EmptyInputPorts),
        finalOutputComps.flatMap<DigitalPort>((c) => c.allPorts).filter(EmptyOutputPorts),
    ];
}

export function Bus(circuit: DigitalCircuit, outputPorts: DigitalPort[], inputPorts: DigitalPort[]) {
    if (inputPorts.length !== outputPorts.length)
        throw new Error("Expected equal size input and output ports to bus!");

    if (inputPorts.length === 0)
        return;

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
    const calcAvgComp = (cs: DigitalComponent[]) => {
        const avgPos = CalculateMidpoint(cs.map((c) => c.pos));

        // Use cos/sin to store each rotation in calculation of average
        //  because averaging an angle like -270 and 90 would lead to
        //  -90 when they are both actually the same angle
        const avgRot = CalculateMidpoint(cs.map((c) => c.angle).map((a) => V(Math.cos(a), Math.sin(a))));

        return new Transform(avgPos, V(), avgRot.angle());
    }
    const sortByAngle = (a: number, b: number) => a - b;

    // Get average components
    const avgOutputTransform = calcAvgComp(outputPorts.map((p) => p.parent));
    const avgInputTransform  = calcAvgComp(inputPorts.map((p) => p.parent));

    // Get relative positions for each port in average-component-space
    const outputTargetPositions = outputPorts.map((o) => avgOutputTransform.toLocalSpace(o.targetPos));
    const inputTargetPositions  =  inputPorts.map((o) =>  avgInputTransform.toLocalSpace(o.targetPos));

    // Get angles of each port in local space
    const outputAngles = outputTargetPositions.map((p) => p.angle());
    const inputAngles  =  inputTargetPositions.map((p) => p.angle()).map((a) => (a < 0 ? a + 2*Math.PI : a));

    /* eslint-disable space-in-parens */
    // Associate the ports with their angle
    //  Needs to be a map of arrays, in the case where two ports share the exact same angle
    const outputMap = new Map<number, DigitalPort[]>;
    const inputMap  = new Map<number, DigitalPort[]>;

    // Add each ports to the maps by angle
    outputAngles.forEach((a, i) => outputMap.set(a, [...(outputMap.get(a) ?? []), outputPorts[i]]));
     inputAngles.forEach((a, i) =>  inputMap.set(a, [...( inputMap.get(a) ?? []),  inputPorts[i]]));

    outputAngles.sort(sortByAngle);
    inputAngles.sort(sortByAngle).reverse();

    // Connect Ports according to their target pos on the Average Component
    circuit.beginTransaction();

    for (const [inputAngle, outputAngle] of inputAngles.zip(outputAngles)) {
        const inputPort = inputMap.get(inputAngle)!.pop()!;
        const outputPort = outputMap.get(outputAngle)!.pop()!;

        inputPort.connectTo(outputPort);
    }

    circuit.commitTransaction("Bussed Ports");
}

type Props = {
    circuit: DigitalCircuit;
}
export const BusButtonModule = ({ circuit }: Props) => {
    const [props, objs] = useSelectionProps(
        circuit,
        (s): s is (DigitalComponent | DigitalPort) => (
            (s.baseKind === "Component") ||
            (s.baseKind === "Port" && s.connections.length === 0)
        ),
        (s) => ({ type: s.baseKind })
    );

    // No valid selections
    if (!props)
        return null;

    const components = objs.filter(isComponent);

    // If there are components selected, but not ONLY components selected, this is invalid
    // so we will not handle it.
    if (components.length > 0 && components.length !== objs.length)
        return null;

    const [inputPorts, outputPorts] = (components.length === 0)
        // If no components selected, just get the selected input/output ports
        ? [objs.filter(isInputPort), objs.filter(isOutputPort)]
        // Otherwise, there are only objects selected, so get ports from them to bus instead
        : GetComponentBusPorts(components);

    // Port counts mismatch or no ports selected
    if (inputPorts.length !== outputPorts.length || inputPorts.length === 0 || outputPorts.length === 0)
        return null;

    return (
        <button type="button"
                title="Create a bus between selected ports"
                onClick={() => Bus(circuit, outputPorts, inputPorts)}>
            Bus
        </button>
    );
}
