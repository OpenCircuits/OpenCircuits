import {CreateComponentFromXML} from "../../../digital/ts/utils/ComponentFactory";

import {Graph} from "math/Graph";

import {XMLNode} from "core/utils/io/xml/XMLNode";

import {IOObject} from "core/models/IOObject";
import {Component} from "core/models/Component";
import {ICData} from "../../../digital/ts/models/ioobjects/other/ICData";
import {IC} from "../../../digital/ts/models/ioobjects/other/IC";

import {Port} from "../models/ports/Port";
import {InputPort} from "../../../digital/ts/models/ports/InputPort";
import {OutputPort} from "../../../digital/ts/models/ports/OutputPort";
import {Wire} from "../models/Wire";

import {DigitalNode} from "../../../digital/ts/models/ioobjects/other/DigitalNode";
import {DigitalComponent} from "digital/models/DigitalComponent";
import {DigitalWire} from "digital/models/DigitalWire";
import {Node} from "core/models/Node";

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
export abstract class IOObjectSet {
    protected wires: Wire[];

    public constructor(set: IOObject[]) {
        this.wires = set.filter(o => o instanceof Wire) as Wire[];
    }

    public abstract getComponents(): Component[];

    public getWires(): Wire[] {
        return this.wires.slice(); // Shallow copy
    }

    public toList(): IOObject[] {
        return (<IOObject[]>this.getComponents()).concat(this.wires);
    }
}
export class DigitalObjectSet extends IOObjectSet {
    protected wires: DigitalWire[];

    private inputs:  DigitalComponent[];
    private outputs: DigitalComponent[];
    private others:  DigitalComponent[];

    public constructor(set: IOObject[]) {
        super(set);

        this.inputs  = [];
        this.outputs = [];
        this.others  = [];

        // Filter out inputs and outputs
        const objs = set.filter(o => o instanceof DigitalComponent) as DigitalComponent[];
        for (const obj of objs) {
            // Input => >0 output ports and 0 input ports
            if (obj.numInputs() == 0 && obj.numOutputs() > 0)
                this.inputs.push(obj);
            // Output => >0 input ports and 0 output ports
            else if (obj.numInputs() > 0 && obj.numOutputs() == 0)
                this.outputs.push(obj);
            // Component => neither just input or output
            else
                this.others.push(obj);
        }
    }

    // TODO: Remove, this is bad (ICData 228)
    public setInputs(inputs: DigitalComponent[]): void {
        this.inputs = inputs;
    }
    // TODO: Remove, this is bad (ICData 229)
    public setComponents(comps: DigitalComponent[]): void {
        this.others = comps;
    }

    public getWires(): DigitalWire[] {
        return this.wires.slice(); // Shallow copy
    }

    public getInputs(): DigitalComponent[] {
        return this.inputs.slice(); // Shallow Copy
    }

    public getOutputs(): DigitalComponent[] {
        return this.outputs.slice(); // Shallow Copy
    }

    public getOthers(): DigitalComponent[] {
        return this.others.slice(); // Shallow Copy
    }

    public getComponents(): DigitalComponent[] {
        return this.inputs.concat(this.outputs, this.others);
    }
}
// export class AnalogObjectSet extends IOObjectSet<AnalogComponent> {

// }




/**
 * Helper method to create and connect a wire between two Ports
 *
 * @param  p1 The output port
 * @param  p2 The input port (must not have a connection already)
 * @return    The new wire connecting the two ports
 */
export function CreateWire(p1: Port, p2: Port): Wire {
    // Make wire
    const wire = new Wire(p1, p2);

    // Connect ports to wire
    p1.connect(wire);
    p2.connect(wire);

    return wire;
}

// /**
//  * Helper function to connect two components at the given
//  *  port indices
//  *
//  * @param  c1 The "output" component
//  * @param  i1 The index relating to the output ports of c1
//  * @param  c2 The "input" component
//  * @param  i2 The index relating to the input ports of c2
//  * @return    The wire connecting the two components
//  */
// export function Connect(c1: Component, i1: number, c2: Component, i2: number): Wire {
//     return CreateWire(c1.getOutputPort(i1), c2.getInputPort(i2));
// }

/**
 * Helper function to retrieve a list of all the Input/Output ports
 *  from the given list of objects/wires
 *
 * @param  objects The list of objects to get ports from
 * @return    All the ports attached to the given list of objects
 */
export function GetAllPorts(objs: Component[]): Port[] {
    return objs.map((o) => o.getPorts()).reduce((acc, ports) => acc = acc.concat(ports), []);
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
export function CreateGroup(objects: Array<IOObject>): DigitalObjectSet {
    const group = new DigitalObjectSet(objects);

    let wires = group.getWires();

    // Gather all connecting wires
    const objs = group.getComponents();
    for (const obj of objs) {
        // Only get wires that connect to other components in objects
        wires = wires.concat(
            obj.getOutputs().filter((w) => objs.includes(w.getOutputComponent() as DigitalComponent)));
    }

    return new DigitalObjectSet((<IOObject[]>objs).concat(wires));
}

/**
 * Get's all the wires/WirePorts going out from this wire
 *
 * @param  w The wire to start from
 * @return   The array of wires/WirePorts in this path (incuding w)
 */
export function GetPath(w: DigitalWire): Array<DigitalWire | DigitalNode> {
    const path: Array<DigitalWire | DigitalNode> = [];

    // Go to beginning of path
    let i = w.getP1Component();
    while (i instanceof DigitalNode) {
        w = i.getInputs()[0];
        i = w.getP1Component();
    }

    path.push(w);

    // Outputs
    let o = w.getP2Component();
    while (o instanceof DigitalNode) {
        // Push the wireport and next wire
        path.push(o);
        path.push(w = o.getOutputs()[0]);
        o = w.getP2Component();
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
export function GetAllPaths(obj: DigitalComponent): Array<DigitalWire | DigitalNode> {
    let path: Array<DigitalWire | DigitalNode> = [];

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
export function GatherGroup(objects: IOObject[]): DigitalObjectSet {
    const group = new DigitalObjectSet(objects);

    // Gather all connecting paths
    let wires = group.getWires();
    let components = group.getComponents();
    for (const obj of objects) {
        const path = (obj instanceof DigitalWire ? GetPath(obj) : GetAllPaths(obj as DigitalComponent));

        // Add wires and wireports
        wires      = wires.concat(
                                path.filter((o) => o instanceof DigitalWire && !wires.includes(o))      as DigitalWire[]);
        components = components.concat(
                                path.filter((o) => o instanceof DigitalNode && !components.includes(o)) as DigitalNode[])
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
export function CreateGraph(groups: DigitalObjectSet): Graph<number, number> {
    const graph = new Graph<number, number>();

    const objs = groups.getComponents();
    const wires = groups.getWires();
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

export function Connect(c1: DigitalComponent, i1: number, c2: DigitalComponent, i2: number): DigitalWire {
    return new DigitalWire(c1.getOutputPort(i1), c2.getInputPort(i2));
}

/**
 * Copies a group of objects including connections that are
 *  present within the objects
 *
 * @param  objects [description]
 * @return         [description]
 */
export function CopyGroup(objects: IOObject[] | DigitalObjectSet): DigitalObjectSet {
    // Separate out the given objects
    const groups = (objects instanceof DigitalObjectSet) ? (objects) : (CreateGroup(objects));
    const objs = groups.getComponents();
    const wires = groups.getWires();

    const graph: Graph<number, number> = CreateGraph(groups);

    // Copy components
    const copies: DigitalComponent[] = [];
    for (const obj of objs)
        copies.push(obj.copy());


    // Copy connections
    const wireCopies: Wire[] = [];
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

            const wire = Connect(c1, i1, c2, i2);
            w.copyInto(wire); // Copy properties
            wireCopies.push(wire);
        }
    }

    const group = copies as IOObject[];
    return new DigitalObjectSet(group.concat(wireCopies));
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
export function SaveGroup(node: XMLNode, objects: DigitalComponent[], wires: DigitalWire[], icIdMap: Map<ICData, number>): void {
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
            const input = iPort.getParent() as DigitalComponent;

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
            const input = oPort.getParent() as DigitalComponent;

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
export function LoadGroup(node: XMLNode, icIdMap: Map<number, ICData>): DigitalObjectSet {
    const objectsNode = node.findChild("objects");
    const wiresNode   = node.findChild("wires");
    const idMap = new Map<number, DigitalComponent>();

    const objects: Array<IOObject> = [];
    const wires: Array<Wire> = [];

    // Load components
    const objectNodes = objectsNode.getChildren();
    for (const object of objectNodes) {
        const uid = object.getIntAttribute("uid");

        // Create and add object
        let obj: DigitalComponent;
        if (object.getTag() == "ic") {
            const icid = object.getIntAttribute("icid");
            const icData = icIdMap.get(icid);
            obj = new IC(icData);
        } else {
            obj = CreateComponentFromXML(object.getTag()) as DigitalComponent;
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

    return new DigitalObjectSet(objects.concat(wires));
}
