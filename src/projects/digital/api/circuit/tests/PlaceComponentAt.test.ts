import "shared/tests/helpers/Extensions";

import {V} from "Vector";

import {CreateTestCircuit} from "./helpers/CreateTestCircuit";


describe("PlaceComponentAt", () => {
    test("Basic Placement", () => {
        const [circuit] = CreateTestCircuit();

        const c = circuit.placeComponentAt("ANDGate", V(0, 0));

        expect(circuit.getObjs()).toHaveLength(4); // 2 inputs, 1 output, 1 component
        expect(c.pos).toEqual(V(0, 0));
    });
    test("Multiple Placements", () => {
        const [circuit] = CreateTestCircuit();

        const s1 = circuit.placeComponentAt("Switch", V(-5, 5));
        const s2 = circuit.placeComponentAt("Switch", V(-5, -5));
        const c1 = circuit.placeComponentAt("ANDGate", V(0, 0));
        const l1 = circuit.placeComponentAt("LED", V(5, 0));

        expect(circuit.getObjs()).toHaveLength(2 + 2 + 4 + 2);
        expect(s1.pos).toEqual(V(-5,  5));
        expect(s2.pos).toEqual(V(-5, -5));
        expect(c1.pos).toEqual(V(0,   0));
        expect(l1.pos).toEqual(V(5,   0));
    });
});
