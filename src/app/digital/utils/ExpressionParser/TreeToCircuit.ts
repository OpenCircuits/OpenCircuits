import { IOObject } from "core/models";
import { DigitalComponent } from "digital/models";
import { Create } from "serialeazy";
import { InputTree } from "./Constants/DataStructures";
import { TypeToGate } from "./Constants/Objects";
import { ConnectGate } from "./Utils";


/**
 * Converts a given InputTree to an array of connected components (and the wires used to connect them).
 *  Note that the circuit parameter is edited in place by this function.
 *  Avoid calling this function directly, use TreeToCircuit instead. 
 * 
 * @param node the root node of the InputTree to convert
 * @param inputs the input components used by this expression
 * @param circuit used to store the circuit while recursing, on the intial call it should contain the DigitalComponents found in inputs
 * @returns the current part of the tree that has been converted to a circuit, the most recently used component
 *              should always be last in the array
 * @throws {Error} when one of the leaf nodes of the InputTree references an input that is not inputs
 * @see TreeToCircuit
 */
 function treeToCircuitCore(node: InputTree, inputs: Map<string, DigitalComponent>, circuit: IOObject[]): IOObject[] {
    if (node.kind === "leaf") { //Rearranges array so thge relevant input is at the end
        if (!inputs.has(node.ident))
            throw new Error("Input Not Found: \"" + node.ident + "\"");
        const index = circuit.indexOf(inputs.get(node.ident));
        circuit.splice(index, 1);
        circuit.push(inputs.get(node.ident));
        return circuit;
    }

    const ret = circuit;
    const newGate = Create<DigitalComponent>(TypeToGate.get(node.type));
    if (node.kind === "unop") {
        const prevNode = treeToCircuitCore(node.child, inputs, ret).slice(-1)[0] as DigitalComponent;
        const wire = ConnectGate(prevNode, newGate);
        ret.push(wire);
    }
    else if (node.kind === "binop") {
        const prevNodeL = treeToCircuitCore(node.lChild, inputs, ret).slice(-1)[0] as DigitalComponent;
        const wireL = ConnectGate(prevNodeL, newGate);
        ret.push(wireL);
        const prevNodeR = treeToCircuitCore(node.rChild, inputs, ret).slice(-1)[0] as DigitalComponent;
        const wireR = ConnectGate(prevNodeR, newGate);
        ret.push(wireR);
    }
    ret.push(newGate);
    return ret;
}

/**
 * Converts a given InputTree to an array of connected components (and the wires used to connect them).
 * 
 * @param node the root node of the InputTree to convert
 * @param inputs the input components used by this expression
 * @param output the component that the circuit outputs to
 * @returns the components and wires converted from the tree
 * @throws {Error} when one of the leaf nodes of the InputTree references an input that is not inputs
 */
export function TreeToCircuit(tree: InputTree, inputs: Map<string, DigitalComponent>, output: DigitalComponent): IOObject[] {
    if (tree === null)
        return [];

    let ret: IOObject[] = Array.from(inputs.values());

    ret = treeToCircuitCore(tree, inputs, ret);
    const wire = ConnectGate(ret.slice(-1)[0] as DigitalComponent, output);
    ret.push(wire);
    ret.push(output);
    return ret;
}