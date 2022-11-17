import {DEFAULT_BORDER_WIDTH, MULTIPLEXER_HEIGHT_OFFSET, IO_PORT_LENGTH} from "core/utils/Constants";

import {V} from "Vector";

import {DefaultDigitalPort, DigitalComponent} from "core/models/types/digital";


import {CalcPortPos, CalcPortPositions, CalcMuxPortPositions, CalcMuxPortPositions2} from "../positioning/utils";
import {PortInfoRecord}                 from "../types";


const DefaultDigitalPortInfo = {
    Default:       DefaultDigitalPort,
    InitialConfig: 0,
    AllowChanges:  false,
} as const;

export const DigitalPortInfo: PortInfoRecord<DigitalComponent> = {
    "DigitalNode": {
        ...DefaultDigitalPortInfo,
        PositionConfigs: [{
            "inputs":  [{ origin: V(0, 0), target: V(0, 0), dir: V(-1, 0) }],
            "outputs": [{ origin: V(0, 0), target: V(0, 0), dir: V(+1, 0) }],
        }],
    },
    "Switch": {
        ...DefaultDigitalPortInfo,
        PositionConfigs: [{
            "outputs": [{ origin: V(0.62, 0), target: V(1.32, 0), dir: V(+1, 0) }],
        }],
    },
    "LED": {
        ...DefaultDigitalPortInfo,
        PositionConfigs: [{
            "inputs": [{ origin: V(0, -0.5), target: V(0, -2), dir: V(0, -1) }],
        }],
    },
    "ANDGate": {
        ...DefaultDigitalPortInfo,
        AllowChanges: true,
        ChangeGroup:  "inputs",

        // Generate configs for 2->8 input ports
        PositionConfigs: [2,3,4,5,6,7,8].map((numInputs) => ({
            "inputs":  CalcPortPositions(numInputs, 0.5 - DEFAULT_BORDER_WIDTH/2, 1, V(-1, 0)),
            "outputs": [CalcPortPos(V(0.5, 0), V(1, 0))], // 1 output
        })),
    },
    "Multiplexer": {
        Default:       DefaultDigitalPort,
        InitialConfig: 1,
        AllowChanges:  true,
        ChangeGroup:   "selects",

        PositionConfigs: [1,2,3,4,5,6,7,8].map((numSelects) => ({
            "inputs": (() => {
                const size = V((0.5 + numSelects/2), (1 + Math.pow(2, numSelects - 1)));
                const x = -size.x / 2;
                const ports = [];
                const inputs = Math.pow(2,numSelects);
                for (let i = 0; i < inputs; i++) {
                    const midpoint = (inputs-1)/2;
                    const spacingPos = 1/2 * (i-midpoint);
                    const y = -spacingPos + 1/4;
                    ports[i] = {
                        origin: V(x, y),
                        target: V(x - IO_PORT_LENGTH, y),
                        dir: V(-1, 0)
                    }
                }

                return ports;
            })(),
            "outputs": [CalcPortPos(V((0.5 + numSelects/2)/2, 0), V((0.5 + numSelects/2)/2 + 0.25,0))],
            "selects": (() => {
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
                console.log('num selects', numSelects)
                //const positions = CalcMuxPortPositions(numSelects, 0.5 - DEFAULT_BORDER_WIDTH/2, 1, V(1,0));
                const positions = CalcMuxPortPositions2(numSelects, 0.5 - DEFAULT_BORDER_WIDTH/2, 1, V(1,0));
                //console.log(positions);
                // positions.forEach((position, i) => {
                //     position.target.x 
                // })
                console.log(positions)
                return positions;
            })()
        }))
    },
    "Demultiplexer": {
        Default:       DefaultDigitalPort,
        InitialConfig: 1,
        AllowChanges:  true,
        ChangeGroup:   "selects",

        PositionConfigs: [1,2,3,4,5,6,7,8].map((numSelects) => ({
            "inputs": [CalcPortPos(V(-(0.5 + numSelects/2)/2, 0), V(-(0.5 + numSelects/2)/2 - 0.25,0))],
            "outputs": (() => {
                const size = V((0.5 + numSelects/2), (1 + Math.pow(2, numSelects - 1)));
                const x = size.x / 2;
                const ports = [];
                const outputs = Math.pow(2,numSelects);
                for (let i = 0; i < outputs; i++) {
                    const midpoint = (outputs-1)/2;
                    const spacingPos = 1/2 * (i-midpoint);
                    const y = -spacingPos + 1/4;
                    ports[i] = {
                        origin: V(x, y),
                        target: V(x + IO_PORT_LENGTH, y),
                        dir: V(1, 0)
                    }
                }

                return ports;
            })(),
            "selects": (() => {
                // Calculations for parameters to use in determining origin positions
                const size = V((0.5 + numSelects/2), (1  + Math.pow(2, numSelects-1)));
                const width = size.x;
                const height = size.y;
                const slope = MULTIPLEXER_HEIGHT_OFFSET / width;
                const midPortOriginOffset = -height/2 + MULTIPLEXER_HEIGHT_OFFSET/2;

                return CalcMuxPortPositions2(numSelects, 0.5 - DEFAULT_BORDER_WIDTH/2, 1, V(1,0));

                // ports.forEach((port, i) => {
                //     const x = this.calcSpacingPos(i, ports.length, 1);
                //     const y = midPortOriginOffset - slope * x;
                //     port.setOriginPos(V(x, y));
                //     port.setTargetPos(V(x, -height/2 - IO_PORT_LENGTH));
                // });
                //const positions = CalcMuxPortPositions(numSelects, 0.5 - DEFAULT_BORDER_WIDTH/2, 1, V(1,0));
                //console.log(positions);
                // positions.forEach((position, i) => {
                //     position.target.x 
                // }) 
                //return positions;
            })()
        }))
    },
};
