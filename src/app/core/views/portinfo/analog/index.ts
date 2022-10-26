import {V} from "Vector";

import {AnalogComponent, DefaultAnalogPort} from "core/models/types/analog";

import {PortInfoRecord} from "../types";


export const AnalogPortInfo: PortInfoRecord<AnalogComponent> = {
    "AnalogNode": {
        Default:       DefaultAnalogPort,
        InitialConfig: 0,
        AllowChanges:  false,

        PositionConfigs: [{
            "ports": [
                { origin: V(0, 0), target: V(0, 0), dir: V(-1, 0) },
                { origin: V(0, 0), target: V(0, 0), dir: V(+1, 0) },
            ],
        }],
    },
    "Ground": {
        Default:       DefaultAnalogPort,
        InitialConfig: 0,
        AllowChanges:  false,

        PositionConfigs: [{
            "ports": [{ origin: V(0, +0.3), target: V(0, +1), dir: V(0, +1) }],
        }],
    },
    "Resistor": {
        Default:       DefaultAnalogPort,
        InitialConfig: 0,
        AllowChanges:  false,

        PositionConfigs: [{
            "ports": [
                { origin: V(-0.6, 0), target: V(-1.3, 0), dir: V(-1, 0) },
                { origin: V(+0.6, 0), target: V(+1.3, 0), dir: V(+1, 0) },
            ],
        }],
    },
};
