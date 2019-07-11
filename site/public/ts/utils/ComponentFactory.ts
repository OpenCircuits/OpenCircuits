import {Component} from "../models/ioobjects/Component";

import {Switch}       from "../models/ioobjects/inputs/Switch";
import {Button}       from "../models/ioobjects/inputs/Button";
import {ConstantLow}  from "../models/ioobjects/inputs/ConstantLow";
import {ConstantHigh} from "../models/ioobjects/inputs/ConstantHigh";
import {Clock}        from "../models/ioobjects/inputs/Clock";

import {LED} from "../models/ioobjects/outputs/LED";
import {SevenSegmentDisplay} from "../models/ioobjects/outputs/SevenSegmentDisplay";

import {Gate} from "../models/ioobjects/gates/Gate";
import {BUFGate} from "../models/ioobjects/gates/BUFGate";
import {ANDGate} from "../models/ioobjects/gates/ANDGate";
import {ORGate}  from "../models/ioobjects/gates/ORGate";
import {XORGate} from "../models/ioobjects/gates/XORGate";

import {Latch}  from "../models/ioobjects/latches/Latch";
import {DLatch}  from "../models/ioobjects/latches/DLatch";
import {SRLatch} from "../models/ioobjects/latches/SRLatch";

import {FlipFlop}  from "../models/ioobjects/flipflops/FlipFlop";
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

const XML_COMPONENTS = new Map<string, new (...args: unknown[]) => Component>();
const XML_NAMES = new Map<new (...args: unknown[]) => Component, string>();

// Helper to add a bunch of types to the COMPONENTS map
function addXMLTypes(types: Array<new () => Component>): Array<string> {
    const arr = [];
    for (const type of types) {
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
        const type = XML_COMPONENTS.get(tag);
        return new type(not);
    }
    return undefined;
}

export function GetXMLName(type: new (...args: unknown[]) => Component): string {
    return XML_NAMES.get(type);
}

export function GetAllComponentInputXMLNames(): Array<string> {
    return XML_INPUTS.slice();
}
export function GetAllComponentOutputXMLNames(): Array<string> {
    return XML_OUTPUTS.slice();
}
export function GetAllComponentGateXMLNames(): Array<string> {
    return XML_GATES.slice();
}
export function GetAllComponentLatchXMLNames(): Array<string> {
    return XML_LATCHES.slice();
}
export function GetAllComponentFlipFlopXMLNames(): Array<string> {
    return XML_FLIPFLOPS.slice();
}
export function GetAllComponentOtherXMLNames(): Array<string> {
    return XML_OTHER.slice();
}

export function GetAllComponentInputs(): Array<typeof Component> {
    return INPUTS.slice();
}
export function GetAllComponentOutputs(): Array<typeof Component> {
    return OUTPUTS.slice();
}
export function GetAllComponentGates(): Array<typeof Gate> {
    return GATES.slice();
}
export function GetAllComponentLatches(): Array<typeof Latch> {
    return LATCHES.slice();
}
export function GetAllComponentFlipFlops(): Array<typeof FlipFlop> {
    return FLIPFLOPS.slice();
}
export function GetAllComponentOthers(): Array<typeof Component> {
    return OTHER.slice();
}
