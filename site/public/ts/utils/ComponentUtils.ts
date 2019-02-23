import {Graph} from "./math/Graph";

import {IOObject} from "../models/ioobjects/IOObject";
import {Component} from "../models/ioobjects/Component";

import {InputPort} from "../models/ioobjects/InputPort";
import {OutputPort} from "../models/ioobjects/OutputPort";
import {Wire} from "../models/ioobjects/Wire";

/**
 * Helper class to hold different groups of components.
 *
 * The groups are:
 *  Input components  (anything with 0 output ports and >0  input ports)
 *  Output components (anything with 0 input ports  and >0 output ports)
 *  Wires             (wires)
 *  Components        (anything else)
 *
 * Note that .components does NOT contain inputs and outputs
 *  A helper method to get all the components including them
 *  is included as getAllComponents()
 */
export class SeparatedComponentCollection {
    public inputs: Array<Component>;
    public components: Array<Component>;
    public outputs: Array<Component>;
    public wires: Array<Wire>;

    public constructor() {
        this.inputs = new Array<Component>();
        this.components = new Array<Component>();
        this.outputs = new Array<Component>();
        this.wires = new Array<Wire>();
    }

    public getAllComponents(): Array<Component> {
        return this.inputs.concat(this.components, this.outputs);
    }
}

/**
 * Helper method to create and connect a wire between two Ports
 *
 * @param  p1 The output port
 * @param  p2 The input port (must not have a connection already)
 * @return    The new wire connecting the two ports
 */
export function CreateWire(p1: OutputPort, p2: InputPort): Wire {
    if (p2.getInput() != undefined)
        throw new Error("Cannot create Wire! Input port already has an input!");

    // Make wire
    let wire = new Wire(p1, p2);

    // Connect ports to wire
    p1.connect(wire);
    p2.setInput(wire);

    return wire;
}

/**
 * Helper function to connect two components at the given
 *  port indices
 *
 * @param  c1 The "output" component
 * @param  i1 The index relating to the output ports of c1
 * @param  c2 The "input" component
 * @param  i2 The index relating to the input ports of c2
 * @return    The wire connecting the two components
 */
export function Connect(c1: Component, i1: number, c2: Component, i2: number): Wire {
    return CreateWire(c1.getOutputPort(i1), c2.getInputPort(i2));
}

/**
 * Helper method to separate out a group of IOObjects
 *  into a SeparatedComponentCollection class
 *
 * @param  objects The array of objects to sort through
 *                  Must contain valid, defined IOObjects
 * @return         A SeparatedComponentCollection of the
 *                  objects
 */
export function SeparateGroup(objects: Array<IOObject>): SeparatedComponentCollection {
    // Initial group
    let groups = new SeparatedComponentCollection();

    // Sort out each type of object into separate groups
    for (let obj of objects) {
        if (obj instanceof Wire) {
            groups.wires.push(obj);
        } else if (obj instanceof Component) {
            // Input => >0 output ports and 0 input ports
            if (obj.getInputPortCount() == 0 && obj.getOutputPortCount() > 0)
                groups.inputs.push(obj);
            // Output => >0 input ports and 0 output ports
            else if (obj.getInputPortCount() > 0 && obj.getOutputPortCount() == 0)
                groups.outputs.push(obj);
            // Component => neither just input or output
            else
                groups.components.push(obj);
        } else {
            throw new Error("Unknown type: " + obj + " in SeparateGroup.");
        }
    }

    return groups;
}

/**
 * Creates a Separated group from the given list of objects
 *  It differs from SeparateGroup by also retrieving ALL the
 *  wires interconnected within the given components
 *
 * @param  objects The list of objects to separate
 * @return         A SeparatedComponentCollection of the objects
 */
export function CreateGroup(objects: Array<IOObject>): SeparatedComponentCollection {
    let groups = SeparateGroup(objects);
    groups.wires = GetAllWires(groups.getAllComponents());
    return groups;
}

/**
 * Gathers all the wires that connect the given
 *  components
 *
 * @param  objs The array of components
 * @return      An array of connections
 */
export function GetAllWires(objs: Array<Component>): Array<Wire> {
    let wires = new Array<Wire>();

    // Gather all wires that attach objects in the given array
    for (let obj of objs) {
        let wires = obj.getOutputs();
        for (let wire of wires) {
            // Make sure connection is in the array
            if (objs.includes(wire.getOutputComponent()))
                wires.push(wire);
        }
    }

    return wires;
}

/**
 * Helper function to create a directed graph from a given
 *  collection of components
 *
 * The Graph stores Nodes as indices from the
 * groups.getAllComponents() array
 *
 * The edge weights are stored as pairs representing
 * the input index (i1) and the output index (i2) respectively
 *
 * @param  groups The SeparatedComponentCollection of components
 * @return        A graph corresponding to the given circuit
 */
export function CreateGraph(groups: SeparatedComponentCollection): Graph<number, {i1:number, i2:number}> {
    let graph = new Graph<number, {i1:number, i2:number}>();

    let objs = groups.getAllComponents();
    let map = new Map<Component, number>();

    // Create nodes and map
    for (let i = 0; i < objs.length; i++) {
        graph.createNode(i);
        map.set(objs[i], i);
    }

    // Create edges
    for (let j = 0; j < groups.wires.length; j++) {
        let wire = groups.wires[j];
        let c1 = map.get(wire.getInputComponent());
        let c2 = map.get(wire.getOutputComponent());
        let i1 = wire.getInputComponent().getOutputPorts().indexOf(wire.getInput());
        let i2 = wire.getOutputComponent().getInputPorts().indexOf(wire.getOutput());
        let indices = {i1: i1, i2: i2};
        graph.createEdge(c1, c2, indices);
    }

    return graph;
}

/**
 * Copies a group of objects including connections that are
 *  present within the objects
 *
 * @param  objects [description]
 * @return         [description]
 */
export function CopyGroup(objects: Array<IOObject> | SeparatedComponentCollection): SeparatedComponentCollection {
    // Separate out the given objects
    let groups = (objects instanceof SeparatedComponentCollection) ? (objects) : (CreateGroup(objects));
    let objs = groups.getAllComponents();

    let graph: Graph<number, {i1:number, i2:number}> = CreateGraph(groups);

    // Copy components
    let copies: Array<Component> = [];
    for (let i = 0; i < objs.length; i++)
        copies.push(objs[i].copy());


    // Copy connections
    let wireCopies: Array<Wire> = [];
    for (let i of graph.getNodes()) {
        let c1 = copies[i];
        let connections = graph.getConnections(i);

        for (let connection of connections) {
            let j = connection.getTarget();
            let indices = connection.getWeight();
            let c2 = copies[j];

            let wire = Connect(c1, indices.i1,  c2, indices.i2);
            wireCopies.push(wire);
        }
    }

    let group: Array<IOObject> = copies;
    return SeparateGroup(group.concat(wireCopies));
}
