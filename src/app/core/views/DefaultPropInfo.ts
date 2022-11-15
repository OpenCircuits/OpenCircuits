import {PropInfo}                       from "core/models/PropInfo";
import {AnyComponent, AnyPort, AnyWire} from "core/models/types";

import {ConstantNumber} from "core/models/types/digital";


export const DefaultComponentPropInfo: PropInfo<AnyComponent> = [
    {
        id:    "pos",
        type:  "group",
        label: "Position",
        info:  [
            { id: "x", type: "float", key: "x", step: 1 },
            { id: "y", type: "float", key: "y", step: 1 },
        ],
    },
    {
        id:        "angle",
        type:      "float",
        key:       "angle",
        label:     "Angle",
        step:      45,
        // Transform to degrees for display
        // TODO: Actually use this
        transform: [
            (v) => (180/Math.PI * v), // Forward transform
            (v) => (Math.PI/180 * v), // Inverse transform
        ],
    },
];

export const DefaultWirePropInfo: PropInfo<AnyWire> = [
    { id: "color", type: "color", key: "color", label: "Color" },
];

export const DefaultPortPropInfo: PropInfo<AnyPort> = [];

export const ConstantNumberPropInfo: PropInfo<ConstantNumber> = [
    ...DefaultComponentPropInfo,
    { id: "inputNum", type: "int", key: "inputNum", label: "Input Number", min: 0, max: 15, step: 1 },
];
