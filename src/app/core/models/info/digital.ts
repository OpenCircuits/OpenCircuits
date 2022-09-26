import {ANDGate, DigitalComponent, DigitalNode,
        DigitalObj, DigitalPort, DigitalPortGroup, DigitalWire} from "../types/digital";

import {ComponentInfoRecord, ObjInfoRecord}         from "./base";
import {GenComponentInfo, GenPortInfo, GenWireInfo} from "./utils";


const GenDigitalComponentInfo = <C extends DigitalComponent>(
    kind: C["kind"],
    InitialPortConfig: string,
    ChangeGroup?: number,
) => (
    GenComponentInfo<C>(
        kind,
        DigitalPort.Default,
        InitialPortConfig,
        ChangeGroup,
    )
);

const DigitalPort = GenPortInfo<DigitalPort>("DigitalPort");
const DigitalWire = GenWireInfo<DigitalWire>("DigitalWire");

export const DigitalComponentInfo: ComponentInfoRecord<DigitalComponent> = {
    "ANDGate":     GenDigitalComponentInfo<ANDGate>("ANDGate", "2,1", DigitalPortGroup.Input),
    "DigitalNode": GenDigitalComponentInfo<DigitalNode>("DigitalNode", "1,1"),
};

export const DigitalInfo: ObjInfoRecord<DigitalObj> = {
    "DigitalPort": DigitalPort,
    "DigitalWire": DigitalWire,
    ...DigitalComponentInfo,
} as const;
