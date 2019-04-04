import {GetAllComponentInputXMLNames,
        GetAllComponentOutputXMLNames,
        GetXMLName} from "../ComponentFactory";

import {XMLReader} from "./xml/XMLReader";
import {XMLNode} from "./xml/XMLNode";

import {ConstantLow}  from "../../models/ioobjects/inputs/ConstantLow";
import {ConstantHigh} from "../../models/ioobjects/inputs/ConstantHigh";
import {BUFGate} from "../../models/ioobjects/gates/BUFGate";
import {ANDGate} from "../../models/ioobjects/gates/ANDGate";
import {ORGate}  from "../../models/ioobjects/gates/ORGate";
import {XORGate} from "../../models/ioobjects/gates/XORGate";

function FixGroup(objs: XMLNode, wiresNode: XMLNode): void {

    const objNodes = objs.getChildren();
    const wireNodes = wiresNode.getChildren();

    // Replace old tags with updated ones
    objs.replaceChildrenWithName("constantlow",  GetXMLName(ConstantLow));
    objs.replaceChildrenWithName("constanthigh", GetXMLName(ConstantHigh));

    objs.replaceChildrenWithName("bufgate", GetXMLName(BUFGate));
    objs.replaceChildrenWithName("buffergate", GetXMLName(BUFGate));
    objs.replaceChildrenWithName("andgate", GetXMLName(ANDGate));
    objs.replaceChildrenWithName("orgate",  GetXMLName(ORGate));
    objs.replaceChildrenWithName("xorgate", GetXMLName(XORGate));

    objs.replaceChildrenWithName("inputcount", "inputs", true);
    objs.replaceChildrenWithName("outputcount", "outputs", true);

    objs.replaceChildrenWithName("icuid", "icid", true);

    wiresNode.replaceChildrenWithName("bezier", "curve", true);

    // Add name attribute
    for (let objNode of objs.getChildren()) {
        console.log(objNode);
        if (!objNode.hasAttribute("name"))
            objNode.addAttribute("name", objNode.getTag());
    }

    // Normalize IDs
    let idCount = 0;
    let idWireNodes = wiresNode.findChildrenWithAttribute("uid", true);

    // Collect all IDs and ID nodes
    for (let objNode of objNodes) {
        let id = objNode.getIntAttribute("uid");

        // Collect nodes with id
        for (let i = 0; i < idWireNodes.length; i++) {
            let node = idWireNodes[i];
            if (node.getTag() != "wire" && node.getIntAttribute("uid") == id) {
                node.setAttribute("uid", idCount);
                idWireNodes.splice(i, 1);
                i--;
            }
        }
        idCount++;
    }

    for (let wireNode of wireNodes) {
        // Add name attribute
        if (!wireNode.hasAttribute("name"))
            wireNode.addAttribute("name", "Wire");

        wireNode.replaceChildrenWithName("connection", "output");
    }
}

export function ResolveVersionConflict(reader: XMLReader): void {
    const root = reader.getRoot();
    root.replaceChildrenWithName("ics", "icdata");

    const objs = root.findChild("objects");
    const wiresNode = root.findChild("wires");
    const icsNode = (root.findChild("icdata") || root.createChild("icdata"));

    const icNodes = (icsNode ? icsNode.getChildren() : []);

    // Fix ICs
    for (let icNode of icNodes) {
        icNode.replaceChildrenWithName("icuid", "icid");
        icNode.replaceChildrenWithName("width",  "sizex");
        icNode.replaceChildrenWithName("height", "sizey");

        icNode.replaceChildrenWithName("iports", "inputs");
        icNode.replaceChildrenWithName("oports", "outputs");

        icNode.replaceChildrenWithName("components", "circuit");

        const circuitNode = icNode.findChild("circuit");
        FixGroup(circuitNode.findChild("objects"), circuitNode.findChild("wires"));

        // Find names of each input node
        const inputXMLs  = GetAllComponentInputXMLNames();
        const outputXMLs = GetAllComponentOutputXMLNames();

        const inputNodes = icNode.findChild("inputs").getChildren();
        const outputNodes = icNode.findChild("outputs").getChildren();
        const components = icNode.findChild("circuit").findChild("objects").getChildren();

        console.log(components);
        console.log(inputNodes);
        console.log(outputNodes);

        let i = 0, j = 0, k = 0;
        while (k < components.length) {
            const tag = components[k].getTag();
            const name = components[k].getAttribute("name");

            console.log(name + ", " + tag);
            console.log(i + "," + j + "," + k);

            // Check if object is an input or output, and set name
            if (inputXMLs.includes(tag))
                inputNodes[i++].setAttribute("name", name);
            else if (outputXMLs.includes(tag))
                outputNodes[j++].setAttribute("name", name);

            k++;
        }

        console.log(icNode);
    }

    FixGroup(objs, wiresNode);

    console.log(objs);
}
