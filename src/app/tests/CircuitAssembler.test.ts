import {V}             from "Vector";
import {CreateCircuit} from "digital/public";
import {CircuitAssembler} from "core/internal/assembly/CircuitAssembler";

import "./Extensions";


describe("CircuitAssembler", () => {
    const expectNoDirty = (assembler: CircuitAssembler) => {
        expect(assembler["dirtyComponents"]).toHaveLength(0);
        expect(assembler["dirtyWires"]).toHaveLength(0);
        expect(assembler["dirtyPorts"]).toHaveLength(0);
    }

    test("Single Selection", () => {
        // Create and place new component
        const [circuit, state] = CreateCircuit();

        const { assembler } = state;

        expectNoDirty(assembler);

        const s1 = circuit.placeComponentAt("ANDGate", V(0, 0));

        expect(assembler["dirtyComponents"]).toHaveLength(1);
        expect(assembler["dirtyWires"]).toHaveLength(0);
        expect(assembler["dirtyPorts"]).toHaveLength(0);

        assembler.reassemble();

        expectNoDirty(assembler);

        s1.select();

        expect(assembler["dirtyComponents"]).toHaveLength(1);
        expect(assembler["dirtyWires"]).toHaveLength(0);
        expect(assembler["dirtyPorts"]).toHaveLength(0);

        // // Select created component
        // s1.isSelected = true;

        // // Check component has been selected
        // expect(s1.isSelected).toBe(true);

        // // Calculate midpoint position using method
        // const sm1 = circuit.selections.midpoint();

        // // Check that method is returning correct midpoint position
        // expect(sm1).toEqual(V(0,0));
    });
});
