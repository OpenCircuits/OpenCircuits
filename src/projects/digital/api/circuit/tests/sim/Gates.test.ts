import "shared/tests/helpers/Extensions";

import {CreateTestCircuit} from "tests/helpers/CreateTestCircuit";


describe("Gates", () => {
    describe("BUFGate", () => {
        test("Standard", () => {
            const [_, { TurnOn, TurnOff, PlaceAndConnect }] = CreateTestCircuit();
            const [_g, { inputs: [sw], outputs: [out] }] = PlaceAndConnect("BUFGate");

            expect(out).toBeOff();
            TurnOn(sw);
            expect(out).toBeOn();
            TurnOff(sw);
            expect(out).toBeOff();
        });
        test("Metastable", () => {
            const [_, { TurnOff, TurnMetastable, PlaceAndConnect }] = CreateTestCircuit();
            const [_g, { inputs: [sw], outputs: [out] }] = PlaceAndConnect("BUFGate");

            TurnMetastable(sw);
            expect(out).toBeMetastable();
            TurnOff(sw);
            expect(out).toBeOff();
        });
    });

    describe("NOTGate", () => {
        test("Basic", () => {
            const [_, { TurnOn, TurnOff, PlaceAndConnect }] = CreateTestCircuit();
            const [_g, { inputs: [sw], outputs: [out] }] = PlaceAndConnect("NOTGate");

            expect(out).toBeOn();
            TurnOn(sw);
            expect(out).toBeOff();
            TurnOff(sw);
            expect(out).toBeOn();
        });
        test("Metastable", () => {
            const [_, { TurnOff, TurnMetastable, PlaceAndConnect }] = CreateTestCircuit();
            const [_g, { inputs: [sw], outputs: [out] }] = PlaceAndConnect("NOTGate");

            TurnMetastable(sw);
            expect(out).toBeMetastable();
            TurnOff(sw);
            expect(out).toBeOn();
        });
    });

    describe("ANDGate", () => {
        test("Basic", () => {
            const [_, { TurnOn, TurnOff, Place, Connect, PlaceAndConnect }] = CreateTestCircuit();
            const [gate, { inputs: [sw1, sw2], outputs: [out] }] = PlaceAndConnect("ANDGate");

            // Basic
            expect(out).toBeOff();
            TurnOn(sw1);
            expect(out).toBeOff();
            TurnOn(sw2);
            expect(out).toBeOn();

            // 3 inputs
            gate.setPortConfig({ "inputs": 3 });
            expect(out).toBeOff();
            const [sw3] = Place("Switch"); Connect(sw3, gate.inputs[2]);
            expect(out).toBeOff();
            TurnOn(sw3);
            expect(out).toBeOn();

            // Turning off
            TurnOff(sw1);
            expect(out).toBeOff();
            TurnOff(sw2);
            expect(out).toBeOff();
            TurnOff(sw3);
            expect(out).toBeOff();
        });
        test("Metastable", () => {
            const [_, { TurnOn, TurnOff, TurnMetastable, Place, Connect, PlaceAndConnect }] = CreateTestCircuit();
            const [gate, { inputs: [sw1, sw2], outputs: [out] }] = PlaceAndConnect("ANDGate");

            gate.setPortConfig({ "inputs": 3 });
            const [sw3] = Place("Switch"); Connect(sw3, gate.inputs[2]);

            TurnMetastable(sw1);
            expect(out).toBeOff();
            TurnOn(sw2);
            expect(out).toBeOff();
            TurnOn(sw3);
            expect(out).toBeMetastable();
            TurnOff(sw2);
            expect(out).toBeOff();
            TurnOff(sw3);
            expect(out).toBeOff();
        });
    });

    describe("NANDGate", () => {
        test("Basic", () => {
            const [_, { TurnOn, TurnOff, Place, Connect, PlaceAndConnect }] = CreateTestCircuit();
            const [gate, { inputs: [sw1, sw2], outputs: [out] }] = PlaceAndConnect("NANDGate");

            // Basic
            expect(out).toBeOn();
            TurnOn(sw1);
            expect(out).toBeOn();
            TurnOn(sw2);
            expect(out).toBeOff();

            // 3 inputs
            gate.setPortConfig({ "inputs": 3 });
            expect(out).toBeOn();
            const [sw3] = Place("Switch"); Connect(sw3, gate.inputs[2]);
            expect(out).toBeOn();
            TurnOn(sw3);
            expect(out).toBeOff();

            // Turning off
            TurnOff(sw1);
            expect(out).toBeOn();
            TurnOff(sw2);
            expect(out).toBeOn();
            TurnOff(sw3);
            expect(out).toBeOn();
        });
        test("Metastable", () => {
            const [_, { TurnOn, TurnOff, TurnMetastable, Place, Connect, PlaceAndConnect }] = CreateTestCircuit();
            const [gate, { inputs: [sw1, sw2], outputs: [out] }] = PlaceAndConnect("NANDGate");

            gate.setPortConfig({ "inputs": 3 });
            const [sw3] = Place("Switch"); Connect(sw3, gate.inputs[2]);

            TurnMetastable(sw1);
            expect(out).toBeOn();
            TurnOn(sw2);
            expect(out).toBeOn();
            TurnOn(sw3);
            expect(out).toBeMetastable();
            TurnOff(sw2);
            expect(out).toBeOn();
            TurnOff(sw3);
            expect(out).toBeOn();
        });
    });

    describe("ORGate", () => {
        test("Basic", () => {
            const [_, { TurnOn, TurnOff, Place, Connect, PlaceAndConnect }] = CreateTestCircuit();
            const [gate, { inputs: [sw1, sw2], outputs: [out] }] = PlaceAndConnect("ORGate");

            // Basic
            expect(out).toBeOff();
            TurnOn(sw1);
            expect(out).toBeOn();
            TurnOn(sw2);
            expect(out).toBeOn();

            // 3 inputs
            gate.setPortConfig({ "inputs": 3 });
            expect(out).toBeOn();
            const [sw3] = Place("Switch"); Connect(sw3, gate.inputs[2]);
            expect(out).toBeOn();
            TurnOn(sw3);
            expect(out).toBeOn();

            // Turning off
            TurnOff(sw1);
            expect(out).toBeOn();
            TurnOff(sw2);
            expect(out).toBeOn();
            TurnOff(sw3);
            expect(out).toBeOff();
        });
        test("Metastable", () => {
            const [_, { TurnOn, TurnOff, TurnMetastable, Place, Connect, PlaceAndConnect }] = CreateTestCircuit();
            const [gate, { inputs: [sw1, sw2], outputs: [out] }] = PlaceAndConnect("ORGate");

            gate.setPortConfig({ "inputs": 3 });
            const [sw3] = Place("Switch"); Connect(sw3, gate.inputs[2]);

            TurnMetastable(sw1);
            expect(out).toBeMetastable();
            TurnOn(sw2);
            expect(out).toBeOn();
            TurnOn(sw3);
            expect(out).toBeOn();
            TurnOff(sw2);
            expect(out).toBeOn();
            TurnOff(sw3);
            expect(out).toBeMetastable();
        });
    });

    describe("NORGate", () => {
        test("Basic", () => {
            const [_, { TurnOn, TurnOff, Place, Connect, PlaceAndConnect }] = CreateTestCircuit();
            const [gate, { inputs: [sw1, sw2], outputs: [out] }] = PlaceAndConnect("NORGate");

            // Basic
            expect(out).toBeOn();
            TurnOn(sw1);
            expect(out).toBeOff();
            TurnOn(sw2);
            expect(out).toBeOff();

            // 3 inputs
            gate.setPortConfig({ "inputs": 3 });
            expect(out).toBeOff();
            const [sw3] = Place("Switch"); Connect(sw3, gate.inputs[2]);
            expect(out).toBeOff();
            TurnOn(sw3);
            expect(out).toBeOff();

            // Turning off
            TurnOff(sw1);
            expect(out).toBeOff();
            TurnOff(sw2);
            expect(out).toBeOff();
            TurnOff(sw3);
            expect(out).toBeOn();
        });
        test("Metastable", () => {
            const [_, { TurnOn, TurnOff, TurnMetastable, Place, Connect, PlaceAndConnect }] = CreateTestCircuit();
            const [gate, { inputs: [sw1, sw2], outputs: [out] }] = PlaceAndConnect("NORGate");

            gate.setPortConfig({ "inputs": 3 });
            const [sw3] = Place("Switch"); Connect(sw3, gate.inputs[2]);

            TurnMetastable(sw1);
            expect(out).toBeMetastable();
            TurnOn(sw2);
            expect(out).toBeOff();
            TurnOn(sw3);
            expect(out).toBeOff();
            TurnOff(sw2);
            expect(out).toBeOff();
            TurnOff(sw3);
            expect(out).toBeMetastable();
        });
    })

    describe("XORGate", () => {
        test("Basic", () => {
            const [_, { TurnOn, TurnOff, Place, Connect, PlaceAndConnect }] = CreateTestCircuit();
            const [gate, { inputs: [sw1, sw2], outputs: [out] }] = PlaceAndConnect("XORGate");

            // Basic
            expect(out).toBeOff();
            TurnOn(sw1);
            expect(out).toBeOn();
            TurnOn(sw2);
            expect(out).toBeOff();

            // 3 inputs
            gate.setPortConfig({ "inputs": 3 });
            expect(out).toBeOff();
            const [sw3] = Place("Switch"); Connect(sw3, gate.inputs[2]);
            expect(out).toBeOff();
            TurnOn(sw3);
            expect(out).toBeOn();

            // Turning off
            TurnOff(sw1);
            expect(out).toBeOff();
            TurnOff(sw2);
            expect(out).toBeOn();
            TurnOff(sw3);
            expect(out).toBeOff();
        });
        test("Metastable", () => {
            const [_, { TurnOn, TurnOff, TurnMetastable, Place, Connect, PlaceAndConnect }] = CreateTestCircuit();
            const [gate, { inputs: [sw1, sw2], outputs: [out] }] = PlaceAndConnect("XORGate");

            gate.setPortConfig({ "inputs": 3 });
            const [sw3] = Place("Switch"); Connect(sw3, gate.inputs[2]);

            TurnMetastable(sw1);
            expect(out).toBeMetastable();
            TurnOn(sw2);
            expect(out).toBeMetastable();
            TurnOn(sw3);
            expect(out).toBeMetastable();
            TurnOff(sw2);
            expect(out).toBeMetastable();
            TurnOff(sw3);
            expect(out).toBeMetastable();
        });
    });

    describe("XNORGate", () => {
        test("XNORGate", () => {
            const [_, { TurnOn, TurnOff, Place, Connect, PlaceAndConnect }] = CreateTestCircuit();
            const [gate, { inputs: [sw1, sw2], outputs: [out] }] = PlaceAndConnect("XNORGate");

            // Basic
            expect(out).toBeOn();
            TurnOn(sw1);
            expect(out).toBeOff();
            TurnOn(sw2);
            expect(out).toBeOn();

            // 3 inputs
            gate.setPortConfig({ "inputs": 3 });
            expect(out).toBeOn();
            const [sw3] = Place("Switch"); Connect(sw3, gate.inputs[2]);
            expect(out).toBeOn();
            TurnOn(sw3);
            expect(out).toBeOff();

            // Turning off
            TurnOff(sw1);
            expect(out).toBeOn();
            TurnOff(sw2);
            expect(out).toBeOff();
            TurnOff(sw3);
            expect(out).toBeOn();
        });
        test("Metastable", () => {
            const [_, { TurnOn, TurnOff, TurnMetastable, Place, Connect, PlaceAndConnect }] = CreateTestCircuit();
            const [gate, { inputs: [sw1, sw2], outputs: [out] }] = PlaceAndConnect("XNORGate");

            gate.setPortConfig({ "inputs": 3 });
            const [sw3] = Place("Switch"); Connect(sw3, gate.inputs[2]);

            TurnMetastable(sw1);
            expect(out).toBeMetastable();
            TurnOn(sw2);
            expect(out).toBeMetastable();
            TurnOn(sw3);
            expect(out).toBeMetastable();
            TurnOff(sw2);
            expect(out).toBeMetastable();
            TurnOff(sw3);
            expect(out).toBeMetastable();
        });
    });

    // Currently these test will cause a stack overflow
    // test("Create Simple Metastable", () => {
    //     const [_, { Place, TurnOn, TurnOff, TurnMetastable }] = CreateTestCircuit();
    //     const [g1, g2] = Place("BUFGate", "NOTGate");

    //     expect(g2.outputs[0].signal).toBe(Signal.On);
    //     g1.outputs[0].connectTo(g2.inputs[0]);
    //     expect(g2.outputs[0].signal).toBe(Signal.On);
    //     g2.outputs[0].connectTo(g1.inputs[0]);

    //     expect(g2.outputs[0].signal).toBe(Signal.Metastable);
    // });
    // test("Create S-R Metastable", () => {
    //     // Build S-R Latch out of gates to generate metastable state
    //     const [_, { Place, TurnOn, TurnOff }] = CreateTestCircuit();
    //     const [sw1, sw2, sw3, and1, and2, nor1, nor2, out1, out2] = Place("Switch", "Switch", "Switch", "ANDGate", "ANDGate", "NORGate", "NORGate", "LED", "LED");

    //     sw1.outputs[0].connectTo(and1.inputs[0]);
    //     sw2.outputs[0].connectTo(and1.inputs[1]);
    //     sw2.outputs[0].connectTo(and2.inputs[0]);
    //     sw3.outputs[0].connectTo(and2.inputs[1]);

    //     and1.outputs[0].connectTo(nor1.inputs[0]);
    //     and2.outputs[0].connectTo(nor2.inputs[1]);

    //     nor1.outputs[0].connectTo(nor2.inputs[0]);
    //     nor2.outputs[0].connectTo(nor1.inputs[1]);

    //     nor1.outputs[0].connectTo(out1.inputs[0]);
    //     nor2.outputs[0].connectTo(out2.inputs[0]);

    //     TurnOn(sw1);
    //     TurnOn(sw2);
    //     TurnOn(sw3);
    //     TurnOff(sw2);

    //     expect(out1.inputs[0].signal).toBe(Signal.Metastable);
    //     expect(out2.inputs[0].signal).toBe(Signal.Metastable);
    // });
});
