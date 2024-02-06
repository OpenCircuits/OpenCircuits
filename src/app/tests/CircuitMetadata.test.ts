import {CreateCircuit} from "digital/public";

import "./Extensions";


describe("CircuitMetadata", () => {
    test("Setting and Getting Circuit Metadata", () => {
        const circuit = CreateCircuit();
        
        // Setting circuit metadata
        circuit.name = "My Circuit";
        circuit.desc = "This is a description for My Circuit";
        circuit.thumbnail = "Thumbnail 1";

        // getting circuit metadata
        expect(circuit.name).toEqual("My Circuit");
        expect(circuit.desc).toEqual("This is a description for My Circuit");
        expect(circuit.thumbnail).toEqual("Thumbnail 1");
    });
});
