import {V} from "Vector";

import {CreateCircuit} from "digital/public";

import "./Extensions";


describe("FirstAvailable", () => {
    test("All ports available", () => {
        const circuit = CreateCircuit();

        const c = circuit.placeComponentAt(V(0, 0), "ANDGate");

        expect(circuit.getObjs()).toHaveLength(4); // 2 inputs, 1 output, 1 component
        expect(c.pos).toEqual(V(0, 0));
    });
    test("Only selected ports are available", () => {
        const circuit = CreateCircuit();

        const s1 = circuit.placeComponentAt(V(-5,  5), "Switch");
        const s2 = circuit.placeComponentAt(V(-5, -5), "Switch");
        const c1 = circuit.placeComponentAt(V(0,   0), "ANDGate");
        const l1 = circuit.placeComponentAt(V(5,   0), "LED");

        expect(circuit.getObjs()).toHaveLength(2 + 2 + 4 + 2);
        expect(s1.pos).toEqual(V(-5,  5));
        expect(s2.pos).toEqual(V(-5, -5));
        expect(c1.pos).toEqual(V(0,   0));
        expect(l1.pos).toEqual(V(5,   0));
    });
});
