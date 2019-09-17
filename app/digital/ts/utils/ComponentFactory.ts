import {Component} from "digital/models/ioobjects/Component";

import {Switch}       from "digital/models/ioobjects/inputs/Switch";
import {Button}       from "digital/models/ioobjects/inputs/Button";
import {ConstantLow}  from "digital/models/ioobjects/inputs/ConstantLow";
import {ConstantHigh} from "digital/models/ioobjects/inputs/ConstantHigh";
import {Clock}        from "digital/models/ioobjects/inputs/Clock";

import {LED} from "digital/models/ioobjects/outputs/LED";
import {SevenSegmentDisplay} from "digital/models/ioobjects/outputs/SevenSegmentDisplay";

import {Gate}    from "digital/models/ioobjects/gates/Gate";
import {BUFGate} from "digital/models/ioobjects/gates/BUFGate";
import {ANDGate} from "digital/models/ioobjects/gates/ANDGate";
import {ORGate}  from "digital/models/ioobjects/gates/ORGate";
import {XORGate} from "digital/models/ioobjects/gates/XORGate";

import {Latch}   from "digital/models/ioobjects/latches/Latch";
import {DLatch}  from "digital/models/ioobjects/latches/DLatch";
import {SRLatch} from "digital/models/ioobjects/latches/SRLatch";

import {FlipFlop}   from "digital/models/ioobjects/flipflops/FlipFlop";
import {DFlipFlop}  from "digital/models/ioobjects/flipflops/DFlipFlop";
import {JKFlipFlop} from "digital/models/ioobjects/flipflops/JKFlipFlop";
import {SRFlipFlop} from "digital/models/ioobjects/flipflops/SRFlipFlop";
import {TFlipFlop}  from "digital/models/ioobjects/flipflops/TFlipFlop";

import {Encoder}       from "digital/models/ioobjects/other/Encoder";
import {Decoder}       from "digital/models/ioobjects/other/Decoder";
import {Multiplexer}   from "digital/models/ioobjects/other/Multiplexer";
import {Demultiplexer} from "digital/models/ioobjects/other/Demultiplexer";
import {Label}         from "digital/models/ioobjects/other/Label";
import {WirePort}      from "digital/models/ioobjects/other/WirePort";

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
