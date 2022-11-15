import {PropInfoRecord} from "core/models/PropInfo";

import {DigitalObj} from "core/models/types/digital";

import {ConstantNumberPropInfo, DefaultComponentPropInfo, DefaultPortPropInfo, DefaultWirePropInfo} from "core/views/DefaultPropInfo";


export const DigitalPropInfo: PropInfoRecord<DigitalObj> = {
    "DigitalPort": DefaultPortPropInfo,
    "DigitalWire": DefaultWirePropInfo,
    "DigitalNode": DefaultComponentPropInfo,

    "Switch":         DefaultComponentPropInfo,
    "LED":            DefaultComponentPropInfo,
    "ANDGate":        DefaultComponentPropInfo,
    "ConstantNumber": ConstantNumberPropInfo,
} as const;
