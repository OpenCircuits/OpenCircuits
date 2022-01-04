import {CircuitMetadata} from "core/models/CircuitMetadata";


export type CircuitInfoHelpers = {
    LoadCircuit: (getData: () => Promise<string>) => Promise<void>;
    SaveCircuitRemote: () => Promise<boolean>;
    DeleteCircuitRemote: (circuit: CircuitMetadata) => Promise<void>;
    GetSerializedCircuit: () => string;
    DuplicateCircuitRemote: () => Promise<void>;
}
