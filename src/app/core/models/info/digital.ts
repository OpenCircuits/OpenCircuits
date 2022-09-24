import {GUID}      from "core/utils/GUID";
import {AngleInfo} from "core/utils/Units";

import {DefaultComponent}                  from "../types/base/Component";
import {DefaultPort}                       from "../types/base/Port";
import {DefaultWire}                       from "../types/base/Wire";
import {ANDGate, DigitalPort, DigitalWire} from "../types/digital";


const DigitalPort = {
    Default: (id: GUID, parent: GUID, group: number, index: number): DigitalPort =>
        ({ kind: "DigitalPort", ...DefaultPort(id, parent, group, index) }),
}
const DigitalWire = {
    Default: (id: GUID, p1: GUID, p2: GUID): DigitalWire =>
        ({ kind: "DigitalWire", ...DefaultWire(id, p1, p2) }),
}

const ANDGate = {
    Default: (id: GUID): ANDGate => ({ kind: "ANDGate", ...DefaultComponent(id) }),

    DefaultPort: DigitalPort.Default,

    InitialPortGrouping: "2,1",

    Info: {
        props: {
            "x": {
                type:  "float",
                label: "X Position",
                step:  1,
            },
            "y": {
                type:  "float",
                label: "X Position",
                step:  1,
            },
            ...AngleInfo("angle", "Angle", 0, "deg", 45),
        },
    },
} as const;

export const DigitalComponentInfo = {
    "ANDGate": ANDGate,
} as const;

export const DigitalInfo = {
    "DigitalPort": DigitalPort,
    "DigitalWire": DigitalWire,
    ...DigitalComponentInfo,
} as const;
