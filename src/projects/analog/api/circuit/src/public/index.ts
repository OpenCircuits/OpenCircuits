import {Circuit, uuid} from "shared/api/circuit/public";
import {AnalogCircuitImpl} from "./impl/AnalogCircuit";

export * from "./AnalogCircuit";
export * from "./AnalogSim";


export function CreateCircuit(id = uuid()) {
    return new AnalogCircuitImpl(id);
}
