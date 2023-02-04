import {ErrE, Ok, OkVoid, Result, ResultUtil} from "core/utils/Result";

import {Prop, uuid}                                          from "core/internal";
import {ComponentInfo, ObjInfo, ObjInfoProvider, PortConfig} from "core/internal/impl/ComponentInfo";
import {Port}                                                from "core/schema/Port";


type DigitalPortConfig = Record<string, number>

type DigitalPortGroupInfo = Record<string, "input" | "output">

type TypeMap = Record<string, "string" | "number" | "boolean">;

export class DigitalComponentInfo implements ComponentInfo {
    public readonly baseKind: "Component";
    public readonly kind: string;
    public readonly defaultPortConfig: PortConfig;
    public readonly portGroups: string[];

    public readonly portGroupInfo: DigitalPortGroupInfo;
    private readonly validPortConfigs: PortConfig[];
    private readonly props: TypeMap;

    public constructor(
        kind: string,
        props: TypeMap,
        portGroupInfo: DigitalPortGroupInfo,
        portConfigs: DigitalPortConfig[],
        defaultConfig = 0
    ) {
        this.kind = kind;
        this.props = { ...props, "name": "string", "x": "number", "y": "number", "angle": "number" };
        this.defaultPortConfig = portConfigs[defaultConfig];
        this.portGroups = Object.keys(portGroupInfo);

        this.portGroupInfo = portGroupInfo;
        this.validPortConfigs = portConfigs;
    }

    public checkPropValue(key: string, value?: Prop): Result {
        if (!(key in this.props))
            return ErrE(`DigitalComponentInfo: ${key} not a valid prop`);
        if (value && (this.props[key] !== typeof value))
            return ErrE(`DigitalComponentInfo: ${key} expected type ${this.props[key]}, got ${typeof value}`);
        return OkVoid();
    }

    public makePortsForConfig(componentID: string, p: PortConfig): Result<Port[]> {
        return Ok(Object.entries(p)
            .flatMap(([group, count]) =>
                new Array(count)
                    .fill(0)
                    .map((_, index) => ({
                        baseKind: "Port",
                        kind:     "DigitalPort",
                        id:       uuid(),

                        parent: componentID,
                        group,
                        index,
                        props:  {}, // TODO: any manditory props for Digial ports
                    }))));
    }

    public checkPortConfig(p: PortConfig): Result {
        // Doesn't have all the port groups
        if (this.portGroups.some((group) => !(group in p)))
            return ErrE(`DigitalComponentInfo: Port config ${p} did not contain all groups ${this.portGroups}`);

        // Return is some valid config matches the given config
        const hasValidConfig = this.validPortConfigs.some((counts) =>
            // Check each port group in the valid config and the given config to see
            //  if the counts all match
            this.portGroups.every((group) => (counts[group] === p[group])));

        return hasValidConfig ? OkVoid() : ErrE(`DigitalComponentInfo: Failed to find matching config for ${p}`);
    }

    public checkPortConnectivity(wires: Map<Port, Port[]>): Result {
        return ResultUtil.reduceIterU(wires.entries(), ([myPort, connectedPorts]): Result<void> =>  {
            // Prevent multiple ports connecting to a single input port
            if (this.portGroupInfo[myPort.group] === "input" && connectedPorts.length > 1)
                return ErrE(`DigitalComponentInfo: Illegal fan-in on input port ${myPort.id}`);
            // TODO: prevent "inputs" from being connected to other "IN" ports and similar.
            return OkVoid();
        });
    }
}


// Inputs
const DigitalOutputComponentInfo = (kind: string, outputs: number[], props: TypeMap = {}) =>
    new DigitalComponentInfo(kind, props, { "outputs": "output" }, outputs.map((amt) => ({ "outputs": amt })));

const SwitchInfo = DigitalOutputComponentInfo("Switch", [1]);
const ButtonInfo = DigitalOutputComponentInfo("Button", [1]);
const ConstantLowInfo    = DigitalOutputComponentInfo("ConstantLow",    [1]);
const ConstantHighInfo   = DigitalOutputComponentInfo("ConstantHigh",   [1]);
const ConstantNumberInfo = DigitalOutputComponentInfo("ConstantNumber", [4], { "inputNum": "number" });
const ClockInfo = DigitalOutputComponentInfo("Clock", [1], { "delay": "number", "paused": "boolean" });

// Outputs
const DigitalInputComponentInfo = (kind: string, inputs: number[], props: TypeMap = {}) =>
    new DigitalComponentInfo(kind, props, { "inputs": "input" }, inputs.map((amt) => ({ "inputs": amt })));

const LEDInfo = DigitalInputComponentInfo("LED", [1], { "color": "string" });
const BCDDisplayInfo     = DigitalInputComponentInfo("BCDDisplay",     [4], { "segmentCount": "number" });
const ASCIIDisplayInfo   = DigitalInputComponentInfo("ASCIIDisplay",   [7], { "segmentCount": "number" });
const SegmentDisplayInfo = DigitalInputComponentInfo("SegmentDisplay", [7,9,14,16]);
const OscilloscopeInfo = DigitalInputComponentInfo(
    "Oscilloscope",
    [1,2,3,4,5,6,7,8],
    { "w": "number", "h": "number", "delay": "number", "samples": "number", "paused": "boolean" },
);

// Gates
const DigitalGateComponentInfo = (kind: string) =>
    new DigitalComponentInfo(
        kind,
        {},
        { "inputs": "input", "outputs": "output" },
        // 2->8 inputs, 1 output
        [2,3,4,5,6,7,8].map((inputs) =>
             ({ "inputs": inputs, "outputs": 1 })),
    );

const ANDGateInfo  = DigitalGateComponentInfo("ANDGate");
const NANDGateInfo = DigitalGateComponentInfo("NANDGate");
const ORGateInfo   = DigitalGateComponentInfo("ORGate");
const NORGateInfo  = DigitalGateComponentInfo("NORGate");
const XORGateInfo  = DigitalGateComponentInfo("XORGate");
const XNORGateInfo = DigitalGateComponentInfo("XNORGate");

// Flip Flops
const DigitalFlipFlopComponentInfo = (kind: string, inputs: string[]) =>
    new DigitalComponentInfo(
        kind,
        {},
        {
            ...Object.fromEntries(inputs.map((input) => [input, "input"])),
            "clk":  "input",
            "pre":  "input",
            "clr":  "input",
            "Q":    "output",
            "Qinv": "output",
        },
        [{
            ...Object.fromEntries(inputs.map((input) => [input, 1])),
            "clk":  1,
            "pre":  1,
            "clr":  1,
            "Q":    1,
            "Qinv": 1,
        }]
    );

const DFlipFlopInfo  = DigitalFlipFlopComponentInfo("DFlipFlop",  ["D"]);
const TFlipFlopInfo  = DigitalFlipFlopComponentInfo("TFlipFlop",  ["T"]);
const SRFlipFlopInfo = DigitalFlipFlopComponentInfo("SRFlipFlop", ["S", "R"]);
const JKFlipFlopInfo = DigitalFlipFlopComponentInfo("JKFlipFlop", ["J", "K"]);

// Flip Flops
const DigitalLatchComponentInfo = (kind: string, inputs: string[]) =>
    new DigitalComponentInfo(
        kind,
        {},
        {
            ...Object.fromEntries(inputs.map((input) => [input, "input"])),
            "Q":    "output",
            "Qinv": "output",
        },
        [{
            ...Object.fromEntries(inputs.map((input) => [input, 1])),
            "Q":    1,
            "Qinv": 1,
        }]
    );
const DLatchInfo  = DigitalLatchComponentInfo("DLatch",  ["D"]);
const SRLatchInfo = DigitalLatchComponentInfo("SRLatch", ["S", "R"]);

// Other
const MultiplexerInfo = new DigitalComponentInfo(
    "Multiplexer",
    {},
    { "inputs": "input", "selects": "input", "outputs": "output" },
    [1,2,3,4,5,6,7,8].map((selects) =>
        ({ "inputs": Math.pow(2, selects), "selects": selects, "outputs": 1 })),
    1 // Default is 2-select-port mux
);
const DemultiplexerInfo = new DigitalComponentInfo(
    "Demultiplexer",
    {},
    { "inputs": "input", "selects": "input", "outputs": "output" },
    [1,2,3,4,5,6,7,8].map((selects) =>
        ({ "inputs": 1, "selects": selects, "outputs": Math.pow(2, selects) })),
    1 // Default is 2-select-port demux
);
const EncoderInfo = new DigitalComponentInfo(
    "Encoder",
    {},
    { "inputs": "input", "outputs": "output" },
    [1,2,3,4,5,6,7,8].map((outputs) =>
        ({ "inputs": Math.pow(2, outputs), "outputs": outputs })),
    1 // Default is 2-output-port Encoder
);
const DecoderInfo = new DigitalComponentInfo(
    "Decoder",
    {},
    { "inputs": "input", "outputs": "output" },
    [1,2,3,4,5,6,7,8].map((inputs) =>
        ({ "inputs": inputs, "outputs": Math.pow(2, inputs) })),
    1 // Default is 2-input-port Decoder
);
const Comparator = new DigitalComponentInfo(
    "Comparator",
    {},
    { "inputsA": "input", "inputsB": "input", "lt": "output", "eq": "output", "gt": "output" },
    [1,2,3,4,5,6,7,8].map((inputSize) =>
        ({ "inputsA": inputSize, "inputsB": inputSize, "lt": 1, "eq": 1, "gt": 1 })),
    1 // Default is 2-bit-input-group Comparator
);
const Label = new DigitalComponentInfo("Label", {
    "textColor": "string",
    "bgColor":   "string",
}, {}, [{}]);


// Wires
class DigitalWireInfo implements ObjInfo {
    public readonly baseKind: "Wire";
    public readonly kind: string;

    private readonly props: TypeMap;

    public constructor(kind: string, props: TypeMap) {
        this.kind = kind;
        this.props = { ...props, "name": "string" };
    }

    public checkPropValue(key: string, value?: Prop | undefined): Result {
        if (!(key in this.props))
            return ErrE(`DigitalWireInfo: ${key} not a valid prop`);
        if (value && (this.props[key] !== typeof value))
            return ErrE(`DigitalWireInfo: ${key} expected type ${this.props[key]}, got ${typeof value}`);
        return OkVoid();
    }
}
const WireInfo = new DigitalWireInfo("DigitalWire", { "color": "string" });

// Ports
class DigitalPortInfo implements ObjInfo {
    public readonly baseKind: "Port";
    public readonly kind: string;

    private readonly props: TypeMap;

    public constructor(kind: string, props: TypeMap) {
        this.kind = kind;
        this.props = { ...props, "name": "string" };
    }

    public checkPropValue(key: string, value?: Prop | undefined): Result {
        if (!(key in this.props))
            return ErrE(`DigitalPortInfo: ${key} not a valid prop`);
        if (value && (this.props[key] !== typeof value))
            return ErrE(`DigitalPortInfo: ${key} expected type ${this.props[key]}, got ${typeof value}`);
        return OkVoid();
    }
}
const PortInfo = new DigitalPortInfo("DigitalPort", {});


class DigitalComponentInfoProvider implements ObjInfoProvider {
    private readonly components: Map<string, ComponentInfo>;
    private readonly wires: Map<string, ObjInfo>;
    private readonly ports: Map<string, ObjInfo>;

    public constructor(components: DigitalComponentInfo[]) {
        this.components = new Map(components.map((info) => [info.kind, info]));
        this.wires = new Map([["DigitalWire", WireInfo]]);
        this.ports = new Map([["DigitalPort", PortInfo]]);
    }

    public getComponent(kind: string): ComponentInfo | undefined {
        return this.components.get(kind);
    }

    public get(kind: string): ObjInfo | undefined {
        if (this.components.has(kind))
            return this.components.get(kind);
        if (this.wires.has(kind))
            return this.wires.get(kind);
        if (this.ports.has(kind))
            return this.ports.get(kind);
        return undefined;
    }
}

export function CreateDigitalComponentInfoProvider(): ObjInfoProvider {
    return new DigitalComponentInfoProvider([
        // Inputs
        SwitchInfo, ButtonInfo, ConstantLowInfo, ConstantHighInfo, ConstantNumberInfo, ClockInfo,
        // Outputs
        LEDInfo, BCDDisplayInfo, ASCIIDisplayInfo, SegmentDisplayInfo, OscilloscopeInfo,
        // Gates
        ANDGateInfo, NANDGateInfo, ORGateInfo, NORGateInfo, XORGateInfo, XNORGateInfo,
        // Flip Flops
        DFlipFlopInfo, TFlipFlopInfo, SRFlipFlopInfo, JKFlipFlopInfo,
        // Latches
        DLatchInfo, SRLatchInfo,
        // Other
        MultiplexerInfo, DemultiplexerInfo, EncoderInfo, DecoderInfo, Comparator, Label,
    ]);
}
