import {V} from "Vector";
import {Component}     from "core/public/api/Component";

import {CreateCircuit} from "digital/public";

import "./Extensions";


describe("DeleteObjects", () => {
    test("Delete Component", () => {
        const circuit = CreateCircuit();

        const c = circuit.placeComponentAt(V(0, 0), "ANDGate");

        circuit.deleteObjs([c]);
        expect(c.exists()).toEqual(false);
    });
    test("Multiple Deletions", () => {
        const circuit = CreateCircuit();

        const c1 = circuit.placeComponentAt(V(0, 0), "ANDGate");
        const s1 = circuit.placeComponentAt(V(-5,  5), "Switch");
        const s2 = circuit.placeComponentAt(V(-5, -5), "Switch");
        const l1 = circuit.placeComponentAt(V(5,   0), "LED");

        circuit.deleteObjs([c1, s1, s2, l1]);
        expect(c1.exists()).toEqual(false);
        expect(s1.exists()).toEqual(false);
        expect(s2.exists()).toEqual(false);
        expect(l1.exists()).toEqual(false);
    });
    test("Delete Circuit", () => {

    });
});
