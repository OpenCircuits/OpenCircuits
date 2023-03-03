import {V} from "Vector";

import {CreateCircuit} from "digital/public";

import "./Extensions";

describe("FirstAvailable", () => {
    test("All ports available", () => {
        const circuit = CreateCircuit();

        const c = circuit.placeComponentAt(V(0, 0), "ANDGate");
        
        // Case: 'output' port group
        expect(c.firstAvailable("output")?.id).toEqual(c.ports["outputs"][0].id);
        // Case: 'input' port group
        expect(c.firstAvailable("input")?.id).toEqual(c.ports["inputs"][0].id);
    });
    test("Only some/no ports are available", () => {
        const circuit = CreateCircuit();

        const s1 = circuit.placeComponentAt(V(-5,  5), "Switch");
        const c1 = circuit.placeComponentAt(V(0,   0), "ANDGate");

        circuit.connectWire(s1.ports["outputs"][0], c1.ports["inputs"][0])

        // There should be no available output ports for s1
        expect(s1.firstAvailable('output')?.id).toEqual(undefined);
        // There should still be 1 input and output port available for c1
        expect(c1.firstAvailable('input')?.id).toEqual(c1.ports["inputs"][1].id);
        expect(c1.firstAvailable('output')?.id).toEqual(c1.ports["outputs"][0].id);
    });
});
