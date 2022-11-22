import {PropInfoRecord} from "core/models/PropInfo";

import {DigitalObj} from "core/models/types/digital";

import {DefaultComponentPropInfo, DefaultPortPropInfo, DefaultWirePropInfo} from "core/views/DefaultPropInfo";


export const DigitalPropInfo: PropInfoRecord<DigitalObj> = {
    "DigitalPort": DefaultPortPropInfo,
    "DigitalWire": DefaultWirePropInfo,
    "DigitalNode": DefaultComponentPropInfo,

    "Switch":         DefaultComponentPropInfo,
    "LED":            DefaultComponentPropInfo,
    "ANDGate":        DefaultComponentPropInfo,
    "ConstantNumber": [
        ...DefaultComponentPropInfo,
        { id: "inputNum", type: "int", key: "inputNum", label: "Input Number", min: 0, max: 15, step: 1 },
    ],
}
