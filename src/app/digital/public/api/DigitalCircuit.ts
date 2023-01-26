import {Circuit} from "core/public";
import {IDigitalCircuit} from "./interfaces/DigitalCircuit";


export class DigitalCircuit extends Circuit implements IDigitalCircuit {

    public set propagationTime(val: number) {
        throw new Error("Unimplemented");
    }
    public get propagationTime(): number {
        throw new Error("Unimplemented");
    }

}
