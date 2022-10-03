import {AnalogComponent, AnalogNode, AnalogObj, AnalogPort, AnalogWire, Resistor} from "../../models/types/analog";

import {ComponentInfoRecord, ObjInfoRecord}         from "./base";
import {GenComponentInfo, GenPortInfo, GenWireInfo} from "./utils";


const GenAnalogComponentInfo = <C extends AnalogComponent>(kind: C["kind"]) => (
    GenComponentInfo<C>(kind)
);

export const AnalogComponentInfo: ComponentInfoRecord<AnalogComponent> = {
    "AnalogNode": GenAnalogComponentInfo<AnalogNode>("AnalogNode"),
    "Resistor":   GenAnalogComponentInfo<Resistor>("Resistor"),
};

export const AnalogInfo: ObjInfoRecord<AnalogObj> = {
    "AnalogPort": GenPortInfo<AnalogPort>("AnalogPort"),
    "AnalogWire": GenWireInfo<AnalogWire>("AnalogWire"),
    ...AnalogComponentInfo,
} as const;
