import {Component} from "../models/ioobjects/Component";

import {Switch}       from "../models/ioobjects/inputs/Switch";
import {Button}       from "../models/ioobjects/inputs/Button";
import {ConstantLow}  from "../models/ioobjects/inputs/ConstantLow";
import {ConstantHigh} from "../models/ioobjects/inputs/ConstantHigh";
import {Clock}        from "../models/ioobjects/inputs/Clock";

import {LED} from "../models/ioobjects/outputs/LED";
import {SevenSegmentDisplay} from "../models/ioobjects/outputs/SevenSegmentDisplay";

import {BUFGate} from "../models/ioobjects/gates/BUFGate";
import {ANDGate} from "../models/ioobjects/gates/ANDGate";
import {ORGate}  from "../models/ioobjects/gates/ORGate";
import {XORGate} from "../models/ioobjects/gates/XORGate";

import {DLatch}  from "../models/ioobjects/latches/DLatch";
import {SRLatch} from "../models/ioobjects/latches/SRLatch";

import {DFlipFlop}  from "../models/ioobjects/flipflops/DFlipFlop";
import {JKFlipFlop} from "../models/ioobjects/flipflops/JKFlipFlop";
import {SRFlipFlop} from "../models/ioobjects/flipflops/SRFlipFlop";
import {TFlipFlop}  from "../models/ioobjects/flipflops/TFlipFlop";

import {Encoder}       from "../models/ioobjects/other/Encoder";
import {Decoder}       from "../models/ioobjects/other/Decoder";
import {Multiplexer}   from "../models/ioobjects/other/Multiplexer";
import {Demultiplexer} from "../models/ioobjects/other/Demultiplexer";
import {Label}         from "../models/ioobjects/other/Label";
import {WirePort}      from "../models/ioobjects/other/WirePort";

const INPUTS    = [Switch, Button, ConstantLow, ConstantHigh, Clock];
const OUTPUTS   = [LED, SevenSegmentDisplay];
const GATES     = [BUFGate, ANDGate, ORGate, XORGate];
const LATCHES   = [DLatch, SRLatch];
const FLIPFLOPS = [DFlipFlop, JKFlipFlop, SRFlipFlop, TFlipFlop];
const OTHER     = [Encoder, Decoder, Multiplexer, Demultiplexer, Label, WirePort];

let XML_COMPONENTS = new Map<string, any>();
let XML_NAMES = new Map<any, string>();

// Helper to add a bunch of types to the COMPONENTS map
function addXMLTypes(types: Array<any>): Array<string> {
    let arr = [];
    for (let type of types) {
        const name = new type().getXMLName();
        XML_COMPONENTS.set(name, type);
        XML_NAMES.set(type, name);
        arr.push(name);
    }
    return arr;
}

const XML_INPUTS    = addXMLTypes(INPUTS);
const XML_OUTPUTS   = addXMLTypes(OUTPUTS);
const XML_GATES     = addXMLTypes(GATES);
const XML_LATCHES   = addXMLTypes(LATCHES);
const XML_FLIPFLOPS = addXMLTypes(FLIPFLOPS);
const XML_OTHER     = addXMLTypes(OTHER);

/**
 * Helper method that creates an object from the
 *  given XML tag
 *
 * @param  val [description]
 * @return     [description]
 */
export function CreateComponentFromXML(tag: string, not: boolean = false): Component {
    if (XML_COMPONENTS.has(tag)) {
        let type = XML_COMPONENTS.get(tag);
        return <Component>(new type(not));
    }
    return undefined;
}

export function GetXMLName(type: any): string {
    return XML_NAMES.get(type);
}

export function GetAllComponentInputXMLNames() {
    return XML_INPUTS.slice();
}
export function GetAllComponentOutputXMLNames() {
    return XML_OUTPUTS.slice();
}
export function GetAllComponentGateXMLNames() {
    return XML_GATES.slice();
}
export function GetAllComponentLatchXMLNames() {
    return XML_LATCHES.slice();
}
export function GetAllComponentFlipFlopXMLNames() {
    return XML_FLIPFLOPS.slice();
}
export function GetAllComponentOtherXMLNames() {
    return XML_OTHER.slice();
}

export function GetAllComponentInputs() {
    return INPUTS.slice();
}
export function GetAllComponentOutputs() {
    return OUTPUTS.slice();
}
export function GetAllComponentGates() {
    return GATES.slice();
}
export function GetAllComponentLatches() {
    return LATCHES.slice();
}
export function GetAllComponentFlipFlops() {
    return FLIPFLOPS.slice();
}
export function GetAllComponentOthers() {
    return OTHER.slice();
}
