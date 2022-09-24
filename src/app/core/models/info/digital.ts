import {GUID} from "core/utils/GUID";

import {AnyComponent, AnyPort}    from "../types";
import {DefaultComponent}         from "../types/base/Component";
import {DefaultPort}              from "../types/base/Port";
import {DefaultWire}              from "../types/base/Wire";
import {ANDGate, DigitalComponent, DigitalNode,
        DigitalPort, DigitalWire} from "../types/digital";


const DigitalPort = {
    Default: (id: GUID, parent: GUID, group: number, index: number): DigitalPort =>
        ({ kind: "DigitalPort", ...DefaultPort(id, parent, group, index) }),
}
const DigitalWire = {
    Default: (id: GUID, p1: GUID, p2: GUID): DigitalWire =>
        ({ kind: "DigitalWire", ...DefaultWire(id, p1, p2) }),
}



type ComponentInfo<C extends AnyComponent> = {
    Default:     (id: GUID) => C;
    DefaultPort: (id: GUID, parent: GUID, group: number, index: number) => AnyPort;

    InitialPortGrouping: string;
}

const ANDGate: ComponentInfo<ANDGate> = {
    Default:     (id) => ({ kind: "ANDGate", ...DefaultComponent(id) }),
    DefaultPort: DigitalPort.Default,

    InitialPortGrouping: "2,1",

    // Info: {
    //     props: {
    //         "x": {
    //             type:  "float",
    //             label: "X Position",
    //             step:  1,
    //         },
    //         "y": {
    //             type:  "float",
    //             label: "X Position",
    //             step:  1,
    //         },
    //         ...AngleInfo("angle", "Angle", 0, "deg", 45),
    //     },
    // },
};

const DigitalNode: ComponentInfo<DigitalNode> = {
    Default:     (id) => ({ kind: "DigitalNode", ...DefaultComponent(id) }),
    DefaultPort: DigitalPort.Default,

    InitialPortGrouping: "1,1",
}


type ComponentInfoRecord<Comps extends AnyComponent> = {
    [K in Comps as K["kind"]]: ComponentInfo<K>;
}
export const DigitalComponentInfo: ComponentInfoRecord<DigitalComponent> = {
    "ANDGate":     ANDGate,
    "DigitalNode": DigitalNode,
};

export const DigitalInfo = {
    "DigitalPort": DigitalPort,
    "DigitalWire": DigitalWire,
    ...DigitalComponentInfo,
} as const;
