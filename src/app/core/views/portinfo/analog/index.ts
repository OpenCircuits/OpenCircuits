import {V} from "Vector";

import {AnalogComponent, DefaultAnalogPort} from "core/models/types/analog";

import {PortInfoRecord} from "../types";


export const AnalogPortInfo: PortInfoRecord<AnalogComponent> = {
    "AnalogNode": {
        Default:       DefaultAnalogPort,
        InitialConfig: "2",
        AllowChanges:  false,

        Positions: {
            "2": {
                "0:0": { origin: V(0, 0), target: V(0, 0), dir: V(-1, 0) },
                "0:1": { origin: V(0, 0), target: V(0, 0), dir: V(+1, 0) },
            },
        },
    },
    "Ground": {
        Default:       DefaultAnalogPort,
        InitialConfig: "1",
        AllowChanges:  false,

        Positions: {
            "1": {
                "0:0": { origin: V(0, +0.3), target: V(0, +1), dir: V(0, +1) },
            },
        },
    },
    "Resistor": {
        Default:       DefaultAnalogPort,
        InitialConfig: "2",
        AllowChanges:  false,

        Positions: {
            "2": {
                "0:0": { origin: V(-0.6, 0), target: V(-1.3, 0), dir: V(-1, 0) },
                "0:1": { origin: V(+0.6, 0), target: V(+1.3, 0), dir: V(+1, 0) },
            },
        },
    },
};
