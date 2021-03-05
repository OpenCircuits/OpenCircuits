import {CircuitMetadata} from "core/models/CircuitMetadata";


export type CircuitInfoHelpers = {
    LoadCircuit: (getData: () => Promise<string>) => Promise<void>;
    SaveCircuitRemote: () => Promise<void>;
    SaveCircuitToFile: (type: "pdf" | "png" | "circuit") => Promise<void>;
    DeleteCircuitRemote: (circuit: CircuitMetadata) => Promise<void>;
    GetSerializedCircuit: () => string;
    // setAutoSave: () => Promise<void>;
}
