import {AnalogComponent, AnalogNode, AnalogObj, AnalogPort, AnalogWire, Resistor} from "../types/analog";

import {ComponentInfoRecord, ObjInfoRecord}         from "./base";
import {GenComponentInfo, GenPortInfo, GenWireInfo} from "./utils";


const GenAnalogComponentInfo = <C extends AnalogComponent>(
    kind: C["kind"],
    InitialPortConfig: string,
    ChangeGroup?: number,
) => (
    GenComponentInfo<C>(
        kind,
        AnalogPort.Default,
        InitialPortConfig,
        ChangeGroup,
    )
);

const AnalogPort = GenPortInfo<AnalogPort>("AnalogPort");
const AnalogWire = GenWireInfo<AnalogWire>("AnalogWire");

export const AnalogComponentInfo: ComponentInfoRecord<AnalogComponent> = {
    "AnalogNode": GenAnalogComponentInfo<AnalogNode>("AnalogNode", "1,1"),
    "Resistor":   GenAnalogComponentInfo<Resistor>("Resistor", "1,1"),
};

export const AnalogInfo: ObjInfoRecord<AnalogObj> = {
    "AnalogPort": AnalogPort,
    "AnalogWire": AnalogWire,
    ...AnalogComponentInfo,
} as const;
