import {V}             from "Vector";
import {CreateCircuit} from "digital/api/circuit/public";
import {CircuitAssembler} from "shared/api/circuit/internal/assembly/CircuitAssembler";

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

        assembler.reassemble();

        expectNoDirty(assembler);
    });
});
