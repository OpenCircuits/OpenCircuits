import {DEFAULT_BORDER_WIDTH, MULTIPLEXER_HEIGHT_OFFSET, IO_PORT_LENGTH} from "core/utils/Constants";

import {V} from "Vector";

import {DefaultDigitalPort, DigitalComponent, DigitalPortGroup} from "core/models/types/digital";

import {CalcPortPos, CalcPortPositions, CalcMuxPortPositions, GenPortConfig} from "../positioning/utils";
import {PortInfoRecord}                                from "../types";


console.log(GenPortConfig(
    [1,2,3,4,5,6,7,8],
    (numInputs) => ({
        0: CalcPortPositions(Math.pow(2, numInputs), 0.5 - DEFAULT_BORDER_WIDTH/2, 1, V(-1, 0)),
        1: [CalcPortPos(V(0.5, 0), V(1, 0))], // 1 output
        2: CalcPortPositions(numInputs, 0.5 - DEFAULT_BORDER_WIDTH/2, 1, V(-1, 0)),
    }),
))

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
    "Multiplexer": {
        Default:       DefaultDigitalPort,
        InitialConfig: "4,1,2",
        AllowChanges:  true,
        ChangeGroup:   DigitalPortGroup.Select,

        Positions: GenPortConfig(
            [1,2,3,4,5,6,7,8],
            (numSelects) => ({
                0: CalcPortPositions(Math.pow(2,numSelects), 0.5 - DEFAULT_BORDER_WIDTH/2, 1, V(-1, 0)),
                1: [CalcPortPos(V(0.5, 0), V(1, 0))], // 1 output
                2: (() => {
                    // Calculations for parameters to use in determining origin positions
                    // const size = ports[0].getParent().getSize();
                    // const width = size.x;
                    // const height = size.y;
                    // const slope = this.slopeMultiplier * MULTIPLEXER_HEIGHT_OFFSET / width;
                    // const midPortOriginOffset = -height/2 + MULTIPLEXER_HEIGHT_OFFSET/2;

                    // ports.forEach((port, i) => {
                    //     const x = this.calcSpacingPos(i, ports.length, 1);
                    //     const y = midPortOriginOffset - slope * x;
                    //     port.setOriginPos(V(x, y));
                    //     port.setTargetPos(V(x, -height/2 - IO_PORT_LENGTH));
                    // });
                    const positions = CalcMuxPortPositions(numSelects, 0.5 - DEFAULT_BORDER_WIDTH/2, 1, V(1,0));
                    //console.log(positions);
                    // positions.forEach((position, i) => {
                    //     position.target.x 
                    // })
                    return positions;
                })() //CalcPortPositions(numSelects, 0.5 - DEFAULT_BORDER_WIDTH/2, 1, V(1,0)),
            }),
        ),
    },
};
