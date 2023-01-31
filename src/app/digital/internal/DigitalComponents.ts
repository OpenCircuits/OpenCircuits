import {uuid}                                             from "core/internal";
import {ComponentInfo, ComponentInfoProvider, PortConfig} from "core/internal/impl/ComponentInfo";
import {Port}                                             from "core/schema/Port";


type DigitalPortConfig = Record<string, number>

type DigitalPortGroupInfo = Record<string, "input" | "output">

class DigitalComponentInfo implements ComponentInfo {
    public readonly kind: string;
    public readonly defaultPortConfig: PortConfig;
    public readonly portGroups: string[];

    private readonly portGroupInfo: DigitalPortGroupInfo;
    private readonly validPortConfigs: PortConfig[];

    public constructor(
        kind: string,
        portGroupInfo: DigitalPortGroupInfo,
        portConfigs: DigitalPortConfig[],
        defaultConfig = 0
    ) {
        this.kind = kind;
        this.defaultPortConfig = portConfigs[defaultConfig];
        this.portGroups = Object.keys(portGroupInfo);

        this.portGroupInfo = portGroupInfo;
        this.validPortConfigs = portConfigs;
    }

    public makePortsForConfig(componentID: string, p: PortConfig): Port[] | undefined {
        return Object.entries(p.counts)
            .flatMap(([group, counts]) =>
                new Array(counts)
                    .fill(0)
                    .map((_, index) => ({
                        baseKind: "Port",
                        kind:     "DigitalPort",
                        id:       uuid(),

                        parent: componentID,
                        group,
                        index,
                        props:  {}, // TODO: any manditory props for Digial ports
                    })));
    }

    public isValidPortConfig(p: PortConfig): boolean {
        // Doesn't have all the port groups
        if (this.portGroups.some((group) => !(group in p.counts)))
            return false;

        // Return is some valid config matches the given config
        return this.validPortConfigs.some(({ counts }) =>
            // Check each port group in the valid config and the given config to see
            //  if the counts all match
            this.portGroups.every((group) => (counts[group] === p.counts[group])));
    }

    public isValidPortConnectivity(wires: Map<Port, Port[]>): boolean {
        for (const [myPort, connectedPorts] of wires) {
            // Prevent multiple ports connecting to a single input port
            if (myPort.group === "inputs" && connectedPorts.length > 1)
                return false;
        }
        return true;
    }
}


// Inputs
const DigitalOutputComponentInfo = (kind: string, outputs: number[]) =>
    new DigitalComponentInfo(kind, { "outputs": "output" }, outputs.map((amt) => ({ "outputs": amt })));

const SwitchInfo = DigitalOutputComponentInfo("Switch", [1]);
const ButtonInfo = DigitalOutputComponentInfo("Button", [1]);
const ConstantLowInfo    = DigitalOutputComponentInfo("ConstantLow",    [1]);
const ConstantHighInfo   = DigitalOutputComponentInfo("ConstantHigh",   [1]);
const ConstantNumberInfo = DigitalOutputComponentInfo("ConstantNumber", [4]);
const ClockInfo = DigitalOutputComponentInfo("Clock", [1]);

// Outputs
const DigitalInputComponentInfo = (kind: string, inputs: number[]) =>
    new DigitalComponentInfo(kind, { "inputs": "input" }, inputs.map((amt) => ({ "inputs": amt })));

const LEDInfo = DigitalInputComponentInfo("LED", [1]);
const BCDDisplayInfo     = DigitalInputComponentInfo("BCDDisplay",     [4]);
const ASCIIDisplayInfo   = DigitalInputComponentInfo("ASCIIDisplay",   [7]);
const SegmentDisplayInfo = DigitalInputComponentInfo("SegmentDisplay", [7,9,14,16]);
const OscilloscopeInfo = DigitalInputComponentInfo("SegmentDisplay", [1,2,3,4,5,6,7,8]);

// Gates
const DigitalGateComponentInfo = (kind: string) =>
    new DigitalComponentInfo(
        kind,
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
    { "inputs": "input", "selects": "input", "outputs": "output" },
    [1,2,3,4,5,6,7,8].map((selects) =>
        ({ "inputs": Math.pow(2, selects), "selects": selects, "outputs": 1 })),
    1 // Default is 2-select-port mux
);
const DemultiplexerInfo = new DigitalComponentInfo(
    "Demultiplexer",
    { "inputs": "input", "selects": "input", "outputs": "output" },
    [1,2,3,4,5,6,7,8].map((selects) =>
        ({ "inputs": 1, "selects": selects, "outputs": Math.pow(2, selects) })),
    1 // Default is 2-select-port demux
);
const EncoderInfo = new DigitalComponentInfo(
    "Encoder",
    { "inputs": "input", "outputs": "output" },
    [1,2,3,4,5,6,7,8].map((outputs) =>
        ({ "inputs": Math.pow(2, outputs), "outputs": outputs })),
    1 // Default is 2-output-port Encoder
);
const DecoderInfo = new DigitalComponentInfo(
    "Decoder",
    { "inputs": "input", "outputs": "output" },
    [1,2,3,4,5,6,7,8].map((inputs) =>
        ({ "inputs": inputs, "outputs": Math.pow(2, inputs) })),
    1 // Default is 2-input-port Decoder
);
const Comparator = new DigitalComponentInfo(
    "Comparator",
    { "inputsA": "input", "inputsB": "input", "lt": "output", "eq": "output", "gt": "output" },
    [1,2,3,4,5,6,7,8].map((inputSize) =>
        ({ "inputsA": inputSize, "inputsB": inputSize, "lt": 1, "eq": 1, "gt": 1 })),
    1 // Default is 2-bit-input-group Comparator
);
const Label = new DigitalComponentInfo("Label", {}, [{}]);


class DigitalComponentInfoProvider implements ComponentInfoProvider {
    private readonly map: Map<string, ComponentInfo>;

    public constructor(components: DigitalComponentInfo[]) {
        this.map = new Map(components.map((info) => [info.kind, info]));
    }

    public get(kind: string): ComponentInfo | undefined {
        return this.map.get(kind);
    }
}

export function CreateDigitalComponentInfoProvider(): ComponentInfoProvider {
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
