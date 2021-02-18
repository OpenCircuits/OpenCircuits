
export type CircuitInfoHelpers = {
    LoadCircuit: (data: string) => Promise<void>;
    SaveCircuitRemote: () => Promise<void>;
    SaveCircuitToFile: (type: "pdf" | "png" | "circuit") => Promise<void>;
    GetSerializedCircuit: () => string;
}
