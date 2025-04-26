import "shared/tests/helpers/Extensions";

import {V}             from "Vector";
import {CircuitAssembler} from "shared/api/circuit/internal/assembly/CircuitAssembler";
import {CreateTestCircuit} from "./helpers/CreateTestCircuit";


describe("CircuitAssembler", () => {
    const expectNoDirty = (assembler: CircuitAssembler) => {
        expect(assembler["dirtyComponents"]).toHaveLength(0);
        expect(assembler["dirtyWires"]).toHaveLength(0);
        expect(assembler["dirtyComponentPorts"].size).toBe(0);
    }

    test("Single Selection", () => {
        // Create and place new component
        const [circuit, state] = CreateTestCircuit();

        const { assembler } = state;

        expectNoDirty(assembler);

        const s1 = circuit.placeComponentAt("ANDGate", V(0, 0));

        expect(assembler["dirtyComponents"]).toHaveLength(1);
        expect(assembler["dirtyWires"]).toHaveLength(0);
        expect(assembler["dirtyComponentPorts"].size).toBe(1);

        assembler.reassemble();

        expectNoDirty(assembler);

        s1.select();

        expect(assembler["dirtyComponents"]).toHaveLength(1);
        expect(assembler["dirtyWires"]).toHaveLength(0);
        expect(assembler["dirtyComponentPorts"].size).toBe(0);

        assembler.reassemble();

        expectNoDirty(assembler);
    });
});
