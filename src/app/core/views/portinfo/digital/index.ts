import {DEFAULT_BORDER_WIDTH} from "core/utils/Constants";

import {V} from "Vector";

import {DigitalComponent, DigitalPortGroup} from "core/models/types/digital";

import {DigitalInfo} from "core/views/info/digital";

import {CalcPortPos, CalcPortPositions, GenPortConfig} from "../positioning/utils";
import {PortInfoRecord}                                from "../types";


export const DigitalPortInfo: PortInfoRecord<DigitalComponent> = {
    "DigitalNode": {
        Default:       DigitalInfo["DigitalPort"].Default,
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
        Default:       DigitalInfo["DigitalPort"].Default,
        InitialConfig: "0,1",
        AllowChanges:  false,

        Positions: {
            "0,1": {
                "1:0": { origin: V(0.62, 0), target: V(1.32, 0), dir: V(+1, 0) },
            },
        },
    },
    "LED": {
        Default:       DigitalInfo["DigitalPort"].Default,
        InitialConfig: "1",
        AllowChanges:  false,

        Positions: {
            "1": {
                "0:0": { origin: V(0, -0.5), target: V(0, -2), dir: V(0, -1) },
            },
        },
    },
    "ANDGate": {
        Default:       DigitalInfo["DigitalPort"].Default,
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
    "JKFlipFlop": {
        Default:       DigitalInfo["DigitalPort"].Default,
        InitialConfig: "3,2,2",
        AllowChanges:  false,

        Positions: {
            "3,2,2": {
                "0:0": { origin: V(-1, 0.9), target: V(-1.7, 0.9), dir: V(-1, 0) },
                "0:1": { origin: V(-1, 0), target: V(-1.7, 0), dir: V(-1, 0) },
                "0:2": { origin: V(-1, -0.9), target: V(-1.7, -0.9), dir: V(-1, 0) },
                "1:0": { origin: V(1, 0.6), target: V(1.7, 0.6), dir: V(1, 0) },
                "1:1": { origin: V(1, -0.6), target: V(1.7, -0.6), dir: V(1, 0) },
                "2:0": { origin: V(0, 1.2), target: V(0, 1.9), dir: V(0, 1) },
                "2:1": { origin: V(0, -1.2), target: V(0, -1.9), dir: V(0, -1) },
            },
        },
    },
};
