import {CreateComponentFromXML} from "digital/utils/ComponentFactory";

import {XMLNode} from "core/utils/io/xml/XMLNode";
import {IOObjectSet} from "core/utils/ComponentUtils";

import {IOObject} from "core/models/IOObject";
import {ICData} from "digital/models/ioobjects/other/ICData";
import {IC} from "digital/models/ioobjects/other/IC";

import {Wire} from "core/models/Wire";

import {DigitalNode} from "digital/models/ioobjects/other/DigitalNode";
import {DigitalComponent} from "digital/models/DigitalComponent";
import {DigitalWire} from "digital/models/DigitalWire";

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
export class DigitalObjectSet extends IOObjectSet {
    protected wires: Set<DigitalWire>;

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
    public setOthers(comps: DigitalComponent[]): void {
        this.others = comps;
    }

    public getWires(): DigitalWire[] {
        return Array.from(this.wires);
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


/**
 * Get's all the wires/WirePorts going out from this wire
 *  Note: this path is UN-ORDERED!
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

    return new DigitalObjectSet((components as IOObject[]).concat(wires));
}

export function Connect(c1: DigitalComponent, i1: number, c2: DigitalComponent, i2: number): DigitalWire {
    const p1 = c1.getOutputPort(i1);
    const p2 = c2.getInputPort(i2);
    const wire = new DigitalWire(p1, p2);
    p1.connect(wire);
    p2.connect(wire);
    return wire;
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
