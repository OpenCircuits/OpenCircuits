import {Component} from "../models/ioobjects/Component";

import {Switch} from "../models/ioobjects/inputs/Switch";

import {LED} from "../models/ioobjects/outputs/LED";

import {BUFGate} from "../models/ioobjects/gates/BUFGate";
import {ANDGate} from "../models/ioobjects/gates/ANDGate";
import {ORGate}  from "../models/ioobjects/gates/ORGate";
import {XORGate} from "../models/ioobjects/gates/XORGate";

import {DFlipFlop}  from "../models/ioobjects/flipflops/DFlipFlop";
import {JKFlipFlop} from "../models/ioobjects/flipflops/JKFlipFlop";
import {SRFlipFlop} from "../models/ioobjects/flipflops/SRFlipFlop";
import {TFlipFlop}  from "../models/ioobjects/flipflops/TFlipFlop";

let COMPONENTS = new Map<string, any>();

// Helper to add a bunch of types to the COMPONENTS map
function addTypes(types: Array<any>) {
    for (let type of types)
        COMPONENTS.set(new type().getXMLName(), type);
}

addTypes([Switch]);
addTypes([LED]);
addTypes([BUFGate, ANDGate, ORGate, XORGate]);
addTypes([DFlipFlop, JKFlipFlop, SRFlipFlop, TFlipFlop]);

/**
 * Helper method that creates an object from the
 *  given XML tag
 *
 * @param  val [description]
 * @return     [description]
 */
export function CreateComponentFromXML(tag: string): Component {
    if (COMPONENTS.has(tag)) {
        let type = COMPONENTS.get(tag);
        return <Component>(new type());
    }
    return undefined;
}
