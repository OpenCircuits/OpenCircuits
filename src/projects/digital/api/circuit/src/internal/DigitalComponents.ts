import {ErrE, OkVoid, Result} from "shared/api/circuit/utils/Result";

import {BaseComponentConfigurationInfo,
        BaseObjInfo,
        BaseObjInfoProvider,
        ObjInfoProvider,
        PortConfig,
        PropTypeMap} from "shared/api/circuit/internal/impl/ObjInfo";
import {Schema} from "shared/api/circuit/schema";
import {MapObj} from "shared/api/circuit/utils/Functions";


type DigitalPortGroupInfo = Record<string, "input" | "output">

export class DigitalComponentConfigurationInfo extends BaseComponentConfigurationInfo {
    public readonly portGroupInfo: DigitalPortGroupInfo;
    public readonly inputPortGroups: readonly string[];
    public readonly outputPortGroups: readonly string[];

    public constructor(
        kind: string,
        props: PropTypeMap,
        portGroupInfo: DigitalPortGroupInfo,
        portConfigs: PortConfig[],
        isNode = false,
        defaultConfig = 0
    ) {
        super(kind, props, Object.keys(portGroupInfo), portConfigs, isNode, defaultConfig);

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
    new DigitalComponentConfigurationInfo(
        kind,
        props,
        { "outputs": "output" },
        outputs.map((amt) => ({ "outputs": amt })));

const SwitchInfo = DigitalOutputComponentInfo("Switch", [1], { "isOn": "boolean" });
const ButtonInfo = DigitalOutputComponentInfo("Button", [1], { "isOn": "boolean" });
const ConstantLowInfo    = DigitalOutputComponentInfo("ConstantLow",    [1]);
const ConstantHighInfo   = DigitalOutputComponentInfo("ConstantHigh",   [1]);
const ConstantNumberInfo = DigitalOutputComponentInfo("ConstantNumber", [4], { "inputNum": "number" });
const ClockInfo = DigitalOutputComponentInfo("Clock", [1], { "delay": "number", "paused": "boolean" });

// Outputs
const DigitalInputComponentInfo = (kind: string, inputs: number[], props: PropTypeMap = {}) =>
    new DigitalComponentConfigurationInfo(kind, props, { "inputs": "input" }, inputs.map((amt) => ({ "inputs": amt })));

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
const DigitalGateComponentInfo = (kind: string, inputs = [2,3,4,5,6,7,8]) =>
    new DigitalComponentConfigurationInfo(
        kind,
        {},
        { "inputs": "input", "outputs": "output" },
        // 2->8 inputs, 1 output
        inputs.map((inputs) =>
             ({ "inputs": inputs, "outputs": 1 })),
    );

const BUFGateInfo = DigitalGateComponentInfo("BUFGate", [1]);
const NOTGateInfo = DigitalGateComponentInfo("NOTGate", [1]);
const ANDGateInfo  = DigitalGateComponentInfo("ANDGate");
const NANDGateInfo = DigitalGateComponentInfo("NANDGate");
const ORGateInfo   = DigitalGateComponentInfo("ORGate");
const NORGateInfo  = DigitalGateComponentInfo("NORGate");
const XORGateInfo  = DigitalGateComponentInfo("XORGate");
const XNORGateInfo = DigitalGateComponentInfo("XNORGate");

// Flip Flops
const DigitalFlipFlopComponentInfo = (kind: string, inputs: string[]) =>
    new DigitalComponentConfigurationInfo(
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
    new DigitalComponentConfigurationInfo(
        kind,
        {},
        {
            ...Object.fromEntries(inputs.map((input) => [input, "input"])),
            // input port E is Enable
            "E":    "input",
            "Q":    "output",
            "Qinv": "output",
        },
        [{
            ...Object.fromEntries(inputs.map((input) => [input, 1])),
            "E":    1,
            "Q":    1,
            "Qinv": 1,
        }]
    );
const DLatchInfo  = DigitalLatchComponentInfo("DLatch",  ["D"]);
const SRLatchInfo = DigitalLatchComponentInfo("SRLatch", ["S", "R"]);

// Other
const MultiplexerInfo = new DigitalComponentConfigurationInfo(
    "Multiplexer",
    {},
    { "inputs": "input", "selects": "input", "outputs": "output" },
    [1,2,3,4,5,6,7,8].map((selects) =>
        ({ "inputs": Math.pow(2, selects), "selects": selects, "outputs": 1 })),
    false,
    1 // Default is 2-select-port mux
);
const DemultiplexerInfo = new DigitalComponentConfigurationInfo(
    "Demultiplexer",
    {},
    { "inputs": "input", "selects": "input", "outputs": "output" },
    [1,2,3,4,5,6,7,8].map((selects) =>
        ({ "inputs": 1, "selects": selects, "outputs": Math.pow(2, selects) })),
    false,
    1 // Default is 2-select-port demux
);
const EncoderInfo = new DigitalComponentConfigurationInfo(
    "Encoder",
    {},
    { "inputs": "input", "outputs": "output" },
    [1,2,3,4,5,6,7,8].map((outputs) =>
        ({ "inputs": Math.pow(2, outputs), "outputs": outputs })),
    false,
    1 // Default is 2-output-port Encoder
);
const DecoderInfo = new DigitalComponentConfigurationInfo(
    "Decoder",
    {},
    { "inputs": "input", "outputs": "output" },
    [1,2,3,4,5,6,7,8].map((inputs) =>
        ({ "inputs": inputs, "outputs": Math.pow(2, inputs) })),
    false,
    1 // Default is 2-input-port Decoder
);
const Comparator = new DigitalComponentConfigurationInfo(
    "Comparator",
    {},
    { "inputsA": "input", "inputsB": "input", "lt": "output", "eq": "output", "gt": "output" },
    [1,2,3,4,5,6,7,8].map((inputSize) =>
        ({ "inputsA": inputSize, "inputsB": inputSize, "lt": 1, "eq": 1, "gt": 1 })),
    false,
    1 // Default is 2-bit-input-group Comparator
);
const Label = new DigitalComponentConfigurationInfo("Label", {
    "textColor": "string",
    "bgColor":   "string",
}, {}, [{}]);

const NodeInfo = new DigitalComponentConfigurationInfo(
    "DigitalNode",
    {},
    { "inputs": "input", "outputs": "output" },
    [{ "inputs": 1, "outputs": 1 }],
    true
);


// Wires
const WireInfo = new BaseObjInfo("Wire", "DigitalWire", { "color": "string" });

// Ports
const PortInfo = new BaseObjInfo("Port", "DigitalPort", {});


export class DigitalObjInfoProvider extends BaseObjInfoProvider {
    public constructor() {
        super([
            // Node
            NodeInfo,
            // Inputs
            ButtonInfo, SwitchInfo, ConstantLowInfo, ConstantHighInfo, ConstantNumberInfo, ClockInfo,
            // Outputs
            LEDInfo, SegmentDisplayInfo, BCDDisplayInfo, ASCIIDisplayInfo, OscilloscopeInfo,
            // Gates
            BUFGateInfo, NOTGateInfo, ANDGateInfo, NANDGateInfo, ORGateInfo, NORGateInfo, XORGateInfo, XNORGateInfo,
            // Flip Flops
            SRFlipFlopInfo, JKFlipFlopInfo, DFlipFlopInfo, TFlipFlopInfo,
            // Latches
            DLatchInfo, SRLatchInfo,
            // Other
            MultiplexerInfo, DemultiplexerInfo, EncoderInfo, DecoderInfo, Comparator, Label,
        ], [WireInfo], [PortInfo])
    }

    public override getComponent(kind: string): DigitalComponentConfigurationInfo | undefined {
        return super.getComponent(kind) as DigitalComponentConfigurationInfo | undefined;
    }

    public override createIC(ic: Schema.IntegratedCircuit): void {
        const ports = ic.metadata.pins.reduce<Record<string, Schema.IntegratedCircuitPin[]>>((prev, pin) => ({
            ...prev,
            [pin.group]: [...(prev[pin.group] ?? []), pin],
        }), {});

        const portGroupInfo = MapObj(ports, ([_, pins]) => {
            // Verify all the pins in this group belong to the same type (input/output)
            const pinObjs = pins
                .map(({ id }) => ic.objects.find((o) => (o.id === id)));
            if (!pinObjs.every((o) => !!o && o.baseKind === "Port")) {
                throw new Error(
                    `DigitalObjInfoProvider.onICCreate: found undefined or non-Port pins for IC ${ic.metadata.id}!`);
            }
            const portObjs = pinObjs as Schema.Port[];
            const parentObjs = portObjs.map((p) => ic.objects.find((o) => (o.id === p.parent))! as Schema.Component);
            const types = parentObjs.map((c, i) => this.getComponent(c.kind)!.portGroupInfo[portObjs[i].group]);
            if (!types.every((type) => (type === types[0]))) {
                throw new Error(
                    `DigitalObjInfoProvider.onICCreate: found inconsistent port types for IC ${ic.metadata.id}!`);
            }
            // Flip the type since an internal "Switch" output port would
            // imply an "input" port on the outside of the IC, and vice versa.
            const type = types[0];
            return (type === "input" ? "output" : "input");
        });

        const portConfig: PortConfig = MapObj(ports, ([_, pins]) => pins.length);

        this.components.set(ic.metadata.id, new DigitalComponentConfigurationInfo(
            ic.metadata.id,
            {},
            portGroupInfo,
            [portConfig],
        ));
    }

    public override deleteIC(ic: Schema.IntegratedCircuit): void {
        this.components.delete(ic.metadata.id);
    }
}
