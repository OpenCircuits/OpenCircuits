import "shared/tests/helpers/Extensions";

import {Signal} from "digital/api/circuit/internal/sim/Signal";
import {VersionConflictResolver} from "digital/site/utils/DigitalVersionConflictResolver";
import {V} from "Vector";

import switchCircuit from "./TestCircuitData/Switch.json";
import orCircuit from "./TestCircuitData/OR.json";
import threeInputAndCircuit from "./TestCircuitData/ThreeInputAND.json";
import allInputsCircuit from "./TestCircuitData/Inputs.json";
import ledCiruit from "./TestCircuitData/LED.json";
import segmentDisplayCircuit from "./TestCircuitData/SegmentDisplays.json";
import oscilloscopeCircuit from "./TestCircuitData/Oscilloscope.json";
import srFlipFlopCircuit from "./TestCircuitData/SRFlipFlop.json";
import jkFlipFlopCircuit from "./TestCircuitData/JKFlipFlop.json";
import dFlipFlopCircuit from "./TestCircuitData/DFlipFlop.json";
import tFlipFlopCircuit from "./TestCircuitData/TFlipFlop.json";
import dLatchCircuit from "./TestCircuitData/DLatch.json";
import srLatchCircuit from "./TestCircuitData/SRLatch.json";
import multiplexerCircuit from "./TestCircuitData/Multiplexer.json";
import demultiplexerCircuit from "./TestCircuitData/Demultiplexer.json";
import encoderDecoderCircuit from "./TestCircuitData/EncoderDecoder.json";
import comparatorCircuit from "./TestCircuitData/Comparator.json";
import labelCircuit from "./TestCircuitData/Label.json";
import {CreateCircuit} from "digital/api/circuit/public";


describe("DigitalVersionConflictResolver", () => {
    describe("From version 3.0", () => {
        test("Single Switch", () => {
            const [circuit] = CreateCircuit();
            circuit.loadSchema(VersionConflictResolver(JSON.stringify(switchCircuit)));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(1);
            const sw = comps[0];
            expect(sw.baseKind).toBe("Component");
            expect(sw.kind).toBe("Switch");
            expect(sw.exists()).toBeTruthy();
            expect(sw.pos).toApproximatelyEqual(V(0, 0));

            expect(sw.outputs[0].signal).toBe(Signal.Off);
        });
        test("Basic OR circuit", () => {
            const [circuit] = CreateCircuit();
            circuit.loadSchema(VersionConflictResolver(JSON.stringify(orCircuit)));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(4);
            expect(circuit.getWires()).toHaveLength(3);
            const a = comps.find((comp) => comp.name === "a")!;
            expect(a).toBeDefined();
            const b = comps.find((comp) => comp.name === "b")!;
            expect(b).toBeDefined();
            const orGate = comps.find((comp) => comp.kind === "ORGate")!;
            expect(orGate).toBeDefined();
            const led = comps.find((comp) => comp.name === "Output")!;
            expect(led).toBeDefined();

            expect(a).toBeConnectedTo(orGate);
            expect(b).toBeConnectedTo(orGate);
            expect(led).toBeConnectedTo(orGate);
            expect(orGate.inputs[0].connections[0].id).toBe(a.outputs[0].connections[0].id);

            expect(a.pos).toApproximatelyEqual(V(-4, 1));
            expect(b.pos).toApproximatelyEqual(V(-4, -1));
            expect(orGate.pos).toApproximatelyEqual(V(0, 0));
            expect(led.pos).toApproximatelyEqual(V(3, 2));
        });
        test("Three input AND", () => {
            const [circuit] = CreateCircuit();
            circuit.loadSchema(VersionConflictResolver(JSON.stringify(threeInputAndCircuit)));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(5);
            expect(circuit.getWires()).toHaveLength(4);
            const a = comps.find((comp) => comp.name === "a")!;
            expect(a).toBeDefined();
            const b = comps.find((comp) => comp.name === "b")!;
            expect(b).toBeDefined();
            const c = comps.find((comp) => comp.name === "c")!;
            expect(c).toBeDefined();
            const andGate = comps.find((comp) => comp.kind === "ANDGate")!;
            expect(andGate).toBeDefined();
            const led = comps.find((comp) => comp.kind === "LED")!;
            expect(led).toBeDefined();

            expect(a).toBeConnectedTo(andGate);
            expect(b).toBeConnectedTo(andGate);
            expect(c).toBeConnectedTo(andGate);
            expect(led).toBeConnectedTo(andGate);
            expect(andGate.inputs[2].connections[0].id).toBe(c.outputs[0].connections[0].id);
        });
        test("All inputs", () => {
            const [circuit] = CreateCircuit();
            circuit.loadSchema(VersionConflictResolver(JSON.stringify(allInputsCircuit)));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(8);

            const button = comps.find((comp) => comp.kind === "Button")!;
            expect(button).toBeDefined();
            const low = comps.find((comp) => comp.kind === "ConstantLow")!;
            expect(low).toBeDefined();
            const high = comps.find((comp) => comp.kind === "ConstantHigh")!;
            expect(high).toBeDefined();

            const defaultClock = comps.find((comp) => comp.name === "Default Clock")!;
            expect(defaultClock).toBeDefined();
            expect(defaultClock.getProp("paused")).toBeFalsy();
            expect(defaultClock.getProp("delay")).toBe(1000);
            const customClock = comps.find((comp) => comp.name === "Custom Clock")!;
            expect(customClock).toBeDefined();
            expect(customClock.getProp("paused")).toBeTruthy();
            expect(customClock.getProp("delay")).toBe(800);
            // TODO: Check circuit state when circuit state gets saved to schema
            // expect(customClock.outputs[0].signal).toBe(Signal.On);

            const sw = comps.find((comp) => comp.kind === "Switch")!;
            expect(sw).toBeDefined();
            // TODO: Check circuit state when circuit state gets saved to schema
            // expect(sw.outputs[0].signal).toBe(Signal.On);

            const constantNumber0 = comps.find((comp) => comp.name === "Constant Number 0")!;
            expect(constantNumber0).toBeDefined();
            expect(constantNumber0.getProp("inputNum") === undefined || constantNumber0.getProp("inputNum") === 0).toBeTruthy();
            const constantNumber15 = comps.find((comp) => comp.name === "Constant Number 15")!;
            expect(constantNumber15).toBeDefined();
            expect(constantNumber15.getProp("inputNum")).toBe(15);
        });
        test("LED with custom color", () => {
            const [circuit] = CreateCircuit();
            circuit.loadSchema(VersionConflictResolver(JSON.stringify(ledCiruit)));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(1);
            const led = comps[0];
            expect(led.getProp("color")).toBe("#ff0000");
        });
        test("Segment displays", () => {
            const [circuit] = CreateCircuit();
            circuit.loadSchema(VersionConflictResolver(JSON.stringify(segmentDisplayCircuit)));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(6);

            const segmentDisplay7 = comps.find((comp) => comp.name === "7 Segment Display")!;
            expect(segmentDisplay7).toBeDefined();
            expect(segmentDisplay7.inputs).toHaveLength(7);
            const segmentDisplay16 = comps.find((comp) => comp.name === "16 Segment Display")!;
            expect(segmentDisplay16).toBeDefined();
            expect(segmentDisplay16.inputs).toHaveLength(16);

            const bcdDisplay7 = comps.find((comp) => comp.name === "7 BCD Display")!;
            expect(bcdDisplay7).toBeDefined();
            expect(bcdDisplay7.getProp("segmentCount")).toBe(7);
            const bcdDisplay16 = comps.find((comp) => comp.name === "16 BCD Display")!;
            expect(bcdDisplay16).toBeDefined();
            expect(bcdDisplay16.getProp("segmentCount")).toBe(16);

            const asciiDisplay7 = comps.find((comp) => comp.name === "7 ASCII Display")!;
            expect(asciiDisplay7).toBeDefined();
            expect(asciiDisplay7.getProp("segmentCount")).toBe(7);
            const asciiDisplay16 = comps.find((comp) => comp.name === "16 ASCII Display")!;
            expect(asciiDisplay16).toBeDefined();
            expect(asciiDisplay16.getProp("segmentCount")).toBe(16);
        });
        test("Oscilloscope", () => {
            const [circuit] = CreateCircuit();
            circuit.loadSchema(VersionConflictResolver(JSON.stringify(oscilloscopeCircuit)));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(2);

            const defaultOscilloscope = comps.find((comp) => comp.name === "Default Oscilloscope")!;
            expect(defaultOscilloscope).toBeDefined();
            expect(defaultOscilloscope.inputs).toHaveLength(1);
            expect(defaultOscilloscope.getProp("w")).toApproximatelyEqual(8);
            expect(defaultOscilloscope.getProp("h")).toApproximatelyEqual(4);
            expect(defaultOscilloscope.getProp("delay")).toApproximatelyEqual(100);
            expect(defaultOscilloscope.getProp("samples")).toApproximatelyEqual(100);
            expect(defaultOscilloscope.getProp("paused")).toBeFalsy();
            const customOscilloscope = comps.find((comp) => comp.name === "Custom Oscilloscope")!;
            expect(customOscilloscope).toBeDefined();
            expect(customOscilloscope.inputs).toHaveLength(3);
            expect(customOscilloscope.getProp("w")).toApproximatelyEqual(12);
            expect(customOscilloscope.getProp("h")).toApproximatelyEqual(8);
            expect(customOscilloscope.getProp("delay")).toApproximatelyEqual(250);
            expect(customOscilloscope.getProp("samples")).toApproximatelyEqual(110);
            expect(customOscilloscope.getProp("paused")).toBeTruthy();
        });
        test("SRFlipFlop", () => {
            const [circuit] = CreateCircuit();
            circuit.loadSchema(VersionConflictResolver(JSON.stringify(srFlipFlopCircuit)));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(8);
            expect(circuit.getWires()).toHaveLength(7);
            const pre = comps.find((comp) => comp.name === "PRE")!;
            expect(pre).toBeDefined();
            const s = comps.find((comp) => comp.name === "S")!;
            expect(s).toBeDefined();
            const clk = comps.find((comp) => comp.name === ">")!;
            expect(clk).toBeDefined();
            const r = comps.find((comp) => comp.name === "R")!;
            expect(r).toBeDefined();
            const clr = comps.find((comp) => comp.name === "CLR")!;
            expect(clr).toBeDefined();
            const q = comps.find((comp) => comp.name === "Q")!;
            expect(q).toBeDefined();
            const qinv = comps.find((comp) => comp.name === "Q'")!;
            expect(qinv).toBeDefined();
            const flipFlop = comps.find((comp) => comp.kind === "SRFlipFlop")!;
            expect(flipFlop).toBeDefined();

            expect(flipFlop.ports["S"][0].connections[0].id).toBe(s.outputs[0].connections[0].id);
            expect(flipFlop.ports["R"][0].connections[0].id).toBe(r.outputs[0].connections[0].id);
            expect(flipFlop.ports["clk"][0].connections[0].id).toBe(clk.outputs[0].connections[0].id);
            expect(flipFlop.ports["pre"][0].connections[0].id).toBe(pre.outputs[0].connections[0].id);
            expect(flipFlop.ports["clr"][0].connections[0].id).toBe(clr.outputs[0].connections[0].id);
            expect(flipFlop.ports["Q"][0].connections[0].id).toBe(q.inputs[0].connections[0].id);
            expect(flipFlop.ports["Qinv"][0].connections[0].id).toBe(qinv.inputs[0].connections[0].id);
        });
        test("JKFlipFlop", () => {
            const [circuit] = CreateCircuit();
            circuit.loadSchema(VersionConflictResolver(JSON.stringify(jkFlipFlopCircuit)));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(8);
            expect(circuit.getWires()).toHaveLength(7);
            const pre = comps.find((comp) => comp.name === "PRE")!;
            expect(pre).toBeDefined();
            const j = comps.find((comp) => comp.name === "J")!;
            expect(j).toBeDefined();
            const clk = comps.find((comp) => comp.name === ">")!;
            expect(clk).toBeDefined();
            const k = comps.find((comp) => comp.name === "K")!;
            expect(k).toBeDefined();
            const clr = comps.find((comp) => comp.name === "CLR")!;
            expect(clr).toBeDefined();
            const q = comps.find((comp) => comp.name === "Q")!;
            expect(q).toBeDefined();
            const qinv = comps.find((comp) => comp.name === "Q'")!;
            expect(qinv).toBeDefined();
            const flipFlop = comps.find((comp) => comp.kind === "JKFlipFlop")!;
            expect(flipFlop).toBeDefined();

            expect(flipFlop.ports["J"][0].connections[0].id).toBe(j.outputs[0].connections[0].id);
            expect(flipFlop.ports["K"][0].connections[0].id).toBe(k.outputs[0].connections[0].id);
            expect(flipFlop.ports["clk"][0].connections[0].id).toBe(clk.outputs[0].connections[0].id);
            expect(flipFlop.ports["pre"][0].connections[0].id).toBe(pre.outputs[0].connections[0].id);
            expect(flipFlop.ports["clr"][0].connections[0].id).toBe(clr.outputs[0].connections[0].id);
            expect(flipFlop.ports["Q"][0].connections[0].id).toBe(q.inputs[0].connections[0].id);
            expect(flipFlop.ports["Qinv"][0].connections[0].id).toBe(qinv.inputs[0].connections[0].id);
        });
        test("DFlipFlop", () => {
            const [circuit] = CreateCircuit();
            circuit.loadSchema(VersionConflictResolver(JSON.stringify(dFlipFlopCircuit)));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(7);
            expect(circuit.getWires()).toHaveLength(6);
            const pre = comps.find((comp) => comp.name === "PRE")!;
            expect(pre).toBeDefined();
            const d = comps.find((comp) => comp.name === "D")!;
            expect(d).toBeDefined();
            const clk = comps.find((comp) => comp.name === ">")!;
            expect(clk).toBeDefined();
            const clr = comps.find((comp) => comp.name === "CLR")!;
            expect(clr).toBeDefined();
            const q = comps.find((comp) => comp.name === "Q")!;
            expect(q).toBeDefined();
            const qinv = comps.find((comp) => comp.name === "Q'")!;
            expect(qinv).toBeDefined();
            const flipFlop = comps.find((comp) => comp.kind === "DFlipFlop")!;
            expect(flipFlop).toBeDefined();

            expect(flipFlop.ports["D"][0].connections[0].id).toBe(d.outputs[0].connections[0].id);
            expect(flipFlop.ports["clk"][0].connections[0].id).toBe(clk.outputs[0].connections[0].id);
            expect(flipFlop.ports["pre"][0].connections[0].id).toBe(pre.outputs[0].connections[0].id);
            expect(flipFlop.ports["clr"][0].connections[0].id).toBe(clr.outputs[0].connections[0].id);
            expect(flipFlop.ports["Q"][0].connections[0].id).toBe(q.inputs[0].connections[0].id);
            expect(flipFlop.ports["Qinv"][0].connections[0].id).toBe(qinv.inputs[0].connections[0].id);
        });
        test("TFlipFlop", () => {
            const [circuit] = CreateCircuit();
            circuit.loadSchema(VersionConflictResolver(JSON.stringify(tFlipFlopCircuit)));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(7);
            expect(circuit.getWires()).toHaveLength(6);
            const pre = comps.find((comp) => comp.name === "PRE")!;
            expect(pre).toBeDefined();
            const t = comps.find((comp) => comp.name === "T")!;
            expect(t).toBeDefined();
            const clk = comps.find((comp) => comp.name === ">")!;
            expect(clk).toBeDefined();
            const clr = comps.find((comp) => comp.name === "CLR")!;
            expect(clr).toBeDefined();
            const q = comps.find((comp) => comp.name === "Q")!;
            expect(q).toBeDefined();
            const qinv = comps.find((comp) => comp.name === "Q'")!;
            expect(qinv).toBeDefined();
            const flipFlop = comps.find((comp) => comp.kind === "TFlipFlop")!;
            expect(flipFlop).toBeDefined();

            expect(flipFlop.ports["T"][0].connections[0].id).toBe(t.outputs[0].connections[0].id);
            expect(flipFlop.ports["clk"][0].connections[0].id).toBe(clk.outputs[0].connections[0].id);
            expect(flipFlop.ports["pre"][0].connections[0].id).toBe(pre.outputs[0].connections[0].id);
            expect(flipFlop.ports["clr"][0].connections[0].id).toBe(clr.outputs[0].connections[0].id);
            expect(flipFlop.ports["Q"][0].connections[0].id).toBe(q.inputs[0].connections[0].id);
            expect(flipFlop.ports["Qinv"][0].connections[0].id).toBe(qinv.inputs[0].connections[0].id);
        });
        test("DLatch", () => {
            const [circuit] = CreateCircuit();
            circuit.loadSchema(VersionConflictResolver(JSON.stringify(dLatchCircuit)));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(5);
            expect(circuit.getWires()).toHaveLength(4);
            const e = comps.find((comp) => comp.name === "E")!;
            expect(e).toBeDefined();
            const d = comps.find((comp) => comp.name === "D")!;
            expect(d).toBeDefined();
            const q = comps.find((comp) => comp.name === "Q")!;
            expect(q).toBeDefined();
            const qinv = comps.find((comp) => comp.name === "Q'")!;
            expect(qinv).toBeDefined();
            const flipFlop = comps.find((comp) => comp.kind === "DLatch")!;
            expect(flipFlop).toBeDefined();

            expect(flipFlop.ports["D"][0].connections[0].id).toBe(d.outputs[0].connections[0].id);
            expect(flipFlop.ports["E"][0].connections[0].id).toBe(e.outputs[0].connections[0].id);
            expect(flipFlop.ports["Q"][0].connections[0].id).toBe(q.inputs[0].connections[0].id);
            expect(flipFlop.ports["Qinv"][0].connections[0].id).toBe(qinv.inputs[0].connections[0].id);
        });
        test("SRLatch", () => {
            const [circuit] = CreateCircuit();
            circuit.loadSchema(VersionConflictResolver(JSON.stringify(srLatchCircuit)));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(6);
            expect(circuit.getWires()).toHaveLength(5);
            const e = comps.find((comp) => comp.name === "E")!;
            expect(e).toBeDefined();
            const s = comps.find((comp) => comp.name === "S")!;
            expect(s).toBeDefined();
            const r = comps.find((comp) => comp.name === "R")!;
            expect(r).toBeDefined();
            const q = comps.find((comp) => comp.name === "Q")!;
            expect(q).toBeDefined();
            const qinv = comps.find((comp) => comp.name === "Q'")!;
            expect(qinv).toBeDefined();
            const flipFlop = comps.find((comp) => comp.kind === "SRLatch")!;
            expect(flipFlop).toBeDefined();

            expect(flipFlop.ports["S"][0].connections[0].id).toBe(s.outputs[0].connections[0].id);
            expect(flipFlop.ports["R"][0].connections[0].id).toBe(r.outputs[0].connections[0].id);
            expect(flipFlop.ports["E"][0].connections[0].id).toBe(e.outputs[0].connections[0].id);
            expect(flipFlop.ports["Q"][0].connections[0].id).toBe(q.inputs[0].connections[0].id);
            expect(flipFlop.ports["Qinv"][0].connections[0].id).toBe(qinv.inputs[0].connections[0].id);
        });
        test("Multiplexer", () => {
            const [circuit] = CreateCircuit();
            circuit.loadSchema(VersionConflictResolver(JSON.stringify(multiplexerCircuit)));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(10);
            expect(circuit.getWires()).toHaveLength(9);
            const i0 = comps.find((comp) => comp.name === "I0")!;
            expect(i0).toBeDefined();
            const i1 = comps.find((comp) => comp.name === "I1")!;
            expect(i1).toBeDefined();
            const i2 = comps.find((comp) => comp.name === "I2")!;
            expect(i2).toBeDefined();
            const i3 = comps.find((comp) => comp.name === "I3")!;
            expect(i3).toBeDefined();
            const i7 = comps.find((comp) => comp.name === "I7")!;
            expect(i7).toBeDefined();
            const s0 = comps.find((comp) => comp.name === "S0")!;
            expect(s0).toBeDefined();
            const s1 = comps.find((comp) => comp.name === "S1")!;
            expect(s1).toBeDefined();
            const s2 = comps.find((comp) => comp.name === "S2")!;
            expect(s2).toBeDefined();

            const output = comps.find((comp) => comp.kind === "LED")!;
            expect(output).toBeDefined();
            const multiplexer = comps.find((comp) => comp.kind === "Multiplexer")!;
            expect(multiplexer).toBeDefined();

            expect(multiplexer.ports["inputs"][0].connections[0].id).toBe(i0.outputs[0].connections[0].id);
            expect(multiplexer.ports["inputs"][1].connections[0].id).toBe(i1.outputs[0].connections[0].id);
            expect(multiplexer.ports["inputs"][2].connections[0].id).toBe(i2.outputs[0].connections[0].id);
            expect(multiplexer.ports["inputs"][3].connections[0].id).toBe(i3.outputs[0].connections[0].id);
            expect(multiplexer.ports["inputs"][7].connections[0].id).toBe(i7.outputs[0].connections[0].id);
            expect(multiplexer.ports["selects"][0].connections[0].id).toBe(s0.outputs[0].connections[0].id);
            expect(multiplexer.ports["selects"][1].connections[0].id).toBe(s1.outputs[0].connections[0].id);
            expect(multiplexer.ports["selects"][2].connections[0].id).toBe(s2.outputs[0].connections[0].id);
            expect(multiplexer.outputs[0].connections[0].id).toBe(output.inputs[0].connections[0].id);
        });
        test("Demultiplexer", () => {
            const [circuit] = CreateCircuit();
            circuit.loadSchema(VersionConflictResolver(JSON.stringify(demultiplexerCircuit)));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(10);
            expect(circuit.getWires()).toHaveLength(9);
            const input = comps.find((comp) => comp.name === "Input")!;
            expect(input).toBeDefined();
            const s0 = comps.find((comp) => comp.name === "S0")!;
            expect(s0).toBeDefined();
            const s1 = comps.find((comp) => comp.name === "S1")!;
            expect(s1).toBeDefined();
            const s2 = comps.find((comp) => comp.name === "S2")!;
            expect(s2).toBeDefined();

            const o0 = comps.find((comp) => comp.name === "O0")!;
            expect(o0).toBeDefined();
            const o1 = comps.find((comp) => comp.name === "O1")!;
            expect(o1).toBeDefined();
            const o2 = comps.find((comp) => comp.name === "O2")!;
            expect(o2).toBeDefined();
            const o3 = comps.find((comp) => comp.name === "O3")!;
            expect(o3).toBeDefined();
            const o7 = comps.find((comp) => comp.name === "O7")!;
            expect(o7).toBeDefined();

            const demultiplexer = comps.find((comp) => comp.kind === "Demultiplexer")!;
            expect(demultiplexer).toBeDefined();

            expect(demultiplexer.ports["inputs"][0].connections[0].id).toBe(input.outputs[0].connections[0].id);
            expect(demultiplexer.ports["outputs"][0].connections[0].id).toBe(o0.inputs[0].connections[0].id);
            expect(demultiplexer.ports["outputs"][1].connections[0].id).toBe(o1.inputs[0].connections[0].id);
            expect(demultiplexer.ports["outputs"][2].connections[0].id).toBe(o2.inputs[0].connections[0].id);
            expect(demultiplexer.ports["outputs"][3].connections[0].id).toBe(o3.inputs[0].connections[0].id);
            expect(demultiplexer.ports["outputs"][7].connections[0].id).toBe(o7.inputs[0].connections[0].id);
            expect(demultiplexer.ports["selects"][0].connections[0].id).toBe(s0.outputs[0].connections[0].id);
            expect(demultiplexer.ports["selects"][1].connections[0].id).toBe(s1.outputs[0].connections[0].id);
            expect(demultiplexer.ports["selects"][2].connections[0].id).toBe(s2.outputs[0].connections[0].id);
        });
        test("Encoder/Decoder", () => {
            const [circuit] = CreateCircuit();
            circuit.loadSchema(VersionConflictResolver(JSON.stringify(encoderDecoderCircuit)));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(2);

            const encoder = comps.find((comp) => comp.kind === "Encoder")!;
            expect(encoder).toBeDefined();
            const decoder = comps.find((comp) => comp.kind === "Decoder")!;
            expect(decoder).toBeDefined();

            expect(encoder.inputs).toHaveLength(8);
            expect(encoder.outputs).toHaveLength(3);
            expect(decoder.inputs).toHaveLength(1);
            expect(decoder.outputs).toHaveLength(2);
        });
        test("Comparator", () => {
            const [circuit] = CreateCircuit();
            circuit.loadSchema(VersionConflictResolver(JSON.stringify(comparatorCircuit)));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(10);
            expect(circuit.getWires()).toHaveLength(9);

            const comparator = comps.find((comp) => comp.kind === "Comparator")!;
            expect(comparator).toBeDefined();
            const a0 = comps.find((comp) => comp.name === "a0")!;
            expect(a0).toBeDefined();
            const a1 = comps.find((comp) => comp.name === "a1")!;
            expect(a1).toBeDefined();
            const a2 = comps.find((comp) => comp.name === "a2")!;
            expect(a2).toBeDefined();
            const b0 = comps.find((comp) => comp.name === "b0")!;
            expect(b0).toBeDefined();
            const b1 = comps.find((comp) => comp.name === "b1")!;
            expect(b1).toBeDefined();
            const b2 = comps.find((comp) => comp.name === "b2")!;
            expect(b2).toBeDefined();
            const lt = comps.find((comp) => comp.name === "<")!;
            expect(lt).toBeDefined();
            const eq = comps.find((comp) => comp.name === "=")!;
            expect(eq).toBeDefined();
            const gt = comps.find((comp) => comp.name === ">")!;
            expect(gt).toBeDefined();

            expect(comparator.inputs).toHaveLength(6);
            expect(comparator.outputs).toHaveLength(3);
            expect(comparator.ports["inputsA"]).toHaveLength(3);
            expect(comparator.ports["inputsB"]).toHaveLength(3);

            expect(comparator.ports["inputsA"][0].connections[0].id).toBe(a0.outputs[0].connections[0].id);
            expect(comparator.ports["inputsA"][1].connections[0].id).toBe(a1.outputs[0].connections[0].id);
            expect(comparator.ports["inputsA"][2].connections[0].id).toBe(a2.outputs[0].connections[0].id);
            expect(comparator.ports["inputsB"][0].connections[0].id).toBe(b0.outputs[0].connections[0].id);
            expect(comparator.ports["inputsB"][1].connections[0].id).toBe(b1.outputs[0].connections[0].id);
            expect(comparator.ports["inputsB"][2].connections[0].id).toBe(b2.outputs[0].connections[0].id);
            expect(comparator.ports["lt"][0].connections[0].id).toBe(lt.inputs[0].connections[0].id);
            expect(comparator.ports["eq"][0].connections[0].id).toBe(eq.inputs[0].connections[0].id);
            expect(comparator.ports["gt"][0].connections[0].id).toBe(gt.inputs[0].connections[0].id);
        });
        test("Label", () => {
            const [circuit] = CreateCircuit();
            circuit.loadSchema(VersionConflictResolver(JSON.stringify(labelCircuit)));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(1);
            const label = comps[0];
            expect(label.name).toBe("Test label");
            expect(label.getProp("bgColor")).toBe("#0000ff");
            expect(label.getProp("textColor")).toBe("#ffffff");
        });
    });
});
