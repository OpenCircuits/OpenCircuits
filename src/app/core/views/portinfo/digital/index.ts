import {DEFAULT_BORDER_WIDTH} from "core/utils/Constants";

import {V} from "Vector";

import {DefaultDigitalPort, DigitalComponent, DigitalPortGroup} from "core/models/types/digital";

import {CalcPortPos, CalcPortPositions, GenPortConfig} from "../positioning/utils";
import {PortInfoRecord}                                from "../types";


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
};
