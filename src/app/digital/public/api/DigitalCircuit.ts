import {Circuit} from "core/public";


export interface DigitalCircuit extends Circuit {
    propagationTime: number;
}
