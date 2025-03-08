import {ErrE, OkVoid, Result} from "shared/api/circuit/utils/Result";

import {BaseComponentInfo,
        BaseObjInfo,
        BaseObjInfoProvider,
        ObjInfoProvider,
        PortConfig,
        PropTypeMap} from "shared/api/circuit/internal/impl/ComponentInfo";
import {Schema} from "shared/api/circuit/schema";


type DigitalPortGroupInfo = Record<string, "input" | "output">

export class DigitalComponentInfo extends BaseComponentInfo {
    public readonly portGroupInfo: DigitalPortGroupInfo;
    public readonly inputPortGroups: readonly string[];
    public readonly outputPortGroups: readonly string[];

    public constructor(
        kind: string,
        props: PropTypeMap,
        portGroupInfo: DigitalPortGroupInfo,
        portConfigs: PortConfig[],
        defaultConfig = 0
    ) {
        super(kind, props, Object.keys(portGroupInfo), portConfigs, defaultConfig);

        this.portGroupInfo = portGroupInfo;

        this.inputPortGroups  = this.portGroups.filter((g) => (this.portGroupInfo[g] ===  "input"));
        this.outputPortGroups = this.portGroups.filter((g) => (this.portGroupInfo[g] === "output"));
    }

    private isInputPort(port: Schema.Port): boolean {
        return this.inputPortGroups.includes(port.group);
    }
    private isOutputPort(port: Schema.Port): boolean {
        return this.outputPortGroups.includes(port.group);
    }

    public override getPortInfo(_p: PortConfig, _group: string, _index: number): Pick<Schema.Port, "kind" | "props"> {
        return {
            kind:  "DigitalPort",
            props: {}, // TODO: any manditory props for Digial ports
        };
    }

    public override isPortAvailable(port: Schema.Port, curPorts: Schema.Port[]): boolean {
        return (this.isOutputPort(port) || curPorts.length === 0);
    }

    public override checkPortConnectivity(
        port: Schema.Port,
        newConnection: Schema.Port,
        curConnections: Schema.Port[],
    ): Result {
        // Prevent multiple ports connecting to a single input port
        if (!this.isPortAvailable(port, curConnections))
            return ErrE(`DigitalComponentInfo: Illegal fan-in on input port ${port.id}`);
        // Prevent input->input port connections
        if (this.isInputPort(port) && this.isInputPort(newConnection))
            return ErrE(`DigitalComponentInfo: Illegal input-to-input connection on port ${port.id}`);
        // Prevent output->output port connections
        if (this.isOutputPort(port) && this.isOutputPort(newConnection))
            return ErrE(`DigitalComponentInfo: Illegal output-to-output connection on port ${port.id}`);
        return OkVoid();
    }
    // public override checkPortConnectivity(wires: Map<Schema.Port, Schema.Port[]>): Result {
    //     return ResultUtil.reduceIterU(wires.entries(), ([myPort, connectedPorts]): Result<void> =>  {
    //         // Prevent multiple ports connecting to a single input port
    //         if (this.isInputPort(myPort) && connectedPorts.length > 1)
    //             return ErrE(`DigitalComponentInfo: Illegal fan-in on input port ${myPort.id}`);
    //         // Prevent input->input port connections
    //         if (this.isInputPort(myPort) && connectedPorts.some((port) => this.isInputPort(port)))
    //             return ErrE(`DigitalComponentInfo: Illegal input-to-input connection on port ${myPort.id}`);
    //         // Prevent output->output port connections
    //         if (this.isOutputPort(myPort) && connectedPorts.some((port) => this.isOutputPort(port)))
    //             return ErrE(`DigitalComponentInfo: Illegal output-to-output connection on port ${myPort.id}`);
    //         return OkVoid();
    //     });
    // }
}


// Inputs
const DigitalOutputComponentInfo = (kind: string, outputs: number[], props: PropTypeMap = {}) =>
    new DigitalComponentInfo(kind, props, { "outputs": "output" }, outputs.map((amt) => ({ "outputs": amt })));

const SwitchInfo = DigitalOutputComponentInfo("Switch", [1], { "isOn": "boolean" });
const ButtonInfo = DigitalOutputComponentInfo("Button", [1], { "isOn": "boolean" });
const ConstantLowInfo    = DigitalOutputComponentInfo("ConstantLow",    [1]);
const ConstantHighInfo   = DigitalOutputComponentInfo("ConstantHigh",   [1]);
const ConstantNumberInfo = DigitalOutputComponentInfo("ConstantNumber", [4], { "inputNum": "number" });
const ClockInfo = DigitalOutputComponentInfo("Clock", [1], { "delay": "number", "paused": "boolean" });

// Outputs
const DigitalInputComponentInfo = (kind: string, inputs: number[], props: PropTypeMap = {}) =>
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

const NodeInfo = new DigitalComponentInfo(
    "DigitalNode",
    {},
    { "inputs": "input", "outputs": "output" },
    [{ "inputs": 1, "outputs": 1 }]
);


// Wires
const WireInfo = new BaseObjInfo("Wire", "DigitalWire", { "color": "string" });

// Ports
const PortInfo = new BaseObjInfo("Port", "DigitalPort", {});


export function CreateDigitalComponentInfoProvider(): ObjInfoProvider {
    return new BaseObjInfoProvider([
        // Node
        NodeInfo,
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
    ], [WireInfo], [PortInfo]);
}
