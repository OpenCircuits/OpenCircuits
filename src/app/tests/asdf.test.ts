import {V} from "Vector";

import {CreateCircuit} from "digital/public";


describe("Test", () => {
    test("Placement", () => {
        const circuit = CreateCircuit();

        const c = circuit.placeComponentAt(V(0, 0), "ANDGate");

        expect(circuit.getObj(c.id)!.id).toBe(c.id); // 2 inputs, 1 output, 1 component
    });
});
