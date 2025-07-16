import {Circuit, uuid} from "shared/api/circuit/public";
import {AnalogCircuitImpl} from "./impl/AnalogCircuit";


export function CreateCircuit(id = uuid()) {
    return new AnalogCircuitImpl(id);
}
