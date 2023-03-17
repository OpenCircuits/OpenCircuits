import {V} from "Vector";

import {CreateCircuit} from "digital/public";

import "./Extensions";


describe("ConnectWire", () => {
    test("Basic Connect Wire Different Ports", () => {
        const circuit = CreateCircuit();
        const c = circuit.placeComponentAt(V(0, 0), "ANDGate");
        const l1 = circuit.placeComponentAt(V(5, 0), "LED");
        expect(c.pos).toEqual(V(0, 0));
        expect(l1.pos).toEqual(V(5, 0));
  
        // Connecting ports p1 and p2
        const p1 = c.ports["inputs"][0];
        const p2 = l1.ports["inputs"][0];
        const wire = circuit.connectWire(p1,p2);
        expect(wire).not.toBeUndefined();
        
        // Test wire port connections
        expect(wire!.p1.id).toEqual(p1.id);
        expect(wire!.p2.id).toEqual(p2.id);
    });
    test("Basic Connect Wire of Same Ports", () => {
      const circuit = CreateCircuit(); 
      const c = circuit.placeComponentAt(V(0, 0), "ANDGate");
      expect(c.pos).toEqual(V(0, 0));
      
      // Test connect wire to same port
      expect(circuit.connectWire(c.ports["inputs"][0], c.ports["inputs"][0])).toBeUndefined();
  });
});
