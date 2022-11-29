import {ANDGate, Multiplexer, DigitalComponent, DigitalNode,
        DigitalObj, DigitalPort, DigitalWire} from "core/models/types/digital";

import {ComponentInfoRecord, ObjInfoRecord}         from "./base";
import {GenComponentInfo, GenPortInfo, GenWireInfo} from "./utils";


const GenDigitalComponentInfo = <C extends DigitalComponent>(kind: C["kind"]) => (
    GenComponentInfo<C>(kind)
);

const DigitalPort = GenPortInfo<DigitalPort>("DigitalPort");
const DigitalWire = GenWireInfo<DigitalWire>("DigitalWire");

export const DigitalComponentInfo: ComponentInfoRecord<DigitalComponent> = {
    "DigitalNode": GenDigitalComponentInfo<DigitalNode>("DigitalNode"),
    "ANDGate":     GenDigitalComponentInfo<ANDGate>("ANDGate"),
    "Multiplexer": GenDigitalComponentInfo<Multiplexer>("Multiplexer"),
    "Demultiplexer": GenDigitalComponentInfo<Demultiplexer>("Demultiplexer"),
};

export const DigitalInfo: ObjInfoRecord<DigitalObj> = {
    "DigitalPort": DigitalPort,
    "DigitalWire": DigitalWire,
    ...DigitalComponentInfo,
} as const;
