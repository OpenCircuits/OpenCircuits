import {GroupPrim} from "shared/api/circuit/internal/assembly/Prim";
import "shared/tests/helpers/Extensions";

import {CreateTestCircuit} from "tests/helpers/CreateTestCircuit";


describe("DigitalSim", () => {
    describe("Deletion", () => {
        test("Deleting Switch with State and Undoing keeps state", () => {
            const [circuit, { TurnOn, PlaceAndConnect }] = CreateTestCircuit();
            const [_, { inputs: [sw], outputs: [out] }] = PlaceAndConnect("BUFGate");

            expect(out).toBeOff();
            TurnOn(sw);
            expect(out).toBeOn();

            circuit.undo();

            expect(out).toBeOff();

            circuit.redo();

            expect(out).toBeOn();
        });
        test("Deleting Switch with State and Undoing properly updates Assembly", () => {
            function ledHasLightAssembled() {
                assembler.reassemble();
                const prim = assembler.getCache().componentPrims.get(out.id)![1] as GroupPrim;
                return (prim.prims.length === 1);
            }

            const [circuit, { TurnOn, PlaceAndConnect }] = CreateTestCircuit();
            // Need to manually access the internal assembler
            const assembler = circuit["ctx"]["assembler"];

            const [sw, { outputs: [out] }] = PlaceAndConnect("Switch");

            expect(ledHasLightAssembled()).toBeFalsy();
            TurnOn(sw);
            expect(ledHasLightAssembled()).toBeTruthy();

            circuit.undo();

            expect(ledHasLightAssembled()).toBeFalsy();

            circuit.redo();

            expect(ledHasLightAssembled()).toBeTruthy();
        });
    });
});
