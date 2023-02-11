import {V} from "Vector";

import {CreateCircuit} from "digital/public";

import "./Extensions";


describe("PlaceComponentAt", () => {
    test("Basic Connect Wire Different Ports", () => {
        const circuit = CreateCircuit();
        const c = circuit.placeComponentAt(V(0, 0), "ANDGate");
        const l1 = circuit.placeComponentAt(V(5,   0), "LED");
        expect(c.pos).toEqual(V(0, 0));
        expect(l1.pos).toEqual(V(5, 0));
  
        // Connecting p1 and p2
        const p1 = c.ports[0];
        const p2 = l1.ports[0];
        const wire = circuit.connectWire(p1,p2);
        expect(wire).not.toBeUndefined();
        
        // Case that wire is und
        if (!wire) {
          expect(p1).toEqual(p2);
        } else {
          expect(wire.p1).toEqual(p1);
          expect(wire.p2).toEqual(p2);
        }
    });
});
