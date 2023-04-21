import {InputTree} from "./Constants/DataStructures";

import {CreateCircuit, DigitalCircuit}    from "digital/public";
import {V}                                from "Vector";
import {Component, Port}                  from "core/public";
import {Err, ErrE, Ok, Result,ResultUtil} from "core/utils/Result";


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

function connect(prevComp: Component, newNode: Port, newComp: Component): Result<Component> {
    const prevNode = prevComp.firstAvailable("output");
    if (!prevNode)
        return ErrE(`Port not found on returned ${prevComp.kind}`);
    const wire = prevNode.connectTo(newNode);
    if (!wire)
        return ErrE(`Connection between ${prevComp.kind} and ${newComp.kind} failed`);
    return Ok(newComp);
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
 *                In the case of error, then an error will be returned indicating one of the following:
 *                - When one of the leaf nodes of the InputTree references an input that is not inputs.
 * @see TreeToCircuit
 */
function treeToCircuitCore(node: InputTree, inputs: Map<string, Component>, circuit: DigitalCircuit):
    Result<Component> {
    if (node.kind === "leaf") {
        const input = inputs.get(node.ident);
        if (!input)
            return ErrE("Input Not Found: \"" + node.ident + "\"");
        return Ok(input);
    }

    const ret = circuit;
    const newGate = ((node.kind === "binop" && node.isNot)
                                 ? NegatedTypeToGate[node.type]
                                 : TypeToGate[node.type]);
    const newComp = circuit.placeComponentAt(V(0, 0), newGate);
    const newNode = newComp.firstAvailable("input");
    if (!newNode)
        return ErrE(`Port not found on newly created ${newComp.kind}`);
    if (node.kind === "unop") {
        return treeToCircuitCore(node.child, inputs, ret)
            .andThen((prevComp) => connect(prevComp, newNode, newComp));
    } else if (node.kind === "binop") {
        newComp.setNumPorts("input", node.children.length);
        const outer = ResultUtil.mapIter(node.children.values(), (child): Result<Component> => {
            if (!child)
                return ErrE("treeToCircuitCore failed: child was undefined");
            return treeToCircuitCore(child, inputs, ret)
                .andThen((prevComp) => connect(prevComp, newNode, newComp));
        });
        return outer.ok ? Ok(newComp) : Err(outer.errToOption().unwrap());
    }

    return Ok(newComp);
}

/**
 * Converts a given InputTree to an array of connected components (and the wires used to connect them).
 *
 * @param tree   The root node of the InputTree to convert or an empty array if tree is null.
 * @param inputs The input components used by this expression.
 * @param output The component that the circuit outputs to.
 * @returns      The components and wires converted from the tree.
 *               In the case of error, then an error will be returned indicating one of the following:
 *               - When one of the leaf nodes of the InputTree references an input that is not inputs.
 */
export function TreeToCircuit(tree: InputTree | undefined, inputs: ReadonlyMap<string, string>,
                              output: string): Result<DigitalCircuit> {
    const circuit = CreateCircuit();
    if (!tree)
        return Ok(circuit);

    const outputComp = circuit.placeComponentAt(V(0, 0), output);
    const outputNode = outputComp.firstAvailable("output");
    if (!outputNode)
        return ErrE(`Port not found on output ${outputComp.kind}`);

    const inputMap = new Map<string, Component>();
    inputs.forEach((input, type) => {
        const c = circuit.placeComponentAt(V(0, 0), type);
        inputMap.set(input, c);
    });

   treeToCircuitCore(tree, inputMap, circuit)
        .andThen((prevComp) => connect(prevComp, outputNode, outputComp));

    return Ok(circuit);
}
