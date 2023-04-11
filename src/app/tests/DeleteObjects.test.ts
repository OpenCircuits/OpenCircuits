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
        const circuit = CreateCircuit();

        const s1 = circuit.placeComponentAt(V(-4,2), "Switch");
        const s2 = circuit.placeComponentAt(V(-4,-2), "Switch");
        const g  = circuit.placeComponentAt(V(0,0), "ANDGate");
        const l  = circuit.placeComponentAt(V(4,2), "LED");
      
        const w1 = s1.ports["outputs"][0].connectTo(g.ports["inputs"][0]),
        w2 = s2.ports["outputs"][0].connectTo(g.ports["inputs"][1]),
        w3 =  g.ports["outputs"][0].connectTo(l.ports["inputs"][0]); 
        
        circuit.deleteObjs([s1, s2, g, l]);
        expect(s1.exists()).toEqual(false);
        expect(s2.exists()).toEqual(false);
        expect(g.exists()).toEqual(false);
        expect(l.exists()).toEqual(false);
        expect(w1?.exists()).toEqual(false);
        expect(w2?.exists()).toEqual(false);
        expect(w3?.exists()).toEqual(false);
        //TODO test for wires existing
        //TODO ensure deletion working properly for full circuit
        //none of my test cases are working properly right now unfortunately
    });
});
