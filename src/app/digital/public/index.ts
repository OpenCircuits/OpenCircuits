import {DigitalCircuit}     from "./api/DigitalCircuit";
import {DigitalCircuitImpl} from "./api/impl/DigitalCircuit";


export * from "./api/DigitalCircuit";


export function CreateCircuit(): DigitalCircuit {
    return new DigitalCircuitImpl();
}

export function ParseCircuit(rawContents: string): DigitalCircuit {
    throw new Error("Unimplemented");
}
