import {CreateComponentFromXML} from "./ComponentFactory";

import {Graph} from "./math/Graph";

import {XMLNode} from "./io/xml/XMLNode";

import {IOObject} from "../models/ioobjects/IOObject";
import {Component} from "../models/ioobjects/Component";
import {ICData} from "../models/ioobjects/other/ICData";
import {IC} from "../models/ioobjects/other/IC";

import {Port} from "../models/ports/Port";
import {InputPort} from "../models/ports/InputPort";
import {OutputPort} from "../models/ports/OutputPort";
import {Wire} from "../models/ioobjects/Wire";

import {WirePort} from "../models/ioobjects/other/WirePort";

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

    public getEverything(): Array<IOObject> {
        return (<Array<IOObject>>this.getAllComponents()).concat(this.wires);
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
    const wire = new Wire(p1, p2);

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
 * Helper function to retrieve a list of all the Input/Output ports
 *  from the given list of objects/wires
 *
 * @param  objects The list of objects to get ports from
 * @return    All the ports attached to the given list of objects
 */
export function GetAllPorts(objects: Array<Component> | SeparatedComponentCollection): Array<Port> {
    const objs = (objects instanceof Array) ? (objects) : (objects.getAllComponents());

    return objs.map((o) => o.getPorts()).reduce((acc, ports) => acc = acc.concat(ports), []);
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
    const groups = new SeparatedComponentCollection();

    // Sort out each type of object into separate groups
    for (const obj of objects) {
        if (obj instanceof Wire) {
            groups.wires.push(obj);
        } else if (obj instanceof Component) {
            // Input => >0 output ports and 0 input ports
            if (obj.numInputs() == 0 && obj.numOutputs() > 0)
                groups.inputs.push(obj);
            // Output => >0 input ports and 0 output ports
            else if (obj.numInputs() > 0 && obj.numOutputs() == 0)
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
 *  It differs from SeparateGroup by also retrieving all IMMEDIATELY
 *   connected wires that connect to other objects in `objects`
 *
 * Note that this method assumes all the components you want in the group are
 *  provided in `objects` INCLUDING WirePorts, this will not trace down the paths
 *  to get all wires ports. Use GatherGroup(objects) to do this.
 *
 * @param  objects The list of objects to separate
 * @return         A SeparatedComponentCollection of the objects
 */
export function CreateGroup(objects: Array<IOObject>): SeparatedComponentCollection {
    const group = SeparateGroup(objects);

    // Gather all connecting wires
    const objs = group.getAllComponents();
    for (const obj of objs) {
        // Only get wires that connect to other components in objects
        group.wires = group.wires.concat(
            obj.getOutputs().filter((w) => objs.includes(w.getOutputComponent())));
    }

    return group;
}

/**
 * Get's all the wires/WirePorts going out from this wire
 *
 * @param  w The wire to start from
 * @return   The array of wires/WirePorts in this path (incuding w)
 */
export function GetPath(w: Wire): Array<Wire | WirePort> {
    const path: Array<Wire | WirePort> = [];

    // Go to beginning of path
    let i = w.getInputComponent();
    while (i instanceof WirePort) {
        w = i.getInputs()[0];
        i = w.getInputComponent();
    }

    path.push(w);

    // Outputs
    let o = w.getOutputComponent();
    while (o instanceof WirePort) {
        // Push the wireport and next wire
        path.push(o);
        path.push(w = o.getOutputs()[0]);
        o = w.getOutputComponent();
    }

    return path;
}

/**
 * Gathers all wires + wireports in the path from the inputs/outputs
 *  of the given component.
 *
 * @param  obj  The component
 * @return      An array of connections + WirePorts
 */
export function GetAllPaths(obj: Component): Array<Wire | WirePort> {
    let path: Array<Wire | WirePort> = [];

    // Get all paths
    const wires = new Set(obj.getInputs().concat(obj.getOutputs()));
    for (const wire of wires)
        path = path.concat(GetPath(wire).filter((o) => !path.includes(o)));

    return path;
}

/**
 * Creates a Separated group from the given list of objects.
 *  It also retrieves all "paths" going out from each object.
 *
 * @param  objects The list of objects
 * @return         A SeparatedComponentCollection of the objects
 */
export function GatherGroup(objects: Array<IOObject>): SeparatedComponentCollection {
    const group = SeparateGroup(objects);

    // Gather all connecting paths
    for (const obj of objects) {
        const path = (obj instanceof Wire ? GetPath(obj) : GetAllPaths(<Component>obj));

        // Add wires and wireports
        group.wires      = group.wires.concat(
                                <Array<Wire>>    path.filter((o) => o instanceof Wire     && !group.wires.includes(o)));
        group.components = group.components.concat(
                                <Array<WirePort>>path.filter((o) => o instanceof WirePort && !group.components.includes(o)))
    }

    return group;
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
export function CreateGraph(groups: SeparatedComponentCollection): Graph<number, number> {
    const graph = new Graph<number, number>();

    const objs = groups.getAllComponents();
    const wires = groups.wires;
    const map = new Map<Component, number>();

    // Create nodes and map
    for (let i = 0; i < objs.length; i++) {
        graph.createNode(i);
        map.set(objs[i], i);
    }

    // Create edges
    for (let j = 0; j < wires.length; j++) {
        const wire = wires[j];
        const c1 = map.get(wire.getInputComponent());
        const c2 = map.get(wire.getOutputComponent());
        graph.createEdge(c1, c2, j);
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
    const groups = (objects instanceof SeparatedComponentCollection) ? (objects) : (CreateGroup(objects));
    const objs = groups.getAllComponents();
    const wires = groups.wires;

    const graph: Graph<number, number> = CreateGraph(groups);

    // Copy components
    const copies: Array<Component> = [];
    for (const obj of objs)
        copies.push(obj.copy());


    // Copy connections
    const wireCopies: Array<Wire> = [];
    for (const i of graph.getNodes()) {
        const c1 = copies[i];
        const connections = graph.getConnections(i);

        for (const connection of connections) {
            const j = connection.getTarget();
            const c2 = copies[j];

            const w = wires[connection.getWeight()];

            // Find indices of which ports the wire should be connected to
            const i1 = objs[i].getOutputPorts().indexOf(w.getInput());
            const i2 = objs[j].getInputPorts().indexOf(w.getOutput());

            const wire = Connect(c1, i1,  c2, i2);
            w.copyInto(wire); // Copy properties
            wireCopies.push(wire);
        }
    }

    const group: Array<IOObject> = copies;
    return SeparateGroup(group.concat(wireCopies));
}

/**
 * Saves a group of objects to an XML node
 *
 * @param node    The XML parent node
 * @param objects The array of components to save
 * @param wires   The array of wires to save
 * @param icIdMap Map of ICData to unique ids.
 *                Must be created prior to calling this method
 *                  to ensure nested ICs work properly
 */
export function SaveGroup(node: XMLNode, objects: Array<Component>, wires: Array<Wire>, icIdMap: Map<ICData, number>): void {
    const objectsNode = node.createChild("objects");
    const wiresNode   = node.createChild("wires");
    const idMap = new Map<IOObject, number>();

    // Save components
    let id = 0;
    for (const obj of objects) {
        const componentNode = objectsNode.createChild(obj.getXMLName());

        // Save IC ID for ICs
        if (obj instanceof IC) {
            const icid = icIdMap.get(obj.getData());
            componentNode.addAttribute("icid", icid);
        }

        // Set and save XML ID for connections
        componentNode.addAttribute("uid", id);
        idMap.set(obj, id++);

        // Save properties
        obj.save(componentNode);
    }

    // Save wires
    for (const wire of wires) {
        const wireNode = wiresNode.createChild(wire.getXMLName());

        // Save properties
        wire.save(wireNode);

        const inputNode = wireNode.createChild("input");
        {
            const iPort = wire.getInput();
            const input = iPort.getParent();

            // Find index of port
            let iI = 0;
            while (iI < input.numOutputs() &&
                   input.getOutputPort(iI) !== iPort) { iI++; }
            inputNode.addAttribute("uid", idMap.get(input));
            inputNode.addAttribute("index", iI);
        }
        const outputNode = wireNode.createChild("output");
        {
            const oPort = wire.getOutput();
            const input = oPort.getParent();

            // Find index of port
            let iO = 0;
            while (iO < input.numInputs() &&
                   input.getInputPort(iO) !== oPort) { iO++; }
            outputNode.addAttribute("uid", idMap.get(input));
            outputNode.addAttribute("index", iO);
        }
    }
}

/**
 * Load a group of objects from an XML node
 *
 * @param node    The XML parent node
 * @param icIdMap Map of unique ids for ICData.
 *                Must be created prior to calling this method
 *                  to ensure nested ICs work properly
 */
export function LoadGroup(node: XMLNode, icIdMap: Map<number, ICData>): SeparatedComponentCollection {
    const objectsNode = node.findChild("objects");
    const wiresNode   = node.findChild("wires");
    const idMap = new Map<number, Component>();

    const objects: Array<IOObject> = [];
    const wires: Array<Wire> = [];

    // Load components
    const objectNodes = objectsNode.getChildren();
    for (const object of objectNodes) {
        const uid = object.getIntAttribute("uid");

        // Create and add object
        let obj;
        if (object.getTag() == "ic") {
            const icid = object.getIntAttribute("icid");
            const icData = icIdMap.get(icid);
            obj = new IC(icData);
        } else {
            obj = CreateComponentFromXML(object.getTag());
        }

        if (!obj)
            throw new Error("Cannot find component with tag " + object.getTag() + "!");

        objects.push(obj);

        // Add to ID map for connections later
        idMap.set(uid, obj);

        // Load properties
        obj.load(object);
    }

    // Load wires
    const wireNodes = wiresNode.getChildren();
    for (const wire of wireNodes) {
        const inputNode  = wire.findChild("input");
        const outputNode = wire.findChild("output");

        // Load connections
        const inputObj  = idMap.get( inputNode.getIntAttribute("uid"));
        const outputObj = idMap.get(outputNode.getIntAttribute("uid"));
        const inputIndex  =  inputNode.getIntAttribute("index");
        const outputIndex = outputNode.getIntAttribute("index");

        // Create wire
        const w = Connect(inputObj, inputIndex,  outputObj, outputIndex);
        wires.push(w);

        // Load properties
        w.load(wire);
    }

    return SeparateGroup(objects.concat(wires));
}
