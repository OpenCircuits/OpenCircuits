import "shared/tests/helpers/Extensions";

import {V}             from "Vector";
import {CircuitAssembler} from "shared/api/circuit/internal/assembly/CircuitAssembler";
import {CreateTestCircuit} from "./helpers/CreateTestCircuit";
import {DigitalCircuitImpl} from "../src/public/impl/DigitalCircuit";


describe("CircuitAssembler", () => {
    const expectNoDirty = (assembler: CircuitAssembler) => {
        expect(assembler["dirtyComponents"]).toHaveLength(0);
        expect(assembler["dirtyWires"]).toHaveLength(0);
        expect(assembler["dirtyComponentPorts"].size).toBe(0);
    }

    test("Single Selection", () => {
        const [circuit] = CreateTestCircuit();
        // Need to manually access the internal assembler
        const assembler = (circuit as DigitalCircuitImpl)["ctx"]["assembler"];

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
