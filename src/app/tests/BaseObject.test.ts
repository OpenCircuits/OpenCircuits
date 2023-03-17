import {V} from "Vector";
import {Component}     from "core/public/api/Component";

import {CreateCircuit} from "digital/public";

import "./Extensions";


describe("APIMethods", () => {
    test("Kind", () => {
        const circuit = CreateCircuit();

        const a = circuit.placeComponentAt(V(0, 0), "ANDGate");
        expect(a.kind).toEqual("ANDGate");

        const b = circuit.placeComponentAt(V(1, 1), "ORGate");
        expect(b.kind).toEqual("ORGate");
    });
    test("Properties", () => {
        const circuit = CreateCircuit();

        const a = circuit.placeComponentAt(V(0, 0), "ANDGate");
        expect(a.getProp('x')).toEqual(0);
        expect(a.getProp('y')).toEqual(0);

        expect(a.getProps()['x']).toEqual(0);
        expect(a.getProps()['y']).toEqual(0);

        const b = circuit.placeComponentAt(V(1, 1), "ORGate");
        expect(b.getProp('x')).toEqual(1);
        expect(b.getProp('y')).toEqual(1);

        expect(b.getProps()['x']).toEqual(1);
        expect(b.getProps()['y']).toEqual(1);
    });
    test("Exists", () => {
        const circuit = CreateCircuit();

        const a = circuit.placeComponentAt(V(0, 0), "ANDGate");

        let cArray: Component[] = [a];
        circuit.deleteObjs(cArray);
        expect(a.exists()).toEqual(false);
    });
});
