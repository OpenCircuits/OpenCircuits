import {PropInfo, PropInfoEntry, UnitInfo} from "./PropInfo";


export const MakeUnitInfo = (key: string, symbol: string, initial = " "): UnitInfo => ({
    key,
    default: initial,
    entries: {
        "T": { display: `T${symbol}`, scale: 1e12  },
        "G": { display: `G${symbol}`, scale: 1e9   },
        "M": { display: `M${symbol}`, scale: 1e6   },
        "k": { display: `k${symbol}`, scale: 1e3   },
        " ": { display: symbol,       scale: 1     },
        "m": { display: `m${symbol}`, scale: 1e-3  },
        "u": { display: `u${symbol}`, scale: 1e-6  },
        "n": { display: `n${symbol}`, scale: 1e-9  },
        "p": { display: `p${symbol}`, scale: 1e-12 },
        "f": { display: `f${symbol}`, scale: 1e-15 },
    },
})


export const DEFAULT_COMPONENT_PROP_INFO: PropInfo = [
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
        transform: [
            (v) => (180/Math.PI * v), // Forward transform
            (v) => (Math.PI/180 * v), // Inverse transform
        ],
    },
];

export const DEFAULT_WIRE_PROP_INFO: PropInfo = [
    { id: "color", type: "color", key: "color", label: "Color", default: "#FFFFFF" },
];

export const DEFAULT_PORT_PROP_INFO: PropInfo = [];

export const TimeInfo = (key: string, label: string, initial = 0, initialU = " "): PropInfoEntry => ({
    id:      key,
    type:    "float",
    key,
    label,
    default: initial,
    min:     0,
    step:    0.1,
    unit:    MakeUnitInfo(`${key}Unit`, "s", initialU),
});

export const FrequencyInfo = (key: string, label: string, initial = 0, initialU = " "): PropInfoEntry => ({
    id:      key,
    type:    "float",
    key,
    label,
    default: initial,
    min:     0,
    step:    0.1,
    unit:    MakeUnitInfo(`${key}Unit`, "Hz", initialU),
});

export const AngleInfo = (key: string, label: string, initial = 0): PropInfoEntry => ({
    id:      key,
    type:    "float",
    key,
    label,
    default: initial,
    min:     0,
    max:     360,
    step:    45,
});
