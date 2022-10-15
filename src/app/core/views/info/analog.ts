import {DefaultComponent} from "core/models/types/base/Component";

import {AnalogComponent, AnalogObj, AnalogPort, AnalogWire} from "../../models/types/analog";

import {ComponentInfoRecord, ObjInfoRecord}                 from "./base";
import {DefaultComponentPropInfo, GenPortInfo, GenWireInfo} from "./utils";


export const AnalogComponentInfo: ComponentInfoRecord<AnalogComponent> = {
    "AnalogNode": ({
        Default:  (id) => ({ kind: "AnalogNode", ...DefaultComponent(id) }),
        PropInfo: DefaultComponentPropInfo,
    }),
    "Ground": ({
        Default:  (id) => ({ kind: "Ground", ...DefaultComponent(id) }),
        PropInfo: DefaultComponentPropInfo,
    }),
    "Resistor": ({
        Default:  (id) => ({ kind: "Resistor", ...DefaultComponent(id), resistance: 1000 }),
        PropInfo: {
            ...DefaultComponentPropInfo,
            "resistance": {
                type:  "float",
                label: "Resistance",
                step:  100, min:   0,
            },
        },
    }),
};

export const AnalogInfo: ObjInfoRecord<AnalogObj> = {
    "AnalogPort": GenPortInfo<AnalogPort>("AnalogPort"),
    "AnalogWire": GenWireInfo<AnalogWire>("AnalogWire"),
    ...AnalogComponentInfo,
} as const;
