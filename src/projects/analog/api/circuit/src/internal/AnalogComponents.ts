import {ErrE, OkVoid, Result} from "shared/api/circuit/utils/Result";
import {MapObj}               from "shared/api/circuit/utils/Functions";

import {
    BaseComponentConfigurationInfo,
    BaseObjInfo,
    BaseObjInfoProvider,
    PortConfig,
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

// Node
const NodeInfo = new AnalogComponentInfo("AnalogNode", {}, [""], [{ "": 1 }], true);

// Wires
const WireInfo = new BaseObjInfo("Wire", "AnalogWire", { "color": "string" });

// Ports
const PortInfo = new BaseObjInfo("Port", "AnalogPort", {});

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

            // Measurement

            // Essentials

            // Other

        ], [WireInfo], [PortInfo]);
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
