import {V} from "Vector";
import {Component}     from "core/public/api/Component";

import {CreateCircuit} from "digital/public";

import "./Extensions";


describe("Acessors", () => {
    test("getKind", () => {
        const circuit = CreateCircuit();

        const a = circuit.placeComponentAt(V(0, 0), "ANDGate");
        expect(a.kind).toEqual("ANDGate");

        const b = circuit.placeComponentAt(V(1, 1), "ORGate");
        expect(b.kind).toEqual("ORGate");
    });
    test("testProperties", () => {
        const circuit = CreateCircuit();

        const a = circuit.placeComponentAt(V(0, 0), "ANDGate");
        
    });
});
