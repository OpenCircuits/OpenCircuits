import {DEFAULT_BORDER_WIDTH} from "core/utils/Constants";

import {V} from "Vector";

import {linspaceDX} from "math/MathUtils";

import {DigitalComponent, DigitalPortGroup} from "core/models/types/digital";

import {DigitalInfo} from "core/views/info/digital";

import {CalcPortPos, CalcPortPositions, GenPortInfo} from "../positioning/utils";
import {PortInfoRecord}                              from "../types";


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

        Positions: GenPortInfo(7, {
            0: {
                amts:    linspaceDX(2,9,1),
                calcPos: (amt) => CalcPortPositions(amt, 0.5 - DEFAULT_BORDER_WIDTH/2),
            },
            1: CalcPortPos(V(0.5, 0), V(1, 0)),
        }),
    },
};
