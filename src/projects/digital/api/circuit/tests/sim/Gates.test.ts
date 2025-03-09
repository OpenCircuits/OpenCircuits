import "shared/tests/helpers/Extensions";

import {Signal} from "digital/api/circuit/utils/Signal";
import {CreateTestCircuit} from "tests/helpers/CreateTestCircuit";

describe("Gates", () => {
    describe("Buffer", () => {
        test("Standard", () => {
            const [_, { Place, GetSignal, TurnOn, TurnOff }] = CreateTestCircuit();
            const [sw, gate, out] = Place("Switch", "Buffer", "LED");

            const outputsPort = out.inputs[0];
            sw.outputs[0].connectTo(gate.inputs[0]);
            gate.outputs[0].connectTo(outputsPort);

            expect(GetSignal(outputsPort)).toBe(Signal.Off);
            TurnOn(sw);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOff(sw);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
        });
        test("Metastable", () => {
            const [_, { Place, GetSignal, TurnMetastable, TurnOff }] = CreateTestCircuit();
            const [sw, gate, out] = Place("Switch", "Buffer", "LED");

            const outputsPort = out.inputs[0];
            sw.outputs[0].connectTo(gate.inputs[0]);
            gate.outputs[0].connectTo(outputsPort);

            TurnMetastable(sw);
            expect(GetSignal(outputsPort)).toBe(Signal.Metastable);
            TurnOff(sw);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
        });
    });

    describe("NOTGate", () => {
        test("Basic", () => {
            const [_, { Place, GetSignal, TurnOn, TurnOff }] = CreateTestCircuit();
            const [sw, gate, out] = Place("Switch", "NOTGate", "LED");

            const outputsPort = out.inputs[0];
            sw.outputs[0].connectTo(gate.inputs[0]);
            gate.outputs[0].connectTo(outputsPort);

            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOn(sw);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
            TurnOff(sw);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
        });
        test("Metastable", () => {
            const [_, { Place, GetSignal, TurnMetastable, TurnOff }] = CreateTestCircuit();
            const [sw, gate, out] = Place("Switch", "NOTGate", "LED");

            const outputsPort = out.inputs[0];
            sw.outputs[0].connectTo(gate.inputs[0]);
            gate.outputs[0].connectTo(outputsPort);

            TurnMetastable(sw);
            expect(GetSignal(outputsPort)).toBe(Signal.Metastable);
            TurnOff(sw);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
        });
    });

    describe("ANDGate", () => {
        test("Basic", () => {
            const [_, { Place, GetSignal, TurnOn, TurnOff }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "ANDGate", "LED");

            const outputsPort = out.inputs[0];
            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            gate.outputs[0].connectTo(outputsPort);

            // Basic
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
            TurnOn(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
            TurnOn(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.On);

            // 3 inputs
            gate.setNumPorts("inputs", 3);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
            sw2.outputs[1].connectTo(gate.inputs[2]);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
            TurnOn(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.On);

            // Turning off
            TurnOff(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
            TurnOff(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
            TurnOff(sw3);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
        });
        test("Metastable", () => {
            const [_, { Place, GetSignal, TurnOn, TurnOff, TurnMetastable }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "ANDGate", "LED");

            gate.setNumPorts("inputs", 3);
            const outputsPort = out.inputs[0];
            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            gate.outputs[0].connectTo(outputsPort);
            sw2.outputs[1].connectTo(gate.inputs[2]);

            TurnMetastable(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
            TurnOn(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
            TurnOn(sw3);
            expect(GetSignal(outputsPort)).toBe(Signal.Metastable);
            TurnOff(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
            TurnOff(sw3);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
        });
    });

    describe("NANDGate", () => {
        test("Basic", () => {
            const [_, { Place, GetSignal, TurnOn, TurnOff }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "NANDGate", "LED");

            const outputsPort = out.inputs[0];
            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            gate.outputs[0].connectTo(outputsPort);

            // Basic
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOn(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOn(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);

            // 3 inputs
            gate.setNumPorts("inputs", 3);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            sw2.outputs[1].connectTo(gate.inputs[2]);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOn(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);

            // Turning off
            TurnOff(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOff(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOff(sw3);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
        });
        test("Metastable", () => {
            const [_, { Place, GetSignal, TurnOn, TurnOff, TurnMetastable }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "NANDGate", "LED");

            gate.setNumPorts("inputs", 3);
            const outputsPort = out.inputs[0];
            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            gate.outputs[0].connectTo(outputsPort);
            sw2.outputs[1].connectTo(gate.inputs[2]);

            TurnMetastable(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOn(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOn(sw3);
            expect(GetSignal(outputsPort)).toBe(Signal.Metastable);
            TurnOff(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOff(sw3);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
        });
    });

    describe("ORGate", () => {
        test("Basic", () => {
            const [_, { Place, GetSignal, TurnOn, TurnOff }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "ORGate", "LED");

            const outputsPort = out.inputs[0];
            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            gate.outputs[0].connectTo(outputsPort);

            // Basic
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
            TurnOn(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOn(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.On);

            // 3 inputs
            gate.setNumPorts("inputs", 3);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            sw2.outputs[1].connectTo(gate.inputs[2]);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOn(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.On);

            // Turning off
            TurnOff(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOff(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOff(sw3);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
        });
        test("Metastable", () => {
            const [_, { Place, GetSignal, TurnOn, TurnOff, TurnMetastable }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "ORGate", "LED");

            gate.setNumPorts("inputs", 3);
            const outputsPort = out.inputs[0];
            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            sw2.outputs[1].connectTo(gate.inputs[2]);
            gate.outputs[0].connectTo(outputsPort);

            TurnMetastable(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.Metastable);
            TurnOn(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOn(sw3);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOff(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOff(sw3);
            expect(GetSignal(outputsPort)).toBe(Signal.Metastable);
        });
    });

    describe("NORGate", () => {
        test("Basic", () => {
            const [_, { Place, GetSignal, TurnOn, TurnOff }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "NORGate", "LED");

            const outputsPort = out.inputs[0];
            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            gate.outputs[0].connectTo(outputsPort);

            // Basic
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
            TurnOn(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOn(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.On);

            // 3 inputs
            gate.setNumPorts("inputs", 3);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            sw2.outputs[1].connectTo(gate.inputs[2]);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOn(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.On);

            // Turning off
            TurnOff(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOff(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOff(sw3);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
        });
        test("Metastable", () => {
            const [_, { Place, GetSignal, TurnOn, TurnOff, TurnMetastable }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "NORGate", "LED");

            gate.setNumPorts("inputs", 3);
            const outputsPort = out.inputs[0];
            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            sw2.outputs[1].connectTo(gate.inputs[2]);
            gate.outputs[0].connectTo(outputsPort);

            TurnMetastable(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.Metastable);
            TurnOn(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
            TurnOn(sw3);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
            TurnOff(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
            TurnOff(sw3);
            expect(GetSignal(outputsPort)).toBe(Signal.Metastable);
        });
    })

    describe("XORGate", () => {
        test("Basic", () => {
            const [_, { Place, GetSignal, TurnOn, TurnOff }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "XORGate", "LED");

            const outputsPort = out.inputs[0];
            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            gate.outputs[0].connectTo(outputsPort);

            // Basic
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
            TurnOn(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOn(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);

            // 3 inputs
            gate.setNumPorts("inputs", 3);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
            sw2.outputs[1].connectTo(gate.inputs[2]);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
            TurnOn(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.On);

            // Turning off
            TurnOff(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
            TurnOff(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOff(sw3);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
        });
        test("Metastable", () => {
            const [_, { Place, GetSignal, TurnOn, TurnOff, TurnMetastable }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "XORGate", "LED");

            gate.setNumPorts("inputs", 3);
            const outputsPort = out.inputs[0];
            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            sw2.outputs[1].connectTo(gate.inputs[2]);
            gate.outputs[0].connectTo(outputsPort);

            TurnMetastable(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.Metastable);
            TurnOn(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.Metastable);
            TurnOn(sw3);
            expect(GetSignal(outputsPort)).toBe(Signal.Metastable);
            TurnOff(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.Metastable);
            TurnOff(sw3);
            expect(GetSignal(outputsPort)).toBe(Signal.Metastable);
        });
    });

    describe("XNORGate", () => {
        test("XNORGate", () => {
            const [_, { Place, GetSignal, TurnOn, TurnOff }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "XNORGate", "LED");

            const outputsPort = out.inputs[0];
            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            gate.outputs[0].connectTo(outputsPort);

            // Basic
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOn(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
            TurnOn(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.On);

            // 3 inputs
            gate.setNumPorts("inputs", 3);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            sw2.outputs[1].connectTo(gate.inputs[2]);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOn(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);

            // Turning off
            TurnOff(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
            TurnOff(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.Off);
            TurnOff(sw3);
            expect(GetSignal(outputsPort)).toBe(Signal.On);
        });
        test("Metastable", () => {
            const [_, { Place, GetSignal, TurnOn, TurnOff, TurnMetastable }] = CreateTestCircuit();
            const [sw1, sw2, sw3, gate, out] = Place("Switch", "Switch", "Switch", "XNORGate", "LED");

            gate.setNumPorts("inputs", 3);
            const outputsPort = out.inputs[0];
            sw1.outputs[0].connectTo(gate.inputs[0]);
            sw2.outputs[0].connectTo(gate.inputs[1]);
            sw2.outputs[1].connectTo(gate.inputs[2]);
            gate.outputs[0].connectTo(outputsPort);

            TurnMetastable(sw1);
            expect(GetSignal(outputsPort)).toBe(Signal.Metastable);
            TurnOn(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.Metastable);
            TurnOn(sw3);
            expect(GetSignal(outputsPort)).toBe(Signal.Metastable);
            TurnOff(sw2);
            expect(GetSignal(outputsPort)).toBe(Signal.Metastable);
            TurnOff(sw3);
            expect(GetSignal(outputsPort)).toBe(Signal.Metastable);
        });
    });

    test("Create Metastable", () => {
        // Build S-R Latch out of gates to generate metastable state
        const [_, { Place, GetSignal, TurnOn, TurnOff }] = CreateTestCircuit();
        const [sw1, sw2, sw3, and1, and2, nor1, nor2, out1, out2] = Place("Switch", "Switch", "Switch", "ANDGate", "ANDGate", "NORGate", "NORGate", "LED", "LED");

        sw1.outputs[0].connectTo(and1.inputs[0]);
        sw2.outputs[0].connectTo(and1.inputs[1]);
        sw2.outputs[0].connectTo(and2.inputs[0]);
        sw3.outputs[0].connectTo(and2.inputs[0]);

        and1.outputs[0].connectTo(nor1.inputs[0]);
        and2.outputs[0].connectTo(nor2.inputs[1]);

        nor1.outputs[0].connectTo(out1.inputs[0]);
        nor1.outputs[0].connectTo(nor2.inputs[0]);
        nor2.outputs[0].connectTo(nor1.inputs[1]);
        nor2.outputs[0].connectTo(out2.inputs[0]);

        TurnOn(sw1);
        TurnOn(sw2);
        TurnOn(sw3);
        TurnOff(sw2);

        expect(GetSignal(out1.outputs[0])).toBe(Signal.Metastable);
        expect(GetSignal(out2.outputs[0])).toBe(Signal.Metastable);
    });
});
