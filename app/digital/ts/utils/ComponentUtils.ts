import {CreateComponentFromXML} from "digital/utils/ComponentFactory";

import {XMLNode} from "core/utils/io/xml/XMLNode";
import {IOObjectSet} from "core/utils/ComponentUtils";

import {IOObject} from "core/models/IOObject";
import {ICData} from "digital/models/ioobjects/other/ICData";
import {IC} from "digital/models/ioobjects/other/IC";

import {Wire} from "core/models/Wire";

import {DigitalComponent} from "digital/models/DigitalComponent";
import {DigitalWire} from "digital/models/DigitalWire";

/**
 * Helper class to hold different groups of components.
 *
 * The groups are:
 *  Input components  (anything with 0 output ports and >0  input ports)
 *  Output components (anything with 0 input ports  and >0 output ports)
 *  Wires             (wires)
 *  Other             (anything else)
 *
 * Note that .getComponents() does NOT contain wires
 *  A helper method to get all the components including them
 *  is included as toList()
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
