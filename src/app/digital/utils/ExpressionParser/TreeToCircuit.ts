import {Create} from "serialeazy";

import {InputTree, InputTreeBinOpType, InputTreeOpType} from "./Constants/DataStructures";

import {IOObject} from "core/models";

import {LazyConnect} from "digital/utils/ComponentUtils";

import {DigitalComponent} from "digital/models";

import {Gate} from "digital/models/ioobjects/gates/Gate";


/**
 * Used to get the string for the Create funciton from the operation.
 */
export const TypeToGate: Record<InputTreeOpType, string> = {
    "&": "ANDGate",
    "!": "NOTGate",
    "|": "ORGate",
    "^": "XORGate",
}

/**
 * Used to get the string for the Create funciton from the negated operation.
 */
export const NegatedTypeToGate: Record<InputTreeBinOpType, string> = {
    "&": "NANDGate",
    "|": "NORGate",
    "^": "XNORGate",
}

/**
 * Converts a given InputTree to an array of connected components (and the wires used to connect them).
 *  Note that the circuit parameter is edited in place by this function.
 *  Avoid calling this function directly, use TreeToCircuit instead.
 *
 * @param    node    The root node of the InputTree to convert.
 * @param    inputs  The input components used by this expression.
 * @param    circuit Used to store the circuit while recursing, on the intial call it should contain the
 *                   DigitalComponents found in inputs.
 * @returns          The current part of the tree that has been converted to a circuit, the most recently used component
 *                   should always be last in the array.
 * @throws {Error} When one of the leaf nodes of the InputTree references an input that is not inputs.
 * @see TreeToCircuit
 */
function treeToCircuitCore(node: InputTree, inputs: Map<string, DigitalComponent>, circuit: IOObject[]): IOObject[] {
    if (node.kind === "leaf") { // Rearranges array so thge relevant input is at the end
        if (!inputs.has(node.ident))
            throw new Error("Input Not Found: \"" + node.ident + "\"");
        const index = circuit.indexOf(inputs.get(node.ident)!);
        circuit.splice(index, 1);
        circuit.push(inputs.get(node.ident)!);
        return circuit;
    }

    const ret = circuit;
    const newGate = Create<Gate>((node.kind === "binop" && node.isNot)
                                 ? NegatedTypeToGate[node.type]
                                 : TypeToGate[node.type]);
    if (node.kind === "unop") {
        const prevNode = treeToCircuitCore(node.child, inputs, ret).at(-1) as DigitalComponent;
        const wire = LazyConnect(prevNode, newGate);
        ret.push(wire);
    } else if (node.kind === "binop") {
        newGate.setInputPortCount(node.children.length);
        node.children.forEach((child) => {
            if (!child)
                throw new Error("treeToCircuitCore failed: child was undefined");
            const prevNode = treeToCircuitCore(child, inputs, ret).at(-1) as DigitalComponent;
            const wire = LazyConnect(prevNode, newGate);
            ret.push(wire);
        });
    }
    ret.push(newGate);
    return ret;
}

/**
 * Converts a given InputTree to an array of connected components (and the wires used to connect them).
 *
 * @param    tree   The root node of the InputTree to convert or an empty array if tree is null.
 * @param    inputs The input components used by this expression.
 * @param    output The component that the circuit outputs to.
 * @returns         The components and wires converted from the tree.
 * @throws {Error} When one of the leaf nodes of the InputTree references an input that is not inputs.
 */
export function TreeToCircuit(tree: InputTree | undefined, inputs: Map<string, DigitalComponent>,
                              output: DigitalComponent): IOObject[] {
    if (!tree)
        return [];

    let ret: IOObject[] = [...inputs.values()];

    ret = treeToCircuitCore(tree, inputs, ret);
    const wire = LazyConnect(ret.at(-1) as DigitalComponent, output);
    ret.push(wire, output);
    return ret;
}
