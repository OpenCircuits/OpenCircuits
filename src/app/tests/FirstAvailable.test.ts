import {V} from "Vector";

import {CreateCircuit} from "digital/public";

import "./Extensions";

describe("FirstAvailable", () => {
    test("All ports available", () => {
        const circuit = CreateCircuit();

        const c = circuit.placeComponentAt(V(0, 0), "Multiplexer");
        
        // let v  = c.ports["output"][0].id
        // Case: 'output' port group
        expect(c.firstAvailable('output')).toEqual(undefined);
        // Case: 'input' port group
        expect(c.firstAvailable('input')).toEqual(undefined);
    });
    test("Only some/no ports are available", () => {
        // const circuit = CreateCircuit();

        // const s1 = circuit.placeComponentAt(V(-5,  5), "Switch");
        // const c1 = circuit.placeComponentAt(V(0,   0), "ANDGate");

        // circuit.connectWire(s1.ports["output"][0], c1.ports["input"][0])

        // // There should be no output ports for s1
        // expect(s1.firstAvailable('output')).toEqual(undefined);
        // // There should still be 1 input and output port available for c1
        // expect(c1.firstAvailable('output')).toEqual(new DigitalPortImpl(circuit., c1.ports["input"][1].id));
        // expect(c1.firstAvailable('output')).toEqual(new DigitalPortImpl(circuit., c1.ports["output"][0].id));
    });
});
