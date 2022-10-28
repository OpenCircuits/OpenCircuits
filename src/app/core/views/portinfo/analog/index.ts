import {V} from "Vector";

import {AnalogComponent, DefaultAnalogPort} from "core/models/types/analog";

import {PortInfoRecord} from "../types";


const DefaultAnalogPortInfo = {
    Default:       DefaultAnalogPort,
    InitialConfig: 0,
    AllowChanges:  false,
} as const;

export const AnalogPortInfo: PortInfoRecord<AnalogComponent> = {
    "AnalogNode": {
        ...DefaultAnalogPortInfo,
        PositionConfigs: [{
            "ports": [
                { origin: V(0, 0), target: V(0, 0), dir: V(-1, 0) },
                { origin: V(0, 0), target: V(0, 0), dir: V(+1, 0) },
            ],
        }],
    },
    "Ground": {
        ...DefaultAnalogPortInfo,
        PositionConfigs: [{
            "ports": [{ origin: V(0, +0.3), target: V(0, +1), dir: V(0, +1) }],
        }],
    },
    "Resistor": {
        ...DefaultAnalogPortInfo,
        PositionConfigs: [{
            "ports": [
                { origin: V(-0.6, 0), target: V(-1.3, 0), dir: V(-1, 0) },
                { origin: V(+0.6, 0), target: V(+1.3, 0), dir: V(+1, 0) },
            ],
        }],
    },
};
