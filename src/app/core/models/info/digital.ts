import {ANDGate, DigitalComponent, DigitalNode,
        DigitalObj, DigitalPort, DigitalWire} from "../types/digital";

import {ComponentInfoRecord, ObjInfoRecord, WireInfo} from "./base";
import {GenComponentInfo, GenPortInfo, GenWireInfo}   from "./utils";


const GenDigitalComponentInfo = <C extends DigitalComponent>(
    kind: C["kind"],
    InitialPortGrouping: string,
) => ({
    ...GenComponentInfo<C>(kind, InitialPortGrouping),
    DefaultPort: DigitalPort.Default,
} as const);


const DigitalPort = GenPortInfo<DigitalPort>("DigitalPort");
const DigitalWire: WireInfo<DigitalWire> = GenWireInfo<DigitalWire>("DigitalWire");

const DigitalNode = GenDigitalComponentInfo<DigitalNode>("DigitalNode", "1,1");
const ANDGate = GenDigitalComponentInfo<ANDGate>("ANDGate", "2,1");


export const DigitalComponentInfo: ComponentInfoRecord<DigitalComponent> = {
    "ANDGate":     ANDGate,
    "DigitalNode": DigitalNode,
};

export const DigitalInfo: ObjInfoRecord<DigitalObj> = {
    "DigitalPort": DigitalPort,
    "DigitalWire": DigitalWire,
    ...DigitalComponentInfo,
} as const;
