import {InputTree} from "./Constants/DataStructures";

import {CreateCircuit, DigitalCircuit} from "digital/api/circuit/public";
import {DigitalComponent} from "digital/api/circuit/public/DigitalComponent";
import {DigitalPort} from "digital/api/circuit/public/DigitalPort";
import {DigitalCircuitState} from "digital/api/circuit/public/impl/DigitalCircuitState";
import {V} from "Vector";


/**
 * Used to get the string for the Create funciton from the operation.
 */
export const TypeToGate = {
    "&": "ANDGate",
    "!": "NOTGate",
    "|": "ORGate",
    "^": "XORGate",
} as const;

/**
 * Used to get the string for the Create funciton from the negated operation.
 */
export const NegatedTypeToGate = {
    "&": "NANDGate",
    "|": "NORGate",
    "^": "XNORGate",
} as const;

/**
 * Connects the first available output port on `prevComp` to the `newNode` on `newComp`.
 *
 * @param prevComp The component to connect the output of.
 * @param newNode  First available `inputs` port on `newComp`.
 * @param newComp  The component to connect the input of, only used for error message and return value.
 * @throws If no output port found on `prevComp`.
 * @throws If wire failed to create connecting `prevComp` to `newNode`.
 */
function connect(prevComp: DigitalComponent, newNode: DigitalPort, newComp: DigitalComponent) {
    const prevNode = prevComp.firstAvailable("outputs");
    if (!prevNode)
        throw new Error(`Port not found on returned ${prevComp.kind}`);
    const wire = prevNode.connectTo(newNode);
    if (!wire)
        throw new Error(`Connection between ${prevComp.kind} and ${newComp.kind} failed`);
}

/**
 * Converts a given InputTree to an array of connected components (and the wires used to connect them).
 *  Note that the circuit parameter is edited in place by this function.
 *  Avoid calling this function directly, use TreeToCircuit instead.
 *
 * @param node    The root node of the InputTree to convert.
 * @param inputs  The input components used by this expression.
 * @param circuit Used to store the circuit while recursing, on the intial call it should contain the
 *                DigitalComponents found in inputs.
 * @returns       The current part of the tree that has been converted to a circuit, the most recently used component
 *                should always be last in the array.
 * @throws When one of the leaf nodes of the InputTree references an input that is not inputs.
 * @throws If any connections fail.
 * @see TreeToCircuit
 */
function treeToCircuitCore(node: InputTree, inputs: Map<string, DigitalComponent>, circuit: DigitalCircuit):
    DigitalComponent {
    if (node.kind === "leaf") {
        const input = inputs.get(node.ident);
        if (!input)
            throw new Error("Input Not Found: \"" + node.ident + "\"");
        return input;
    }

    const ret = circuit;
    const newGate = ((node.kind === "binop" && node.isNot)
                                 ? NegatedTypeToGate[node.type]
                                 : TypeToGate[node.type]);
    const newComp = circuit.placeComponentAt(newGate, V(0, 0));
    if (node.kind === "unop") {
        const prevComp = treeToCircuitCore(node.child, inputs, ret);
        const newNode = newComp.firstAvailable("inputs");
        if (!newNode)
            throw new Error(`Port not found on newly created ${newComp.kind}`);
        connect(prevComp, newNode, newComp);
    } else if (node.kind === "binop") {
        newComp.setNumPorts("inputs", node.children.length);
        node.children.forEach((child) => {
            if (!child)
                throw new Error("treeToCircuitCore failed: child was undefined");
            const prevComp = treeToCircuitCore(child, inputs, ret);
            const newNode = newComp.firstAvailable("inputs");
            if (!newNode)
                throw new Error(`Port not found on newly created ${newComp.kind}`);
            connect(prevComp, newNode, newComp);
        });
    }

    return newComp;
}

/**
 * Converts a given InputTree to an array of connected components (and the wires used to connect them).
 *
 * @param tree   The root node of the InputTree to convert or an empty array if tree is null.
 * @param inputs The input components used by this expression.
 * @param output The component that the circuit outputs to.
 * @returns      The components and wires converted from the tree.
 * @throws If `output` indicates a component without an input port.
 * @throws When one of the leaf nodes of the InputTree references an input that is not inputs.
 * @throws If any connections fail.
 */
export function TreeToCircuit(tree: InputTree, inputs: ReadonlyMap<string, string>,
                              output: string): [DigitalCircuit, DigitalCircuitState] {
    const [circuit, state] = CreateCircuit();

    const outputComp = circuit.placeComponentAt(output, V(0, 0));
    outputComp.name = "Output";
    const outputNode = outputComp.firstAvailable("inputs");
    if (!outputNode)
        throw new Error(`Input port not found on output ${outputComp.kind}`);

    const inputMap = new Map<string, DigitalComponent>();
    inputs.forEach((type, input) => {
        const c = circuit.placeComponentAt(type, V(0, 0));
        c.name = input;
        inputMap.set(input, c);
    });

    const prevComp = treeToCircuitCore(tree, inputMap, circuit);
    connect(prevComp, outputNode, outputComp);

    return [circuit, state];
}
