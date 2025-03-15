import "shared/tests/helpers/Extensions";

import {Signal} from "digital/api/circuit/internal/sim/Signal";
import {CreateTestCircuit} from "tests/helpers/CreateTestCircuit";

describe("Gates", () => {
    describe("Buffer", () => {
        test("Standard", () => {
            const [{}, {}, { Place, TurnOn, TurnOff }] = CreateTestCircuit();
            const [sw, gate, out] = Place("Switch", "BUFGate", "LED");

            sw.outputs[0].connectTo(gate.inputs[0]);
            gate.outputs[0].connectTo(out.inputs[0]);

            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOn(sw);
            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOff(sw);
            expect(out.inputs[0].signal).toBe(Signal.Off);
        });
        test("Metastable", () => {
            const [{}, {}, { Place, TurnMetastable, TurnOff }] = CreateTestCircuit();
            const [sw, gate, out] = Place("Switch", "BUFGate", "LED");

            sw.outputs[0].connectTo(gate.inputs[0]);
            gate.outputs[0].connectTo(out.inputs[0]);

            TurnMetastable(sw);
            expect(out.inputs[0].signal).toBe(Signal.Metastable);
            TurnOff(sw);
            expect(out.inputs[0].signal).toBe(Signal.Off);
        });
    });

    describe("NOTGate", () => {
        test("Basic", () => {
            const [{}, {}, { Place, TurnOn, TurnOff }] = CreateTestCircuit();
            const [sw, gate, out] = Place("Switch", "NOTGate", "LED");

            sw.outputs[0].connectTo(gate.inputs[0]);
            gate.outputs[0].connectTo(out.inputs[0]);

            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOn(sw);
            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOff(sw);
            expect(out.inputs[0].signal).toBe(Signal.On);
        });
        test("Metastable", () => {
            const [{}, {}, { Place, TurnMetastable, TurnOff }] = CreateTestCircuit();
            const [sw, gate, out] = Place("Switch", "NOTGate", "LED");

            sw.outputs[0].connectTo(gate.inputs[0]);
            gate.outputs[0].connectTo(out.inputs[0]);

            TurnMetastable(sw);
            expect(out.inputs[0].signal).toBe(Signal.Metastable);
            TurnOff(sw);
            expect(out.inputs[0].signal).toBe(Signal.On);
        });
    });

    describe("ANDGate", () => {
        test("Basic", () => {
            const [{}, {}, { Place, TurnOn, TurnOff }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "ANDGate", "LED");

            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            gate.outputs[0].connectTo(out.inputs[0]);

            // Basic
            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOn(sw1);
            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOn(sw2);
            expect(out.inputs[0].signal).toBe(Signal.On);

            // 3 inputs
            gate.setNumPorts("inputs", 3);
            expect(out.inputs[0].signal).toBe(Signal.Off);
            sw3.outputs[0].connectTo(gate.inputs[2]);
            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOn(sw3);
            expect(out.inputs[0].signal).toBe(Signal.On);

            // Turning off
            TurnOff(sw1);
            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOff(sw2);
            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOff(sw3);
            expect(out.inputs[0].signal).toBe(Signal.Off);
        });
        test("Metastable", () => {
            const [{}, {}, { Place, TurnOn, TurnOff, TurnMetastable }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "ANDGate", "LED");

            gate.setNumPorts("inputs", 3);
            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            gate.outputs[0].connectTo(out.inputs[0]);
            sw3.outputs[0].connectTo(gate.inputs[2]);

            TurnMetastable(sw1);
            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOn(sw2);
            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOn(sw3);
            expect(out.inputs[0].signal).toBe(Signal.Metastable);
            TurnOff(sw2);
            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOff(sw3);
            expect(out.inputs[0].signal).toBe(Signal.Off);
        });
    });

    describe("NANDGate", () => {
        test("Basic", () => {
            const [{}, {}, { Place, TurnOn, TurnOff }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "NANDGate", "LED");

            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            gate.outputs[0].connectTo(out.inputs[0]);

            // Basic
            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOn(sw1);
            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOn(sw2);
            expect(out.inputs[0].signal).toBe(Signal.Off);

            // 3 inputs
            gate.setNumPorts("inputs", 3);
            expect(out.inputs[0].signal).toBe(Signal.On);
            sw3.outputs[0].connectTo(gate.inputs[2]);
            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOn(sw3);
            expect(out.inputs[0].signal).toBe(Signal.Off);

            // Turning off
            TurnOff(sw1);
            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOff(sw2);
            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOff(sw3);
            expect(out.inputs[0].signal).toBe(Signal.On);
        });
        test("Metastable", () => {
            const [{}, {}, { Place, TurnOn, TurnOff, TurnMetastable }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "NANDGate", "LED");

            gate.setNumPorts("inputs", 3);
            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            gate.outputs[0].connectTo(out.inputs[0]);
            sw3.outputs[0].connectTo(gate.inputs[2]);

            TurnMetastable(sw1);
            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOn(sw2);
            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOn(sw3);
            expect(out.inputs[0].signal).toBe(Signal.Metastable);
            TurnOff(sw2);
            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOff(sw3);
            expect(out.inputs[0].signal).toBe(Signal.On);
        });
    });

    describe("ORGate", () => {
        test("Basic", () => {
            const [{}, {}, { Place, TurnOn, TurnOff }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "ORGate", "LED");

            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            gate.outputs[0].connectTo(out.inputs[0]);

            // Basic
            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOn(sw1);
            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOn(sw2);
            expect(out.inputs[0].signal).toBe(Signal.On);

            // 3 inputs
            gate.setNumPorts("inputs", 3);
            expect(out.inputs[0].signal).toBe(Signal.On);
            sw3.outputs[0].connectTo(gate.inputs[2]);
            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOn(sw3);
            expect(out.inputs[0].signal).toBe(Signal.On);

            // Turning off
            TurnOff(sw1);
            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOff(sw2);
            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOff(sw3);
            expect(out.inputs[0].signal).toBe(Signal.Off);
        });
        test("Metastable", () => {
            const [{}, {}, { Place, TurnOn, TurnOff, TurnMetastable }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "ORGate", "LED");

            gate.setNumPorts("inputs", 3);
            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            sw3.outputs[0].connectTo(gate.inputs[2]);
            gate.outputs[0].connectTo(out.inputs[0]);

            TurnMetastable(sw1);
            expect(out.inputs[0].signal).toBe(Signal.Metastable);
            TurnOn(sw2);
            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOn(sw3);
            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOff(sw2);
            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOff(sw3);
            expect(out.inputs[0].signal).toBe(Signal.Metastable);
        });
    });

    describe("NORGate", () => {
        test("Basic", () => {
            const [{}, {}, { Place, TurnOn, TurnOff }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "NORGate", "LED");

            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            gate.outputs[0].connectTo(out.inputs[0]);

            // Basic
            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOn(sw1);
            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOn(sw2);
            expect(out.inputs[0].signal).toBe(Signal.Off);

            // 3 inputs
            gate.setNumPorts("inputs", 3);
            expect(out.inputs[0].signal).toBe(Signal.Off);
            sw3.outputs[0].connectTo(gate.inputs[2]);
            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOn(sw3);
            expect(out.inputs[0].signal).toBe(Signal.Off);

            // Turning off
            TurnOff(sw1);
            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOff(sw2);
            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOff(sw3);
            expect(out.inputs[0].signal).toBe(Signal.On);
        });
        test("Metastable", () => {
            const [{}, {}, { Place, TurnOn, TurnOff, TurnMetastable }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "NORGate", "LED");

            gate.setNumPorts("inputs", 3);
            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            sw3.outputs[0].connectTo(gate.inputs[2]);
            gate.outputs[0].connectTo(out.inputs[0]);

            TurnMetastable(sw1);
            expect(out.inputs[0].signal).toBe(Signal.Metastable);
            TurnOn(sw2);
            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOn(sw3);
            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOff(sw2);
            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOff(sw3);
            expect(out.inputs[0].signal).toBe(Signal.Metastable);
        });
    })

    describe("XORGate", () => {
        test("Basic", () => {
            const [{}, {}, { Place, TurnOn, TurnOff }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "XORGate", "LED");

            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            gate.outputs[0].connectTo(out.inputs[0]);

            // Basic
            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOn(sw1);
            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOn(sw2);
            expect(out.inputs[0].signal).toBe(Signal.Off);

            // 3 inputs
            gate.setNumPorts("inputs", 3);
            expect(out.inputs[0].signal).toBe(Signal.Off);
            sw3.outputs[0].connectTo(gate.inputs[2]);
            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOn(sw3);
            expect(out.inputs[0].signal).toBe(Signal.On);

            // Turning off
            TurnOff(sw1);
            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOff(sw2);
            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOff(sw3);
            expect(out.inputs[0].signal).toBe(Signal.Off);
        });
        test("Metastable", () => {
            const [{}, {}, { Place, TurnOn, TurnOff, TurnMetastable }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "XORGate", "LED");

            gate.setNumPorts("inputs", 3);
            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            sw3.outputs[0].connectTo(gate.inputs[2]);
            gate.outputs[0].connectTo(out.inputs[0]);

            TurnMetastable(sw1);
            expect(out.inputs[0].signal).toBe(Signal.Metastable);
            TurnOn(sw2);
            expect(out.inputs[0].signal).toBe(Signal.Metastable);
            TurnOn(sw3);
            expect(out.inputs[0].signal).toBe(Signal.Metastable);
            TurnOff(sw2);
            expect(out.inputs[0].signal).toBe(Signal.Metastable);
            TurnOff(sw3);
            expect(out.inputs[0].signal).toBe(Signal.Metastable);
        });
    });

    describe("XNORGate", () => {
        test("XNORGate", () => {
            const [{}, {}, { Place, TurnOn, TurnOff }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "XNORGate", "LED");

            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            gate.outputs[0].connectTo(out.inputs[0]);

            // Basic
            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOn(sw1);
            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOn(sw2);
            expect(out.inputs[0].signal).toBe(Signal.On);

            // 3 inputs
            gate.setNumPorts("inputs", 3);
            expect(out.inputs[0].signal).toBe(Signal.On);
            sw3.outputs[0].connectTo(gate.inputs[2]);
            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOn(sw3);
            expect(out.inputs[0].signal).toBe(Signal.Off);

            // Turning off
            TurnOff(sw1);
            expect(out.inputs[0].signal).toBe(Signal.On);
            TurnOff(sw2);
            expect(out.inputs[0].signal).toBe(Signal.Off);
            TurnOff(sw3);
            expect(out.inputs[0].signal).toBe(Signal.On);
        });
        test("Metastable", () => {
            const [{}, {}, { Place, TurnOn, TurnOff, TurnMetastable }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "XNORGate", "LED");

            gate.setNumPorts("inputs", 3);
            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            sw3.outputs[0].connectTo(gate.inputs[2]);
            gate.outputs[0].connectTo(out.inputs[0]);

            TurnMetastable(sw1);
            expect(out.inputs[0].signal).toBe(Signal.Metastable);
            TurnOn(sw2);
            expect(out.inputs[0].signal).toBe(Signal.Metastable);
            TurnOn(sw3);
            expect(out.inputs[0].signal).toBe(Signal.Metastable);
            TurnOff(sw2);
            expect(out.inputs[0].signal).toBe(Signal.Metastable);
            TurnOff(sw3);
            expect(out.inputs[0].signal).toBe(Signal.Metastable);
        });
    });

    // Currently these test will cause a stack overflow
    // test("Create Simple Metastable", () => {
    //     const [{}, {}, { Place, TurnOn, TurnOff, TurnMetastable }] = CreateTestCircuit();
    //     const [g1, g2] = Place("BUFGate", "NOTGate");

    //     expect(g2.outputs[0].signal).toBe(Signal.On);
    //     g1.outputs[0].connectTo(g2.inputs[0]);
    //     expect(g2.outputs[0].signal).toBe(Signal.On);
    //     g2.outputs[0].connectTo(g1.inputs[0]);

    //     expect(g2.outputs[0].signal).toBe(Signal.Metastable);
    // });
    // test("Create S-R Metastable", () => {
    //     // Build S-R Latch out of gates to generate metastable state
    //     const [{}, {}, { Place, TurnOn, TurnOff }] = CreateTestCircuit();
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
