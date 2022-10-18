import {AngleInfo} from "core/utils/Units";


export const DefaultComponentPropInfo = {
    "x": { type: "float", label: "X Position", step: 1 },
    "y": { type: "float", label: "Y Position", step: 1 },
    ...AngleInfo("angle", "Angle", 0, "deg", 45),
} as const;

export const DefaultWirePropInfo = {
    "color": { type: "color", label: "Color", initial: "#ffffff" },
} as const;

export const DefaultPortPropInfo = {} as const;
