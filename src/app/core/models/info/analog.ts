import {AnalogObj, AnalogPort, AnalogWire} from "../types/analog";

import {ObjInfoRecord}            from "./base";
import {GenPortInfo, GenWireInfo} from "./utils";


const AnalogPort = GenPortInfo<AnalogPort>("AnalogPort");
const AnalogWire = GenWireInfo<AnalogWire>("AnalogWire");

export const AnalogComponentInfo = {};

export const AnalogInfo: ObjInfoRecord<AnalogObj> = {
    "AnalogPort": AnalogPort,
    "AnalogWire": AnalogWire,
} as const;
