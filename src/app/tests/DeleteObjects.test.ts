import {V} from "Vector";
import {Component}     from "core/public/api/Component";

import {CreateCircuit} from "digital/public";

import "./Extensions";


describe("DeleteObjects", () => {
    test("Delete Component", () => {
        const circuit = CreateCircuit();

        const c = circuit.placeComponentAt(V(0, 0), "ANDGate");

        expect(circuit.getObjs()).toHaveLength(4); // 2 inputs, 1 output, 1 component
        expect(c.pos).toEqual(V(0, 0));

        let cArray: Component[] = [c];
        circuit.deleteObjs(cArray);
        expect(cArray[0]).toEqual(undefined);
    });
    test("Multiple Deletions", () => {
        const circuit = CreateCircuit();

        const c1 = circuit.placeComponentAt(V(0, 0), "ANDGate");
        const s1 = circuit.placeComponentAt(V(-5,  5), "Switch");
        const s2 = circuit.placeComponentAt(V(-5, -5), "Switch");
        const l1 = circuit.placeComponentAt(V(5,   0), "LED");

        let cArray: Component[] = [c1, s1, s2, l1];
        circuit.deleteObjs(cArray);
        expect(cArray[0]).toEqual(undefined);
    });
});
