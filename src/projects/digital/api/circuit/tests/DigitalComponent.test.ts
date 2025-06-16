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

    describe("Delete", () => {
        test("add/delete and undo/redo expect state to remain same", () => {
            const [circuit, _, { PlaceAndConnect, TurnOn }] = CreateTestCircuit();
            const [sw, { outputs: [led] }] = PlaceAndConnect("Switch");

            expect(led).toBeOff();
            sw.delete();
            expect(led).toBeOff();
            circuit.undo();
            expect(led).toBeOff();
            circuit.redo();
            expect(led).toBeOff();
            circuit.undo();
            expect(led).toBeOff();

            TurnOn(sw);

            expect(led).toBeOn();
            sw.delete();
            expect(led).toBeOff();
            circuit.undo();
            expect(led).toBeOn();
            circuit.redo();
            expect(led).toBeOff();
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

    describe("Node", () => {
        describe("Snip", () => {
            test("Basic snip", () => {
                const [circuit, _, { Place, Connect }] = CreateTestCircuit();
                const [sw, led] = Place("Switch", "LED");
                const w = Connect(sw, led)!;

                const { node, wire1, wire2 } = w.split();

                const w2 = node.snip();

                expect(wire1).not.toExist();
                expect(wire2).not.toExist();
                expect(node).not.toExist();

                expect(sw).toBeConnectedTo(led);

                circuit.undo();

                expect(w2).not.toExist();
                expect(wire1).toExist();
                expect(wire2).toExist();
                expect(node).toExist();
            });
            test("Attempt to snip with more connections to node", () => {
                const [circuit, _, { Place, Connect }] = CreateTestCircuit();
                const [sw, led, led2] = Place("Switch", "LED", "LED");
                const w = Connect(sw, led)!;

                const { node, wire1, wire2 } = w.split();

                // Connect a third wire to the Node
                const wire3 = Connect(node, led2);

                expect(() => node.snip()).toThrow();

                expect(wire3).toExist();
            });
        });
    });
});
