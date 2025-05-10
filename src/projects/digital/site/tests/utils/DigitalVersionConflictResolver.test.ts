import "digital/api/circuit/tests/helpers/Extensions";
import "shared/tests/helpers/Extensions";

import {Signal} from "digital/api/circuit/schema/Signal";
import {VersionConflictResolver} from "digital/site/utils/DigitalVersionConflictResolver";
import {V} from "Vector";

import switchCircuit from "./TestCircuitData/3_0/Switch.json";
import orCircuit from "./TestCircuitData/3_0/OR.json";
import poweredOrCircuit from "./TestCircuitData/3_0/PoweredOR.json";
import threeInputAndCircuit from "./TestCircuitData/3_0/ThreeInputAND.json";
import allInputsCircuit from "./TestCircuitData/3_0/Inputs.json";
import ledCiruit from "./TestCircuitData/3_0/LED.json";
import segmentDisplayCircuit from "./TestCircuitData/3_0/SegmentDisplays.json";
import oscilloscopeCircuit from "./TestCircuitData/3_0/Oscilloscope.json";
import srFlipFlopCircuit from "./TestCircuitData/3_0/SRFlipFlop.json";
import jkFlipFlopCircuit from "./TestCircuitData/3_0/JKFlipFlop.json";
import dFlipFlopCircuit from "./TestCircuitData/3_0/DFlipFlop.json";
import tFlipFlopCircuit from "./TestCircuitData/3_0/TFlipFlop.json";
import dLatchCircuit from "./TestCircuitData/3_0/DLatch.json";
import srLatchCircuit from "./TestCircuitData/3_0/SRLatch.json";
import multiplexerCircuit from "./TestCircuitData/3_0/Multiplexer.json";
import demultiplexerCircuit from "./TestCircuitData/3_0/Demultiplexer.json";
import encoderDecoderCircuit from "./TestCircuitData/3_0/EncoderDecoder.json";
import comparatorCircuit from "./TestCircuitData/3_0/Comparator.json";
import labelCircuit from "./TestCircuitData/3_0/Label.json";
import nodesCircuit from "./TestCircuitData/3_0/Nodes.json";
import icDataOnlyCircuit from "./TestCircuitData/3_0/ICDataOnly.json";
import basicICCircuit from "./TestCircuitData/3_0/BasicIC.json";
import nestedICCircuit from "./TestCircuitData/3_0/NestedIC.json";
import zIndexCircuit from "./TestCircuitData/3_0/ZIndex.json";
import clockInICOffCircuit from "./TestCircuitData/3_0/ClockInICOff.json";
import clockInICOnCircuit from "./TestCircuitData/3_0/ClockInICOn.json";
import threeInputICCircuit from "./TestCircuitData/3_0/ThreeInputIC.json";
import inputOrderICCircuit from "./TestCircuitData/3_0/InputOrderIC.json";
import allSidesICCircuit from "./TestCircuitData/3_0/AllSidesIC.json";
import {CreateTestCircuit} from "digital/api/circuit/tests/helpers/CreateTestCircuit";
import {IMPORT_IC_CLOCK_MESSAGE} from "digital/site/utils/Constants";


describe("DigitalVersionConflictResolver", () => {
    describe("From version 3.0", () => {
        test("Single Switch", () => {
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(switchCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
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
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(orCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
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
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(threeInputAndCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
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
        test("Powered OR circuit", () => {
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(poweredOrCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
            const comps = circuit.getComponents();
            const led = comps.find((comp) => comp.kind === "LED")!;
            expect(led).toBeOn();
        });
        test("All inputs", () => {
            const [circuit] = CreateTestCircuit(/* sim= */false);  // Disable sim since it will queue infinitely
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(allInputsCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
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
            expect(customClock.outputs[0].signal).toBe(Signal.On);

            const sw = comps.find((comp) => comp.kind === "Switch")!;
            expect(sw).toBeDefined();
            expect(sw.outputs[0].signal).toBe(Signal.On);

            const constantNumber0 = comps.find((comp) => comp.name === "Constant Number 0")!;
            expect(constantNumber0).toBeDefined();
            expect(constantNumber0.getProp("inputNum") === undefined || constantNumber0.getProp("inputNum") === 0).toBeTruthy();
            const constantNumber15 = comps.find((comp) => comp.name === "Constant Number 15")!;
            expect(constantNumber15).toBeDefined();
            expect(constantNumber15.getProp("inputNum")).toBe(15);
        });
        test("LED with custom color", () => {
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(ledCiruit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(1);
            const led = comps[0];
            expect(led.getProp("color")).toBe("#ff0000");
        });
        test("Segment displays", () => {
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(segmentDisplayCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
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
            const [circuit] = CreateTestCircuit(/* sim= */false);  // Disable sim since it will queue infinitely
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(oscilloscopeCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
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
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(srFlipFlopCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
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
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(jkFlipFlopCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
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
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(dFlipFlopCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
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
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(tFlipFlopCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
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
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(dLatchCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
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
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(srLatchCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
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
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(multiplexerCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
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
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(demultiplexerCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
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
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(encoderDecoderCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
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
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(comparatorCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
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
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(labelCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(1);
            const label = comps[0];
            expect(label.name).toBe("Test label");
            expect(label.getProp("bgColor")).toBe("#0000ff");
            expect(label.getProp("textColor")).toBe("#ffffff");
        });
        test("Nodes", () => {
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(nodesCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(5);
            expect(circuit.getWires()).toHaveLength(4);
        });
        test("IC Data Only (no instances)", () => {
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(icDataOnlyCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(0);
            const ics = circuit.getICs();
            expect(ics).toHaveLength(1);
            const ic = ics[0];
            expect(ic.display.pins).toHaveLength(3);
            expect(ic.display.size).toEqual(V(2.8, 1));
            expect(ic.display.pins.filter(({ name }) => name === "Switch")).toHaveLength(2);
            expect(ic.display.pins.filter(({ name }) => name === "LED")).toHaveLength(1);
        });
        test("Basic IC", () => {
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(basicICCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(1);
            const icInstance = comps[0];
            const ics = circuit.getICs();
            expect(ics).toHaveLength(1);
            const icData = ics[0];
            expect(icInstance.kind).toBe(icData.id);
            expect(icInstance.inputs).toHaveLength(2);
            expect(icInstance.outputs).toHaveLength(1);
            const inputPortA = icInstance.inputs.find(({ name }) => name === "a")!;
            const inputPortB = icInstance.inputs.find(({ name }) => name === "b")!;
            expect(inputPortA).toBeDefined();
            expect(inputPortB).toBeDefined();
            expect(inputPortA.originPos.y).toBeGreaterThan(inputPortB.originPos.y);
        });
        test("Nested IC", () => {
            const [circuit, _, { Place, Connect, TurnOn }] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(nestedICCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(1);
            const icInstance = comps[0];
            const ics = circuit.getICs();
            expect(ics).toHaveLength(2);
            const outerIC = ics.find((ic) => ic.name === "Outer")!;
            expect(outerIC).toBeDefined();
            expect(icInstance.kind).toBe(outerIC.id);

            const [sw1, sw2, led] = Place("Switch", "Switch", "LED");
            Connect(sw1, icInstance.inputs[0]);
            Connect(sw2, icInstance.inputs[1]);
            Connect(icInstance, led);

            expect(led).toBeOff();
            TurnOn(sw1);
            TurnOn(sw2);
            expect(led).toBeOn();
        });
        test("Z Index", () => {
            const [circuit, _, { }] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(zIndexCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(3);
            const bottom = comps.find(({ name }) => name === "Bottom")!;
            const middle = comps.find(({ name }) => name === "Middle")!;
            const top = comps.find(({ name }) => name === "Top")!;
            expect(bottom).toBeDefined();
            expect(middle).toBeDefined();
            expect(top).toBeDefined();

            expect(bottom.getProp("zIndex")).toBeDefined();
            expect(middle.getProp("zIndex")).toBeDefined();
            expect(top.getProp("zIndex")).toBeDefined();

            expect(bottom.getProp("zIndex")).toBeLessThan(middle.getProp("zIndex") as number);
            expect(middle.getProp("zIndex")).toBeLessThan(top.getProp("zIndex") as number);
        });
        test("Clock in IC (off)", () => {
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(clockInICOffCircuit));
            expect(warnings).toBeDefined();
            expect(warnings).toHaveLength(1);
            expect(warnings).toContain(IMPORT_IC_CLOCK_MESSAGE);
            circuit.loadSchema(schema);

            const comps = circuit.getComponents();
            expect(comps).toHaveLength(2);
            const icInstance = comps.find(({ kind }) => kind !== "LED")!;
            const led = comps.find(({ kind }) => kind === "LED")!;
            expect(icInstance).toBeDefined();
            expect(led).toBeDefined();

            const ics = circuit.getICs();
            expect(ics).toHaveLength(1);
            const icData = ics[0];
            expect(icInstance.kind).toBe(icData.id);
            expect(icInstance.inputs).toHaveLength(0);
            expect(icInstance.outputs).toHaveLength(1);

            expect(led).toBeOff();
        });
        test("Clock in IC (on)", () => {
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(clockInICOnCircuit));
            expect(warnings).toBeDefined();
            expect(warnings).toHaveLength(1);
            expect(warnings).toContain(IMPORT_IC_CLOCK_MESSAGE);
            circuit.loadSchema(schema);

            const comps = circuit.getComponents();
            expect(comps).toHaveLength(2);
            const icInstance = comps.find(({ kind }) => kind !== "LED")!;
            const led = comps.find(({ kind }) => kind === "LED")!;
            expect(icInstance).toBeDefined();
            expect(led).toBeDefined();

            const ics = circuit.getICs();
            expect(ics).toHaveLength(1);
            const icData = ics[0];
            expect(icInstance.kind).toBe(icData.id);
            expect(icInstance.inputs).toHaveLength(0);
            expect(icInstance.outputs).toHaveLength(1);

            expect(led).toBeOn();
        });
        test("Port heights", () => {
            const [circuit, _, { TurnOn, TurnOff }] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(threeInputICCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(5);

            const sw1 = comps.find(({ name }) => name === "Switch1")!;
            const sw2 = comps.find(({ name }) => name === "Switch2")!;
            const sw3 = comps.find(({ name }) => name === "Switch3")!;
            const out = comps.find(({ kind }) => kind === "LED");
            const icInstance = comps.find(({ kind }) => kind === circuit.getICs()[0].id)!;
            expect(sw1).toBeDefined();
            expect(sw2).toBeDefined();
            expect(sw3).toBeDefined();
            expect(out).toBeDefined();
            expect(icInstance).toBeDefined();

            const icInputHeights = icInstance.inputs.map((port) => port.targetPos.y).sort();
            expect(sw1.outputs[0].targetPos.y).toApproximatelyEqual(icInputHeights[0], 1e-6);
            expect(sw2.outputs[0].targetPos.y).toApproximatelyEqual(icInputHeights[1], 1e-6);
            expect(sw3.outputs[0].targetPos.y).toApproximatelyEqual(icInputHeights[2], 1e-6);

            TurnOn(sw1);
            expect(out).toBeOn();
            TurnOn(sw2);
            expect(out).toBeOff();
            TurnOn(sw3);
            expect(out).toBeOn();
            TurnOff(sw1);
            expect(out).toBeOff();
            TurnOff(sw2);
            expect(out).toBeOn();
            TurnOff(sw3);
            expect(out).toBeOff();
        });
        test("(a|b)&c IC", () => {
            const [circuit, _, { TurnOn, TurnOff }] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(inputOrderICCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(5);

            const a = comps.find(({ name }) => name === "a")!;
            const b = comps.find(({ name }) => name === "b")!;
            const c = comps.find(({ name }) => name === "c")!;
            const out = comps.find(({ kind }) => kind === "LED");
            const icInstance = comps.find(({ kind }) => kind === circuit.getICs()[0].id)!;
            expect(a).toBeDefined();
            expect(b).toBeDefined();
            expect(c).toBeDefined();
            expect(out).toBeDefined();
            expect(icInstance).toBeDefined();

            const icInputs = icInstance.inputs;
            expect(icInputs).toHaveLength(3);
            const icInputA = icInputs.find(({ name }) => name === "a")!;
            const icInputB = icInputs.find(({ name }) => name === "b")!;
            const icInputC = icInputs.find(({ name }) => name === "c")!;
            expect(icInputA).toBeDefined();
            expect(icInputB).toBeDefined();
            expect(icInputC).toBeDefined();
            expect(a.outputs[0].connectedPorts).toContain(icInputA);
            expect(b.outputs[0].connectedPorts).toContain(icInputB);
            expect(c.outputs[0].connectedPorts).toContain(icInputC);
            expect(icInputA.targetPos.y).toBeGreaterThan(icInputB.targetPos.y);
            expect(icInputB.targetPos.y).toBeGreaterThan(icInputC.targetPos.y);

            expect(out).toBeOff();

            TurnOn(a);
            expect(out).toBeOff(); // a
            TurnOn(b);
            expect(out).toBeOff(); // a,b
            TurnOn(c);
            expect(out).toBeOn(); // a,b,c

            TurnOff(b);
            expect(out).toBeOn(); // a,c
            TurnOn(b);
            TurnOff(a);
            expect(out).toBeOn(); // b,c
            TurnOff(c);
            expect(out).toBeOff(); // b
            TurnOn(c);
            TurnOff(b);
            expect(out).toBeOff(); // c

            TurnOff(c);
            expect(out).toBeOff();
        });
        test("All Sides IC", () => {
            const [circuit, _, { TurnOn, TurnOff }] = CreateTestCircuit();
            const { schema, warnings } = VersionConflictResolver(JSON.stringify(allSidesICCircuit));
            expect(warnings).toBeUndefined();
            circuit.loadSchema(schema);
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(5);

            const top = comps.find(({ name }) => name === "top")!;
            const bottom = comps.find(({ name }) => name === "bottom")!;
            const left = comps.find(({ name }) => name === "left")!;
            const right = comps.find(({ name }) => name === "right")!;
            const icInstance = comps.find(({ kind }) => kind === circuit.getICs()[0].id)!;
            expect(top).toBeDefined();
            expect(bottom).toBeDefined();
            expect(left).toBeDefined();
            expect(right).toBeDefined();
            expect(icInstance).toBeDefined();

            const icInputs = icInstance.inputs;
            expect(icInputs).toHaveLength(2);
            const icInputTop = icInputs.find(({ name }) => name === "top")!;
            const icInputLeft = icInputs.find(({ name }) => name === "left")!;
            const icOutputs = icInstance.outputs;
            expect(icOutputs).toHaveLength(2);
            const icOutputRight = icOutputs.find(({ name }) => name === "right")!;
            const icOutputBottom = icOutputs.find(({ name }) => name === "bottom")!;
            expect(icInputTop).toBeDefined();
            expect(icInputLeft).toBeDefined();
            expect(icOutputRight).toBeDefined();
            expect(icOutputBottom).toBeDefined();

            expect(top.outputs[0].connectedPorts).toContain(icInputTop);
            expect(left.outputs[0].connectedPorts).toContain(icInputLeft);
            expect(right.inputs[0].connectedPorts).toContain(icOutputRight);
            expect(bottom.inputs[0].connectedPorts).toContain(icOutputBottom);

            expect(icInputTop.targetPos.y).toBeGreaterThan(icInstance.bounds.top);
            expect(icOutputBottom.targetPos.y).toBeLessThan(icInstance.bounds.bottom);
            expect(icInputLeft.targetPos.x).toBeLessThan(icInstance.bounds.left);
            expect(icOutputRight.targetPos.x).toBeGreaterThan(icInstance.bounds.right);
        });
    });
});
