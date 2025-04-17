import {Schema} from "shared/api/circuit/schema";
import {DigitalSimState} from "./DigitalSimState";


export interface DigitalIntegratedCircuit extends Schema.IntegratedCircuit {
    initialSimState: DigitalSimState;
}

export interface DigitalCircuit extends Schema.Circuit {
    // Override
    ics: DigitalIntegratedCircuit[];

    propagationTime: number;

    // icSimStates: Record<GUID, DigitalSimState>;
    simState: DigitalSimState;
}
