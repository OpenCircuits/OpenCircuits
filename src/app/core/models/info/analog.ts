import {GUID} from "core/utils/GUID";

import {AnalogPort, AnalogWire} from "../types/analog";
import {DefaultPort}            from "../types/base/Port";
import {DefaultWire}            from "../types/base/Wire";


const AnalogPort = {
    Default: (id: GUID, parent: GUID, group: number, index: number): AnalogPort =>
        ({ kind: "AnalogPort", ...DefaultPort(id, parent, group, index) }),
}
const AnalogWire = {
    Default: (id: GUID, p1: GUID, p2: GUID): AnalogWire =>
        ({ kind: "AnalogWire", ...DefaultWire(id, p1, p2) }),
}

export const AnalogComponentInfo = {};

export const AnalogInfo = {
    "AnalogPort": AnalogPort,
    "AnalogWire": AnalogWire,
} as const;
