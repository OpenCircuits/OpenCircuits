import {V} from "Vector";

import {AnalogComponent} from "core/models/types/analog";

import {AnalogInfo} from "core/views/info/analog";

import {PortInfoRecord} from "../types";


export const AnalogPortInfo: PortInfoRecord<AnalogComponent> = {
    "AnalogNode": {
        Default:       AnalogInfo["AnalogPort"].Default,
        InitialConfig: "1,1",
        AllowChanges:  false,

        Positions: {
            "1,1": {
                "0:0": { origin: V(0, 0), target: V(0, 0), dir: V(-1, 0) },
                "1:0": { origin: V(0, 0), target: V(0, 0), dir: V(+1, 0) },
            },
        },
    },
    "Resistor": {
        Default:       AnalogInfo["AnalogPort"].Default,
        InitialConfig: "1,1",
        AllowChanges:  false,

        Positions: {
            "1,1": {
                "0:0": { origin: V(-0.6, 0), target: V(-1, 0), dir: V(-1, 0) },
                "1:0": { origin: V(+0.6, 0), target: V(+1, 0), dir: V(+1, 0) },
            },
        },
    },
};
