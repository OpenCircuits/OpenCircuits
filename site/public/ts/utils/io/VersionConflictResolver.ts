import {XMLReader} from "./xml/XMLReader";
import {XMLNode} from "./xml/XMLNode";
import {GetXMLName} from "../ComponentFactory";

import {BUFGate} from "../../models/ioobjects/gates/BUFGate";
import {ANDGate} from "../../models/ioobjects/gates/ANDGate";
import {ORGate}  from "../../models/ioobjects/gates/ORGate";
import {XORGate} from "../../models/ioobjects/gates/XORGate";

export function ResolveVersionConflict(reader: XMLReader): void {
    let objs = reader.getRoot().findChild("objects");
    let wiresNode = reader.getRoot().findChild("wires");

    let objNodes = objs.getChildren();
    let wireNodes = wiresNode.getChildren();


    // Replace old tags with updated ones
    objs.replaceChildrenWithName("bufgate", GetXMLName(BUFGate));
    objs.replaceChildrenWithName("andgate", GetXMLName(ANDGate));
    objs.replaceChildrenWithName("orgate",  GetXMLName(ORGate));
    objs.replaceChildrenWithName("xorgate", GetXMLName(XORGate));

    objs.replaceChildrenWithName("inputcount", "inputs", true);
    objs.replaceChildrenWithName("outputcount", "outputs", true);

    wiresNode.replaceChildrenWithName("bezier", "curve", true);


    // Normalize IDs
    let idCount = 0;
    let idWireNodes = wiresNode.findChildrenWithAttribute("uid", true);

    // Collect all IDs and ID nodes
    for (let objNode of objNodes) {
        let id = objNode.getIntAttribute("uid");
        let arr: Array<XMLNode> = [];
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
