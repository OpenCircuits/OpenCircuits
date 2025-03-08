import "shared/tests/helpers/Extensions";

import {CreateCircuit} from "digital/api/circuit/public";
import {V} from "Vector";
import {Signal} from "digital/api/circuit/utils/Signal";
import {turnMetastable, turnOff, turnOn} from "./Helpers";

describe("Gates", () => {
    describe("Buffer", () => {
        test("Standard", () => {
            const [circuit, { sim }] = CreateCircuit();
            const sw = circuit.placeComponentAt("Switch", V(0, 0));
            const gate = circuit.placeComponentAt("Buffer", V(2, 0));
            const out = circuit.placeComponentAt("LED", V(3, 0));

            const outputsPort = out.ports["input"][0];
            sw.ports["output"][0].connectTo(gate.ports["input"][0]);
            gate.ports["output"][0].connectTo(outputsPort);

            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
            turnOn(sim, sw);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOff(sim, sw);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
        });
        test("Metastable", () => {
            const [circuit, { sim }] = CreateCircuit();
            const sw = circuit.placeComponentAt("Switch", V(0, 0));
            const gate = circuit.placeComponentAt("Buffer", V(2, 0));
            const out = circuit.placeComponentAt("LED", V(3, 0));

            const outputsPort = out.ports["input"][0];
            sw.ports["output"][0].connectTo(gate.ports["input"][0]);
            gate.ports["output"][0].connectTo(outputsPort);

            turnMetastable(sim, sw);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Metastable);
            turnOff(sim, sw);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
        });
    });

    describe("NOTGate", () => {
        test("Basic", () => {
            const [circuit, { sim }] = CreateCircuit();
            const sw = circuit.placeComponentAt("Switch", V(0, 0));
            const gate = circuit.placeComponentAt("Buffer", V(2, 0));
            const out = circuit.placeComponentAt("LED", V(3, 0));

            const outputsPort = out.ports["input"][0];
            sw.ports["output"][0].connectTo(gate.ports["input"][0]);
            gate.ports["output"][0].connectTo(outputsPort);

            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOn(sim, sw);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
            turnOff(sim, sw);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
        });
        test("Metastable", () => {
            const [circuit, { sim }] = CreateCircuit();
            const sw = circuit.placeComponentAt("Switch", V(0, 0));
            const gate = circuit.placeComponentAt("Buffer", V(2, 0));
            const out = circuit.placeComponentAt("LED", V(3, 0));

            const outputsPort = out.ports["input"][0];
            sw.ports["output"][0].connectTo(gate.ports["input"][0]);
            gate.ports["output"][0].connectTo(outputsPort);

            turnMetastable(sim, sw);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Metastable);
            turnOff(sim, sw);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
        });
    });

    describe("ANDGate", () => {
        test("Basic", () => {
            const [circuit, { sim }] = CreateCircuit();
            const sw1 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw2 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw3 = circuit.placeComponentAt("Switch", V(0, 0));
            const gate = circuit.placeComponentAt("ANDGate", V(2, 0));
            const out = circuit.placeComponentAt("LED", V(3, 0));

            const outputsPort = out.ports["input"][0];
            sw1.ports["output"][0].connectTo(gate.ports["input"][0]);
            sw2.ports["output"][0].connectTo(gate.ports["input"][1]);
            gate.ports["output"][0].connectTo(outputsPort);

            // Basic
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
            turnOn(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
            turnOn(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);

            // 3 inputs
            gate.setNumPorts("inputs", 3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
            sw2.ports["output"][1].connectTo(gate.ports["input"][2]);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
            turnOn(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);

            // Turning off
            turnOff(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
            turnOff(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
            turnOff(sim, sw3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
        });
        test("Metastable", () => {
            const [circuit, { sim }] = CreateCircuit();
            const sw1 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw2 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw3 = circuit.placeComponentAt("Switch", V(0, 0));
            const gate = circuit.placeComponentAt("ANDGate", V(2, 0));
            const out = circuit.placeComponentAt("LED", V(3, 0));

            gate.setNumPorts("inputs", 3);
            const outputsPort = out.ports["input"][0];
            sw1.ports["output"][0].connectTo(gate.ports["input"][0]);
            sw2.ports["output"][0].connectTo(gate.ports["input"][1]);
            gate.ports["output"][0].connectTo(outputsPort);
            sw2.ports["output"][1].connectTo(gate.ports["input"][2]);

            turnMetastable(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
            turnOn(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
            turnOn(sim, sw3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Metastable);
            turnOff(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
            turnOff(sim, sw3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
        });
    });

    describe("NANDGate", () => {
        test("Basic", () => {
            const [circuit, { sim }] = CreateCircuit();
            const sw1 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw2 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw3 = circuit.placeComponentAt("Switch", V(0, 0));
            const gate = circuit.placeComponentAt("NANDGate", V(2, 0));
            const out = circuit.placeComponentAt("LED", V(3, 0));

            const outputsPort = out.ports["input"][0];
            sw1.ports["output"][0].connectTo(gate.ports["input"][0]);
            sw2.ports["output"][0].connectTo(gate.ports["input"][1]);
            gate.ports["output"][0].connectTo(outputsPort);

            // Basic
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOn(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOn(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);

            // 3 inputs
            gate.setNumPorts("inputs", 3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            sw2.ports["output"][1].connectTo(gate.ports["input"][2]);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOn(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);

            // Turning off
            turnOff(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOff(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOff(sim, sw3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
        });
        test("Metastable", () => {
            const [circuit, { sim }] = CreateCircuit();
            const sw1 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw2 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw3 = circuit.placeComponentAt("Switch", V(0, 0));
            const gate = circuit.placeComponentAt("NANDGate", V(2, 0));
            const out = circuit.placeComponentAt("LED", V(3, 0));

            gate.setNumPorts("inputs", 3);
            const outputsPort = out.ports["input"][0];
            sw1.ports["output"][0].connectTo(gate.ports["input"][0]);
            sw2.ports["output"][0].connectTo(gate.ports["input"][1]);
            gate.ports["output"][0].connectTo(outputsPort);
            sw2.ports["output"][1].connectTo(gate.ports["input"][2]);

            turnMetastable(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOn(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOn(sim, sw3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Metastable);
            turnOff(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOff(sim, sw3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
        });
    });

    describe("ORGate", () => {
        test("Basic", () => {
            const [circuit, { sim }] = CreateCircuit();
            const sw1 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw2 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw3 = circuit.placeComponentAt("Switch", V(0, 0));
            const gate = circuit.placeComponentAt("ORGate", V(2, 0));
            const out = circuit.placeComponentAt("LED", V(3, 0));

            const outputsPort = out.ports["input"][0];
            sw1.ports["output"][0].connectTo(gate.ports["input"][0]);
            sw2.ports["output"][0].connectTo(gate.ports["input"][1]);
            gate.ports["output"][0].connectTo(outputsPort);

            // Basic
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
            turnOn(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOn(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);

            // 3 inputs
            gate.setNumPorts("inputs", 3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            sw2.ports["output"][1].connectTo(gate.ports["input"][2]);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOn(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);

            // Turning off
            turnOff(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOff(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOff(sim, sw3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
        });
        test("Metastable", () => {
            const [circuit, { sim }] = CreateCircuit();
            const sw1 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw2 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw3 = circuit.placeComponentAt("Switch", V(0, 0));
            const gate = circuit.placeComponentAt("ORGate", V(2, 0));
            const out = circuit.placeComponentAt("LED", V(3, 0));

            gate.setNumPorts("inputs", 3);
            const outputsPort = out.ports["input"][0];
            sw1.ports["output"][0].connectTo(gate.ports["input"][0]);
            sw2.ports["output"][0].connectTo(gate.ports["input"][1]);
            sw2.ports["output"][1].connectTo(gate.ports["input"][2]);
            gate.ports["output"][0].connectTo(outputsPort);

            turnMetastable(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Metastable);
            turnOn(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOn(sim, sw3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOff(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOff(sim, sw3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Metastable);
        });
    });

    describe("NORGate", () => {
        test("Basic", () => {
            const [circuit, { sim }] = CreateCircuit();
            const sw1 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw2 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw3 = circuit.placeComponentAt("Switch", V(0, 0));
            const gate = circuit.placeComponentAt("NORGate", V(2, 0));
            const out = circuit.placeComponentAt("LED", V(3, 0));

            const outputsPort = out.ports["input"][0];
            sw1.ports["output"][0].connectTo(gate.ports["input"][0]);
            sw2.ports["output"][0].connectTo(gate.ports["input"][1]);
            gate.ports["output"][0].connectTo(outputsPort);

            // Basic
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
            turnOn(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOn(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);

            // 3 inputs
            gate.setNumPorts("inputs", 3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            sw2.ports["output"][1].connectTo(gate.ports["input"][2]);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOn(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);

            // Turning off
            turnOff(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOff(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOff(sim, sw3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
        });
        test("Metastable", () => {
            const [circuit, { sim }] = CreateCircuit();
            const sw1 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw2 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw3 = circuit.placeComponentAt("Switch", V(0, 0));
            const gate = circuit.placeComponentAt("ORGate", V(2, 0));
            const out = circuit.placeComponentAt("LED", V(3, 0));

            gate.setNumPorts("inputs", 3);
            const outputsPort = out.ports["input"][0];
            sw1.ports["output"][0].connectTo(gate.ports["input"][0]);
            sw2.ports["output"][0].connectTo(gate.ports["input"][1]);
            sw2.ports["output"][1].connectTo(gate.ports["input"][2]);
            gate.ports["output"][0].connectTo(outputsPort);

            turnMetastable(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Metastable);
            turnOn(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
            turnOn(sim, sw3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
            turnOff(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
            turnOff(sim, sw3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Metastable);
        });
    })

    describe("XORGate", () => {
        test("Basic", () => {
            const [circuit, { sim }] = CreateCircuit();
            const sw1 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw2 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw3 = circuit.placeComponentAt("Switch", V(0, 0));
            const gate = circuit.placeComponentAt("XORGate", V(2, 0));
            const out = circuit.placeComponentAt("LED", V(3, 0));

            const outputsPort = out.ports["input"][0];
            sw1.ports["output"][0].connectTo(gate.ports["input"][0]);
            sw2.ports["output"][0].connectTo(gate.ports["input"][1]);
            gate.ports["output"][0].connectTo(outputsPort);

            // Basic
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
            turnOn(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOn(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);

            // 3 inputs
            gate.setNumPorts("inputs", 3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
            sw2.ports["output"][1].connectTo(gate.ports["input"][2]);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
            turnOn(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);

            // Turning off
            turnOff(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
            turnOff(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOff(sim, sw3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
        });
        test("Metastable", () => {
            const [circuit, { sim }] = CreateCircuit();
            const sw1 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw2 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw3 = circuit.placeComponentAt("Switch", V(0, 0));
            const gate = circuit.placeComponentAt("XORGate", V(2, 0));
            const out = circuit.placeComponentAt("LED", V(3, 0));

            gate.setNumPorts("inputs", 3);
            const outputsPort = out.ports["input"][0];
            sw1.ports["output"][0].connectTo(gate.ports["input"][0]);
            sw2.ports["output"][0].connectTo(gate.ports["input"][1]);
            sw2.ports["output"][1].connectTo(gate.ports["input"][2]);
            gate.ports["output"][0].connectTo(outputsPort);

            turnMetastable(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Metastable);
            turnOn(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Metastable);
            turnOn(sim, sw3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Metastable);
            turnOff(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Metastable);
            turnOff(sim, sw3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Metastable);
        });
    });

    describe("XNORGate", () => {
        test("XNORGate", () => {
            const [circuit, { sim }] = CreateCircuit();
            const sw1 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw2 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw3 = circuit.placeComponentAt("Switch", V(0, 0));
            const gate = circuit.placeComponentAt("XNORGate", V(2, 0));
            const out = circuit.placeComponentAt("LED", V(3, 0));

            const outputsPort = out.ports["input"][0];
            sw1.ports["output"][0].connectTo(gate.ports["input"][0]);
            sw2.ports["output"][0].connectTo(gate.ports["input"][1]);
            gate.ports["output"][0].connectTo(outputsPort);

            // Basic
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOn(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
            turnOn(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);

            // 3 inputs
            gate.setNumPorts("inputs", 3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            sw2.ports["output"][1].connectTo(gate.ports["input"][2]);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOn(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);

            // Turning off
            turnOff(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
            turnOff(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Off);
            turnOff(sim, sw3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.On);
        });
        test("Metastable", () => {
            const [circuit, { sim }] = CreateCircuit();
            const sw1 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw2 = circuit.placeComponentAt("Switch", V(0, 0));
            const sw3 = circuit.placeComponentAt("Switch", V(0, 0));
            const gate = circuit.placeComponentAt("XNORGate", V(2, 0));
            const out = circuit.placeComponentAt("LED", V(3, 0));

            gate.setNumPorts("inputs", 3);
            const outputsPort = out.ports["input"][0];
            sw1.ports["output"][0].connectTo(gate.ports["input"][0]);
            sw2.ports["output"][0].connectTo(gate.ports["input"][1]);
            sw2.ports["output"][1].connectTo(gate.ports["input"][2]);
            gate.ports["output"][0].connectTo(outputsPort);

            turnMetastable(sim, sw1);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Metastable);
            turnOn(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Metastable);
            turnOn(sim, sw3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Metastable);
            turnOff(sim, sw2);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Metastable);
            turnOff(sim, sw3);
            expect(sim.getSignal(outputsPort.id)).toBe(Signal.Metastable);
        });
    });
});
