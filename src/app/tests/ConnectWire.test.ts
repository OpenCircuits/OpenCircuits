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
        
        // Test wire port connections
        expect(wire!.p1).toEqual(p1);
        expect(wire!.p2).toEqual(p2);
    });
    test("Basic Connect Wire of Same Ports", () => {
      const circuit = CreateCircuit();
      const c = circuit.placeComponentAt(V(0, 0), "ANDGate");
      expect(c.pos).toEqual(V(0, 0));

      // Get ports
      const ports = c.ports;
      const p1 = ports[0];
      const p2 = ports[0];
      expect(p1).toBe(p2);

      // Test connect wire to same port
      expect(circuit.connectWire(p1,p2)).toBeUndefined;
  });
});
