import {GUID}      from "core/utils/GUID";
import {AngleInfo} from "core/utils/Units";

import {ANDGate, DigitalPort} from "core/models/types/digital";

import {DefaultComponent} from "core/models/types/base/Component";
import {DefaultPort}      from "core/models/types/base/Port";

import {Signal} from "../utils/Signal";

import {PropagatorFunc} from "./Propagator";



// DISCUSS: better name for this
const BOOL = (func: (a: boolean, b: boolean) => boolean) => (
    (a: Signal, b: Signal) => {
        if (a === Signal.Metastable || b === Signal.Metastable)
            return Signal.Metastable;
        return Signal.fromBool(func(Signal.isOn(a), Signal.isOn(b)));
    }
);
const AND = BOOL((a, b) => (a && b));

// type TimedComponent = {
//     delay: number;
//     paused: boolean;
// }
// type Colorable = {
//     color: string;
// }
// type SegmentDisplayComponent = {
//     segmentCount: 7 | 9 | 14 | 16;
// }

// // Inputs
// export type Button         = Component<"Button">;
// export type Switch         = Component<"Switch">;
// export type ConstantLow    = Component<"ConstantLow">;
// export type ConstantHigh   = Component<"ConstantHigh">;
// export type ConstantNumber = Component<"ConstantNumber">;
// export type Clock          = Component<"Clock"> & TimedComponent;

// // Outputs
// export type LED            = Component<"LED"> & Colorable;
// export type SegmentDisplay = Component<"SegmentDisplay"> & SegmentDisplayComponent;
// export type BCDDisplay     = Component<"BCDDisplay"> & SegmentDisplayComponent;
// export type ASCIIDisplay   = Component<"ASCIIDisplay"> & SegmentDisplayComponent;
// export type Oscilloscope   = Component<"Oscilloscope"> & TimedComponent & { samples: number, displayWidth: number, displayHeight: number };

// Logic Gates
// export type BUFGate = Component<"BUFGate">;
// export type ORGate  = Component<"ORGate">;
// export type XORGate = Component<"XORGate">;



// function Component<Kind extends string>(kind: Kind) {}


const DigitalPort = {
    Default: (id: GUID, parent: GUID, group: number, index: number): DigitalPort =>
        ({ kind: "DigitalPort", ...DefaultPort(id, parent, group, index) }),
}

const ANDGate = {
    Default: (id: GUID): ANDGate => ({ kind: "ANDGate", ...DefaultComponent(id) }),

    Info: {
        props: {
            "x": {
                type:  "float",
                label: "X Position",
                step:  1,
            },
            "y": {
                type:  "float",
                label: "X Position",
                step:  1,
            },
            ...AngleInfo("angle", "Angle", 0, "deg", 45),
        },
    },
} as const;

export const Models = {
    "ANDGate":     ANDGate,
    "DigitalPort": DigitalPort,
} as const;


// export const Models = {
//     "ANDGate": {
//         Default: (): ANDGate => DefaultComponent("ANDGate"),

//         Propagator: ((gate, inputs) => ({ outputs: [inputs.reduce(AND, Signal.On)] })) as PropagatorFunc<ANDGate>,
//     },
// } as const;
