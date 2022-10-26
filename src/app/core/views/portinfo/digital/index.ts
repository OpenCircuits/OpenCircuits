import {DEFAULT_BORDER_WIDTH} from "core/utils/Constants";

import {V} from "Vector";

import {DefaultDigitalPort, DigitalComponent, DigitalPortGroup} from "core/models/types/digital";

import {CalcPortPos, CalcPortPositions, GenPortConfig} from "../positioning/utils";
import {PortInfoRecord}                                from "../types";

/**
 * @type {Record<{kind:string}, PortInfo>}
 */
export const DigitalPortInfo: PortInfoRecord<DigitalComponent> = {
    "DigitalNode": {
        Default:       DefaultDigitalPort,
        InitialConfig: "1,1",
        AllowChanges:  false,

        Positions: {
            "1,1": {
                "0:0": { origin: V(0, 0), target: V(0, 0), dir: V(-1, 0) },
                "1:0": { origin: V(0, 0), target: V(0, 0), dir: V(+1, 0) },
            },
        },
    },
    "Switch": {
        Default:       DefaultDigitalPort,
        InitialConfig: "0,1",
        AllowChanges:  false,

        Positions: {
            "0,1": {
                "1:0": { origin: V(0.62, 0), target: V(1.32, 0), dir: V(+1, 0) },
            },
        },
    },
    "LED": {
        Default:       DefaultDigitalPort,
        InitialConfig: "1",
        AllowChanges:  false,

        Positions: {
            "1": {
                "0:0": { origin: V(0, -0.5), target: V(0, -2), dir: V(0, -1) },
            },
        },
    },
    "ANDGate": {
        Default:       DefaultDigitalPort,
        InitialConfig: "2,1",
        AllowChanges:  true,
        ChangeGroup:   DigitalPortGroup.Input,

        Positions: GenPortConfig(
            [2,3,4,5,6,7,8],
            (numInputs) => ({
                0: CalcPortPositions(numInputs, 0.5 - DEFAULT_BORDER_WIDTH/2, 1, V(-1, 0)),
                1: [CalcPortPos(V(0.5, 0), V(1, 0))], // 1 output
            }),
        ),
    },

    "DFlipFlop": {
        Default:       DefaultDigitalPort,
        InitialConfig: "2,2,2",
        AllowChanges:  false,

        Positions: {
            "2,2,2": {
                "0:0": CalcPortPos(V(-1, 0.6), V(-1, 0)),  // D
                "0:1": CalcPortPos(V(-1, -0.6), V(-1, 0)), // >
                "1:0": CalcPortPos(V(1, 0.6), V(1, 0)),    // Q
                "1:1": CalcPortPos(V(1, -0.6), V(1, 0)),   // !Q
                "2:0": CalcPortPos(V(0, 1.2), V(0, 1)),    // S
                "2:1": CalcPortPos(V(0, -1.2), V(0, -1)),  // R
            },
        },
    },
    "JKFlipFlop": {
        Default:       DefaultDigitalPort,
        InitialConfig: "3,2,2",
        AllowChanges:  false,

        Positions: {
            "3,2,2": {
                "0:0": CalcPortPos(V(-1, 0.9), V(-1, 0)),
                "0:1": CalcPortPos(V(-1, 0), V(-1, 0)),
                "0:2": CalcPortPos(V(-1, -0.9), V(-1, 0)),
                "1:0": CalcPortPos(V(1, 0.6), V(1, 0)),
                "1:1": CalcPortPos(V(1, -0.6), V(1, 0)),
                "2:0": CalcPortPos(V(0, 1.2), V(0, 1)),
                "2:1": CalcPortPos(V(0, -1.2), V(0, -1)),
            },
        },
    },
    "SRFlipFlop": {
        Default:       DefaultDigitalPort,
        InitialConfig: "3,2,2",
        AllowChanges:  false,

        Positions: {
            "3,2,2": {
                "0:0": CalcPortPos(V(-1, 0.9), V(-1, 0)),
                "0:1": CalcPortPos(V(-1, 0), V(-1, 0)),
                "0:2": CalcPortPos(V(-1, -0.9), V(-1, 0)),
                "1:0": CalcPortPos(V(1, 0.6), V(1, 0)),
                "1:1": CalcPortPos(V(1, -0.6), V(1, 0)),
                "2:0": CalcPortPos(V(0, 1.2), V(0, 1)),
                "2:1": CalcPortPos(V(0, -1.2), V(0, -1)),
            },
        },
    },
    "TFlipFlop": {
        Default:       DefaultDigitalPort,
        InitialConfig: "2,2,2",
        AllowChanges:  false,

        Positions: {
            "2,2,2": {
                "0:0": CalcPortPos(V(-1, 0.6), V(-1, 0)),
                "0:1": CalcPortPos(V(-1, -0.6), V(-1, 0)),
                "1:0": CalcPortPos(V(1, 0.6), V(1, 0)),
                "1:1": CalcPortPos(V(1, -0.6), V(1, 0)),
                "2:0": CalcPortPos(V(0, 1.2), V(0, 1)),
                "2:1": CalcPortPos(V(0, -1.2), V(0, -1)),
            },
        },
    },
};
