import {V} from "Vector";

import {CreateCircuit} from "digital/public";

import "./Extensions";


describe("ConnectWire", () => {
    test("Basic Connect Wire Different Ports", () => {
        const circuit = CreateCircuit();
        const c = circuit.placeComponentAt(V(0, 0), "ANDGate");
        const l1 = circuit.placeComponentAt(V(5, 0), "LED");
  
        // Connecting ports p1 and p2
        const p1 = c.ports["inputs"][0];
        const p2 = l1.ports["inputs"][0];
        const wire = circuit.connectWire(p1, p2);
        expect(wire).not.toBeUndefined();
        
        // Test wire port connections
        expect(wire!.p1.id).toEqual(p1.id);
        expect(wire!.p2.id).toEqual(p2.id);
    });
    test("Basic Connect Wire of Same Ports", () => {
        const circuit = CreateCircuit(); 
        const c = circuit.placeComponentAt(V(0, 0), "ANDGate");
        
        // Test connect wire to same port
        expect(circuit.connectWire(c.ports["inputs"][0], c.ports["inputs"][0])).toBeUndefined();
    });
    test("Connect output port to output port", () => {
        const circuit = CreateCircuit();
        const c = circuit.placeComponentAt(V(0, 0), "ANDGate");
        const c2 = circuit.placeComponentAt(V(0, 0), "ANDGate");

        expect(circuit.connectWire(c.ports["outputs"][0], c2.ports["outputs"][0])).toBeUndefined();
    })
    test("Connect input port to input port", () => {
        const circuit = CreateCircuit();
        const c = circuit.placeComponentAt(V(0, 0), "ANDGate");
        const l1 = circuit.placeComponentAt(V(5, 0), "LED");

        expect(circuit.connectWire(c.ports["inputs"][0], l1.ports["inputs"][0])).toBeUndefined();
    })
    test("Connect to input port that already has a connection", () => {
        const circuit = CreateCircuit();
        const c = circuit.placeComponentAt(V(0, 0), "ANDGate");
        const c2 = circuit.placeComponentAt(V(1, 0), "ANDGate");
        const l1 = circuit.placeComponentAt(V(5, 0), "LED");

        // Connect first wire form first ANDGate to LED
        const wire = circuit.connectWire(c.ports["outputs"][0], l1.ports["inputs"][0]);
        expect(wire).not.toBeUndefined();

        // Connect another wire to LED
        expect(circuit.connectWire(c2.ports["outputs"][0], l1.ports["inputs"][0])).toBeUndefined();
    })
    test("Connecting to output port that already has a connection", () => {
        const circuit = CreateCircuit();
        const c = circuit.placeComponentAt(V(0, 0), "ANDGate");
        const l1 = circuit.placeComponentAt(V(5, 0), "LED");
        const l2 = circuit.placeComponentAt(V(2, 0), "LED");

        // Connect first wire form LED1 to ANDGate ouput port
        expect(circuit.connectWire(c.ports["outputs"][0], l1.ports["inputs"][0])).not.toBeUndefined();
        
        // Connect second wire form LED2 to ANDGate ouput port
        expect(circuit.connectWire(c.ports["outputs"][0], l2.ports["inputs"][0])).not.toBeUndefined();
    })
});
