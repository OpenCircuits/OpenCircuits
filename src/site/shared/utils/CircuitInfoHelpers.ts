import {CircuitMetadata} from "core/models/CircuitMetadata";


export type CircuitInfoHelpers = {
    LoadCircuit: (getData: () => Promise<string | unknown>) => Promise<void>;
    SaveCircuitRemote: () => Promise<boolean | unknown>;
    DeleteCircuitRemote: (circuit: CircuitMetadata) => Promise<void>;
    GetSerializedCircuit: () => string;
    DuplicateCircuitRemote: () => Promise<void>;
}
