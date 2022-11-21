import {PropInfoRecord} from "core/models/PropInfo";

import {AnalogObj} from "core/models/types/analog";

import {DefaultComponentPropInfo, DefaultPortPropInfo, DefaultWirePropInfo} from "core/views/DefaultPropInfo";


export const AnalogPropInfo: PropInfoRecord<AnalogObj> = {
    "AnalogPort": DefaultPortPropInfo,
    "AnalogWire": DefaultWirePropInfo,
    "AnalogNode": DefaultComponentPropInfo,

    "Resistor": {
        ...DefaultComponentPropInfo,
        "resistance": { type: "float", label: "Resistance", step: 100, min: 0 },
    },
    "Oscilloscope": {
        ...DefaultComponentPropInfo,
        // set the threshhold for the max and the min of the dimensions
        "width": { type: "float", label: "Width", step: 1, min: 0 },
        "height": { type: "float", label: "Height", step: 1, min: 0 },
        //don't need to worry about inputs yet, not implemented on master!
        "inputs": { type: "float", label: "Inputs", step: 1, min: 0, max: 8 },
        "delay": { type: "float", label: "Delay", step: 50, min: 0, max: 10000 },
        //????
        "samples": { type: "float", label: "Samples", step: 50, min: 0 },
    },
    
    "Ground": DefaultComponentPropInfo,
} as const;
