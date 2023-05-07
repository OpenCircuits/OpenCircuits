import {Graph}     from "math/Graph";
import {Component} from "./Component";
import {Port}      from "./Port";
import {Wire}      from "./Wire";
import {Circuit}   from "./Circuit";


export const isObjComponent = <
    ComponentT extends Component = Component,
    WireT extends Wire = Wire,
    PortT extends Port = Port,
>(obj: ComponentT | WireT | PortT): obj is ComponentT => (obj.baseKind === "Component");


export const isObjWire = <
    ComponentT extends Component = Component,
    WireT extends Wire = Wire,
    PortT extends Port = Port,
>(obj: ComponentT | WireT | PortT): obj is WireT => (obj.baseKind === "Wire");


export const isObjPort = <
    ComponentT extends Component = Component,
    WireT extends Wire = Wire,
    PortT extends Port = Port,
>(obj: ComponentT | WireT | PortT): obj is PortT => (obj.baseKind === "Port");
export const isObjComponent = (obj: Obj): obj is Component => (obj.baseKind === "Component");
export const isObjWire      = (obj: Obj): obj is Wire      => (obj.baseKind === "Wire");
export const isObjPort = (obj: Obj): obj is Port => (obj.baseKind === "Port");

// TODO[model_refactor_api_expr_to_circ](trevor) Is this the right place? Check for circular dependencies.
/**
 * This function converts the provided circuit to a graph where the nodes are components and edges are wires.
 * Both are represented by guids rather than object references.
 *
 * @param circuit The circuit to convert to a graph.
 * @returns       The provided circuit as a graph.
 */
export function CreateGraph(circuit: Circuit): Graph<string, string> {
    const graph = new Graph<string, string>();

    // TODO[model_refactor_api_expr_to_circ](trevor): Replace with getComponents and getWires functions on Circuit
    const objs = circuit.getObjs().filter((obj) => (isObjComponent(obj)));
    for (const obj of objs) {
        graph.createNode(obj.id);
    }
    const wires = circuit.getObjs().filter((obj) => (isObjWire(obj))) as readonly Wire[];
    for (const wire of wires) {
        graph.createEdge(wire.p1.parent.id, wire.p2.parent.id, wire.id);
    }

    return graph;
}
