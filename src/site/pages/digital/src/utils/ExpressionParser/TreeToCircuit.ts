import {InputTree} from "./Constants/DataStructures";

import {CreateCircuit, DigitalCircuit} from "digital/public";
import {V}                             from "Vector";
import {Component}                     from "core/public";


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
 * @see TreeToCircuit
 */
function treeToCircuitCore(node: InputTree, inputs: Map<string, Component>, circuit: DigitalCircuit):
    Component {
    if (node.kind === "leaf") { // Rearranges array so thge relevant input is at the end
        const input = inputs.get(node.ident);
        if (!input)
            throw new Error("Input Not Found: \"" + node.ident + "\"");
        return input;
    }

    const ret = circuit;
    const newGate = ((node.kind === "binop" && node.isNot)
                                 ? NegatedTypeToGate[node.type]
                                 : TypeToGate[node.type]);
    const newComp = circuit.placeComponentAt(V(0, 0), newGate);
    const newNode = newComp.firstAvailable("input");
    if (!newNode)
        throw new Error(`Port not found on newly created ${newComp.kind}`);
    if (node.kind === "unop") {
        const prevComp = treeToCircuitCore(node.child, inputs, ret);
        const prevNode = prevComp.firstAvailable("output");
        if (!prevNode)
            throw new Error(`Port not found on returned ${prevComp.kind}`);
        const wire = circuit.connectWire(prevNode, newNode);
        if (!wire)
            throw new Error(`Connection between ${prevComp.kind} and ${newComp.kind} failed`);
    } else if (node.kind === "binop") {
        newComp.setNumPorts("input", node.children.length);
        node.children.forEach((child) => {
            if (!child)
                throw new Error("treeToCircuitCore failed: child was undefined");
            const prevComp = treeToCircuitCore(child, inputs, ret);
            const prevNode = prevComp.firstAvailable("output");
            if (!prevNode)
                throw new Error(`Port not found on returned ${prevComp.kind}`);
            const wire = circuit.connectWire(prevNode, newNode);
            if (!wire)
                throw new Error(`Connection between ${prevComp.kind} and ${newComp.kind} failed`);
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
 * @throws When one of the leaf nodes of the InputTree references an input that is not inputs.
 */
export function TreeToCircuit(tree: InputTree | undefined, inputs: ReadonlyMap<string, string>,
                              output: string): DigitalCircuit {
    const circuit = CreateCircuit();
    if (!tree)
        return circuit;

    const outputComp = circuit.placeComponentAt(V(0, 0), output);
    const outputNode = outputComp.firstAvailable("output");
    if (!outputNode)
        throw new Error(`Port not found on output ${outputComp.kind}`);

    const inputMap = new Map<string, Component>();
    inputs.forEach((input, type) => {
        const c = circuit.placeComponentAt(V(0, 0), type);
        inputMap.set(input, c);
    });

    const finalComp = treeToCircuitCore(tree, inputMap, circuit);

    const finalNode = finalComp.firstAvailable("output");
    if (!finalNode)
        throw new Error(`Port not found on output ${finalComp.kind}`);

    const wire = circuit.connectWire(finalNode, outputNode);
    if (!wire)
        throw new Error(`Connection between ${finalComp.kind} and ${outputComp.kind} failed`);

    return circuit;
}
