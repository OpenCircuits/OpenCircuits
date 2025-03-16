/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "shared/tests/helpers/Extensions";

import {CreateTestCircuit} from "./helpers/CreateTestCircuit";


describe("DigitalComponent", () => {
    describe("Exists", () => {
        test("Add/delete and undo/redo", () => {
            const [circuit, _, { Place, Connect }] = CreateTestCircuit();
            const [sw, led] = Place("Switch", "LED");
            const w = Connect(sw, led)!;

            expect(w.exists()).toBeTruthy();
            circuit.undo();
            expect(w.exists()).toBeFalsy();
            circuit.redo();
            expect(w.exists()).toBeTruthy();

            w.delete();
            expect(w.exists()).toBeFalsy();
            circuit.undo();
            expect(w.exists()).toBeTruthy();
            circuit.redo();
            expect(w.exists()).toBeFalsy();
        });
        test("Circuit.deleteObjs", () => {
            const [circuit, _, { Place, Connect }] = CreateTestCircuit();
            const [sw, led] = Place("Switch", "LED");
            const w = Connect(sw, led)!;

            expect(w.exists()).toBeTruthy();
            circuit.deleteObjs([w]);
            expect(w.exists()).toBeFalsy();
            circuit.undo();
            expect(w.exists()).toBeTruthy();
            circuit.redo();
            expect(w.exists()).toBeFalsy();
        });
        test("Deleting connected component deletes wire", () => {
            const [circuit, _, { Place, Connect }] = CreateTestCircuit();
            const [sw, led] = Place("Switch", "LED");
            const w = Connect(sw, led)!;

            expect(w.exists()).toBeTruthy();
            circuit.deleteObjs([sw]);
            expect(w.exists()).toBeFalsy();
            circuit.undo();
            expect(w.exists()).toBeTruthy();
            circuit.redo();
            expect(w.exists()).toBeFalsy();
            circuit.undo();

            led.delete();
            expect(w.exists()).toBeFalsy();
            circuit.undo();
            expect(w.exists()).toBeTruthy();
            circuit.redo();
            expect(w.exists()).toBeFalsy();
            circuit.undo();

            circuit.deleteObjs([sw, led]);
            expect(w.exists()).toBeFalsy();
            circuit.undo();
            expect(w.exists()).toBeTruthy();
            circuit.redo();
            expect(w.exists()).toBeFalsy();
            circuit.undo();

            circuit.deleteObjs([sw, w, led]);
            expect(w.exists()).toBeFalsy();
            circuit.undo();
            expect(w.exists()).toBeTruthy();
            circuit.redo();
            expect(w.exists()).toBeFalsy();
        });
    });
});
