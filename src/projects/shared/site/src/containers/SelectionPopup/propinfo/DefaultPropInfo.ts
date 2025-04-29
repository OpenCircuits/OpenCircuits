import {PropInfo} from "./PropInfo";


export const DefaultComponentPropInfo: PropInfo = [
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

export const DefaultWirePropInfo: PropInfo = [
    { id: "color", type: "color", key: "color", label: "Color", default: "#FFFFFF" },
];

export const DefaultPortPropInfo: PropInfo = [];
