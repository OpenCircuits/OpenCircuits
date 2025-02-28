import {CreateCircuit} from "digital/api/circuit/public";

import "./Extensions";


describe("CircuitMetadata", () => {
    test("Setting and Getting Circuit Metadata", () => {
        const [circuit, _] = CreateCircuit();

        // Setting circuit metadata
        circuit.name = "My Circuit";
        circuit.desc = "This is a description for My Circuit";
        circuit.thumbnail = "Thumbnail 1";

        // getting circuit metadata
        expect(circuit.name).toBe("My Circuit");
        expect(circuit.desc).toBe("This is a description for My Circuit");
        expect(circuit.thumbnail).toBe("Thumbnail 1");
    });
});
