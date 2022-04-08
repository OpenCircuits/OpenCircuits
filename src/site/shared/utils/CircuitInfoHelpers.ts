import {CircuitMetadata} from "core/models/CircuitMetadata";


export type CircuitInfoHelpers = {
    LoadCircuit: (getData: () => Promise<string | undefined>, prompt?: boolean) => Promise<void>;
    SaveCircuitRemote: () => Promise<boolean | undefined>;
    DeleteCircuitRemote: (circuit: CircuitMetadata) => Promise<void>;
    GetSerializedCircuit: () => string;
    DuplicateCircuitRemote: () => Promise<void>;
}
