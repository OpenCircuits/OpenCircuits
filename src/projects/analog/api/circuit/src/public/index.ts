import {Circuit, uuid} from "shared/api/circuit/public";
import {AnalogCircuitImpl} from "./impl/AnalogCircuit";

export type AnalogCircuit = Circuit;

export function CreateCircuit(id = uuid()) {
    return new AnalogCircuitImpl(id);
}
