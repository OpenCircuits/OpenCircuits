import {GUID}      from "core/utils/GUID";
import {AngleInfo} from "core/utils/Units";

import {AnyPort, AnyWire} from "core/models/types";

import {DefaultPort} from "core/models/types/base/Port";
import {DefaultWire} from "core/models/types/base/Wire";

import {PortInfo, WireInfo} from "./base";


export const DefaultComponentPropInfo = {
    "x": { type: "float", label: "X Position", step: 1 },
    "y": { type: "float", label: "Y Position", step: 1 },
    ...AngleInfo("angle", "Angle", 0, "deg", 45),
} as const;

export const GenWireInfo = <W extends AnyWire>(
    kind: W["kind"],
) => ({
    Default:  (id: GUID, p1: GUID, p2: GUID) => ({ kind, ...DefaultWire(id, p1 ,p2) }),
    PropInfo: {
        "color": {
            type:    "color",
            label:   "Color",
            initial: "#ffffff",
        },
    } as WireInfo<W>["PropInfo"],
});

export const GenPortInfo = <P extends AnyPort>(
    kind: P["kind"],
) => ({
    Default: (id: GUID, parent: GUID, group: number, index: number) =>
        ({ kind, ...DefaultPort(id, parent, group, index) }),
    PropInfo: {} as PortInfo<P>["PropInfo"],
});
