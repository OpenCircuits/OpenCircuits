import {Schema} from "shared/api/circuit/schema";
import {DigitalSimState} from "./DigitalSimState";


export interface DigitalCircuit extends Schema.Circuit {
    propagationTime: number;

    initialICSimStates: DigitalSimState[];
    simState: DigitalSimState;
}
