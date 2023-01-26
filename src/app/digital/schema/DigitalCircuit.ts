import {Circuit} from "core/schema/Circuit";
import {DigitalSimState} from "./DigitalSimState";


export interface DigitalCircuit extends Circuit {
    propagationTime: number;

    simState: DigitalSimState;
}
