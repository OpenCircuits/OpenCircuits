/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "shared/tests/helpers/Extensions";

import {CreateTestCircuit} from "./helpers/CreateTestCircuit";


describe("DigitalComponent", () => {
    describe("Exists", () => {
        test("add/delete and undo/redo", () => {
            const [circuit, _, { Place }] = CreateTestCircuit();
            const [g] = Place("ANDGate");

            expect(g.exists()).toBeTruthy();
            circuit.undo();
            expect(g.exists()).toBeFalsy();
            circuit.redo();
            expect(g.exists()).toBeTruthy();

            g.delete();
            expect(g.exists()).toBeFalsy();
            circuit.undo();
            expect(g.exists()).toBeTruthy();
            circuit.redo();
            expect(g.exists()).toBeFalsy();
        });
        test("circuit.deleteObjs", () => {
            const [circuit, _, { Place }] = CreateTestCircuit();
            const [g] = Place("ANDGate");

            circuit.deleteObjs([g]);
            expect(g.exists()).toBeFalsy();
            circuit.undo();
            expect(g.exists()).toBeTruthy();
            circuit.redo();
            expect(g.exists()).toBeFalsy();
        });
    });

    describe("Ports", () => {
        test(".ports", () => {
            const [circuit, _, { Place }] = CreateTestCircuit();
            const [g] = Place("ANDGate");

            expect(g.ports["inputs"]).toHaveLength(2);
            expect(g.ports["outputs"]).toHaveLength(1);
            expect(g.allPorts).toHaveLength(3);
        });
    });

    describe(".inputs and .outputs", () => {
        test("Basic", () => {
            const [circuit, _, { Place }] = CreateTestCircuit();
            const [g] = Place("ANDGate");

            expect(g.inputs).toContainObjsExact(g.ports["inputs"]);
            expect(g.outputs).toContainObjsExact(g.ports["outputs"]);
        });

        test(".inputs on component with no inputs", () => {
            const [circuit, _, { Place }] = CreateTestCircuit();
            const [sw] = Place("Switch");

            expect(sw.inputs).toBeDefined();
            expect(sw.inputs).toHaveLength(0);
        });
        test(".outputs on component with no outputs", () => {
            const [circuit, _, { Place }] = CreateTestCircuit();
            const [led] = Place("LED");

            expect(led.outputs).toBeDefined();
            expect(led.outputs).toHaveLength(0);
        });
    });
});
