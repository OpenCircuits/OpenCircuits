/* eslint-disable key-spacing */
import {ErrE, Ok, OkVoid, Result} from "shared/api/circuit/utils/Result";
import {MapObj}               from "shared/api/circuit/utils/Functions";

import {
    BaseComponentConfigurationInfo,
    BaseObjInfoProvider,
    BasePortConfigurationInfo,
    BaseWireConfigurationInfo,
    PortConfig,
    PropTypeMap,
} from "shared/api/circuit/internal/impl/ObjInfo";

import {Schema} from "shared/api/circuit/schema";


export class AnalogComponentInfo extends BaseComponentConfigurationInfo {
    protected override getPortInfo(_p: PortConfig, _group: string, _i: number): Pick<Schema.Port, "kind" | "props"> {
        return {
            kind:  "AnalogPort",
            props: {},
        };
    }
    // There are no max connections for ports
    public override isPortAvailable(_port: Schema.Port, _curConnections: Schema.Port[]): boolean {
        return true;
    }
    // All ports can connect to all other ports (except themselves)
    public override checkPortConnectivity(
        port: Schema.Port,
        newConnection: Schema.Port,
        _curConnections: Schema.Port[],
    ): Result {
        if (port.id === newConnection.id)
            return ErrE(`AnalogComponentInfo: Illegal connection of port to itself ${port.id}`);
        return OkVoid();
    }
}

export class AnalogWireInfo extends BaseWireConfigurationInfo {
    public override getSplitConnections(_p1: Schema.Port, _p2: Schema.Port, _wire: Schema.Wire): Result<{
        nodeKind: string;
        p1Group: string;
        p1Idx: number;
        p2Group: string;
        p2Idx: number;
    }> {
        return Ok({
            nodeKind: "AnalogNode",
            p1Group:  "",
            p1Idx:    0,
            p2Group:  "",
            p2Idx:    0,
        });
    }
}

const DefaultAnalogComponentInfo = (kind: string, portConfig: PortConfig, props: PropTypeMap = {}) =>
    new AnalogComponentInfo(kind, props, Object.keys(portConfig), [portConfig], false);

// Sources
const VoltageSourceInfo = DefaultAnalogComponentInfo("VoltageSource", { "+": 1, "-": 1 }, {
    "waveform": "string",

    "v1": "number", "v1Unit": "string",
    "V":  "number", "VUnit":  "string",
    "td": "number", "tdUnit": "string",
    "tr": "number", "trUnit": "string",
    "tf": "number", "tfUnit": "string",
    "pw": "number", "pwUnit": "string",
    "p":  "number", "pUnit":  "string",
    "ph": "number",
    "f":  "number", "fUnit":  "string",
    "d":  "number",
});
const CurrentSourceInfo = DefaultAnalogComponentInfo("CurrentSource", { "+": 1, "-": 1 }, {
    "c":     "number",
    "cUnit": "string",
});

// Essentials
const GroundInfo    = DefaultAnalogComponentInfo("Ground",    { "": 1 }, {});
const ResistorInfo  = DefaultAnalogComponentInfo("Resistor",  { "": 2 }, { "R": "number",  "unit": "string" });
const CapacitorInfo = DefaultAnalogComponentInfo("Capacitor", { "": 2 }, { "C": "number",  "unit": "string" });
const InductorInfo  = DefaultAnalogComponentInfo("Inductor",  { "": 2 }, { "L": "number",  "unit": "string" });

// Measurements
const OscilloscopeInfo = DefaultAnalogComponentInfo("Oscilloscope", { "": 1 }, {});

// Other
const LabelInfo = new AnalogComponentInfo("Label", { "textColor": "string", "bgColor": "string" }, [], [{}], false);


// Node
const NodeInfo = new AnalogComponentInfo("AnalogNode", {}, [""], [{ "": 1 }], true);

// Wires
const WireInfo = new AnalogWireInfo("AnalogWire", {});

// Ports
const PortInfo = new BasePortConfigurationInfo("AnalogPort", {}, "AnalogWire");

// IC Pin
const PinInfo = new AnalogComponentInfo("AnalogPin", {}, [""], [{ "": 1 }], false);

export class AnalogObjInfoProvider extends BaseObjInfoProvider {
    public constructor() {
        super([
            // IC Pin
            PinInfo,
            // Node
            NodeInfo,
            // Sources
            VoltageSourceInfo, CurrentSourceInfo,
            // Essentials
            GroundInfo, ResistorInfo, CapacitorInfo, InductorInfo,
            // Measurement
            OscilloscopeInfo,
            // Other
            LabelInfo,
        ], [WireInfo], [PortInfo], ["AnalogPin"]);
    }

    public override createIC(ic: Schema.IntegratedCircuit): void {
        const ports = ic.metadata.pins.reduce<Record<string, Schema.IntegratedCircuitPin[]>>((prev, pin) => ({
            ...prev,
            [pin.group]: [...(prev[pin.group] ?? []), pin],
        }), {});

        const portConfig: PortConfig = MapObj(ports, ([_, pins]) => pins.length);

        this.ics.set(ic.metadata.id, new AnalogComponentInfo(
            ic.metadata.id,
            {},
            Object.keys(ports),
            [portConfig],
            false,
            MapObj(ports, ([_, pins]) => pins.map((p) => p.name)),
        ));
    }
}
