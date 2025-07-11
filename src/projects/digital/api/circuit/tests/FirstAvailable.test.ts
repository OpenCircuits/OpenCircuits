import "shared/tests/helpers/Extensions";

import {V} from "Vector";

import {CreateTestCircuit} from "./helpers/CreateTestCircuit";


describe("FirstAvailable", () => {
    test("All ports available", () => {
        const [circuit] = CreateTestCircuit();

        const c = circuit.placeComponentAt("Multiplexer", V(0, 0));

        // Case: 'output' port group
        expect(c.firstAvailable("outputs")?.id).toEqual(c.ports["outputs"][0].id);
        // Case: 'input' port group
        expect(c.firstAvailable("inputs")?.id).toEqual(c.ports["inputs"][0].id);
        expect(c.firstAvailable("selects")?.id).toEqual(c.ports["selects"][0].id);
    });
    test("Only some/no ports are available", () => {
        const [circuit] = CreateTestCircuit();

        const s1 = circuit.placeComponentAt("Switch", V(-5, 5));
        const c1 = circuit.placeComponentAt("ANDGate", V(0, 0));

        s1.ports["outputs"][0].connectTo(c1.ports["inputs"][0]);

        // Switch should still have an available output port
        expect(s1.firstAvailable("outputs")?.id).toEqual(s1.ports["outputs"][0].id);

        // There should still be 1 input and output port available for c1
        expect(c1.firstAvailable("inputs")?.id).toEqual(c1.ports["inputs"][1].id);
        expect(c1.firstAvailable("outputs")?.id).toEqual(c1.ports["outputs"][0].id);
    });
});
