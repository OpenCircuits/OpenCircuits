import {DigitalCircuit} from "./api/DigitalCircuit";


export * from "./api/DigitalCircuit";


export function CreateCircuit(): DigitalCircuit {
    throw new Error("Unimplemented");
}

export function ParseCircuit(rawContents: string): DigitalCircuit {
    throw new Error("Unimplemented");
}
