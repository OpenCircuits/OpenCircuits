import {CircuitMetadata} from "core/models/CircuitMetadata";


export type CircuitInfoHelpers = {
    LoadCircuit: (getData: () => Promise<string>) => Promise<void>;
    SaveCircuitRemote: () => Promise<boolean>;
    SaveCircuitToFile: (type: "pdf" | "png" | "circuit"|"jpeg") => Promise<void>;
    DeleteCircuitRemote: (circuit: CircuitMetadata) => Promise<void>;
    GetSerializedCircuit: () => string;
}
