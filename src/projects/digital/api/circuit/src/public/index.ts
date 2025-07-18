import {uuid} from "shared/api/circuit/internal";

import {DigitalCircuitImpl} from "./impl/DigitalCircuit";

export * from "./DigitalCircuit";
export * from "./DigitalComponent";
export * from "./DigitalComponentInfo";
export * from "./DigitalPort";
export * from "./DigitalWire";
export * from "./DigitalSim";
export * from "./Utilities";

export function CreateCircuit(id = uuid()) {
    return new DigitalCircuitImpl(id);
}
