import "digital/api/circuit/tests/helpers/Extensions";
import "shared/tests/helpers/Extensions";

import {V} from "Vector";

import {Signal}            from "digital/api/circuit/schema/Signal";
import {CreateTestCircuit} from "digital/api/circuit/tests/helpers/CreateTestCircuit";

import {DigitalProtoToCircuit} from "digital/site/proto/bridge";

import {IMPORT_IC_CLOCK_MESSAGE} from "digital/site/utils/Constants";
import {VersionMigrator}         from "digital/site/utils/VersionMigrator";

import switchCircuit                from "./TestCircuitData/3_0/Switch.json";
import orCircuit                    from "./TestCircuitData/3_0/OR.json";
import poweredOrCircuit             from "./TestCircuitData/3_0/PoweredOR.json";
import threeInputAndCircuit         from "./TestCircuitData/3_0/ThreeInputAND.json";
import allInputsCircuit             from "./TestCircuitData/3_0/Inputs.json";
import ledCiruit                    from "./TestCircuitData/3_0/LED.json";
import segmentDisplayCircuit        from "./TestCircuitData/3_0/SegmentDisplays.json";
import oscilloscopeCircuit          from "./TestCircuitData/3_0/Oscilloscope.json";
import srFlipFlopCircuit            from "./TestCircuitData/3_0/SRFlipFlop.json";
import jkFlipFlopCircuit            from "./TestCircuitData/3_0/JKFlipFlop.json";
import dFlipFlopCircuit             from "./TestCircuitData/3_0/DFlipFlop.json";
import tFlipFlopCircuit             from "./TestCircuitData/3_0/TFlipFlop.json";
import dLatchCircuit                from "./TestCircuitData/3_0/DLatch.json";
import srLatchCircuit               from "./TestCircuitData/3_0/SRLatch.json";
import multiplexerCircuit           from "./TestCircuitData/3_0/Multiplexer.json";
import demultiplexerCircuit         from "./TestCircuitData/3_0/Demultiplexer.json";
import encoderDecoderCircuit        from "./TestCircuitData/3_0/EncoderDecoder.json";
import comparatorCircuit            from "./TestCircuitData/3_0/Comparator.json";
import labelCircuit                 from "./TestCircuitData/3_0/Label.json";
import nodesCircuit                 from "./TestCircuitData/3_0/Nodes.json";
import icDataOnlyCircuit            from "./TestCircuitData/3_0/ICDataOnly.json";
import basicICCircuit               from "./TestCircuitData/3_0/BasicIC.json";
import nestedICCircuit              from "./TestCircuitData/3_0/NestedIC.json";
import zIndexCircuit                from "./TestCircuitData/3_0/ZIndex.json";
import clockInICOffCircuit          from "./TestCircuitData/3_0/ClockInICOff.json";
import clockInICOnCircuit           from "./TestCircuitData/3_0/ClockInICOn.json";
import threeInputICCircuit          from "./TestCircuitData/3_0/ThreeInputIC.json";
import inputOrderICCircuit          from "./TestCircuitData/3_0/InputOrderIC.json";
import allSidesICCircuit            from "./TestCircuitData/3_0/AllSidesIC.json";
import flipFlopInICCircuit          from "./TestCircuitData/3_0/FlipFlopInIC.json";
import nestedICNotInDesignerCircuit from "./TestCircuitData/2_1/NestedICNotInDesigner.json";


describe("DigitalVersionMigrator", () => {
    describe("From version 3.0", () => {
        test("Single Switch", () => {
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionMigrator(JSON.stringify(switchCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
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
            const { schema, warnings } = VersionMigrator(JSON.stringify(orCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(4);
            expect(circuit.getWires()).toHaveLength(3);
            const a = comps.find((c) => c.name === "a")!;
            expect(a).toBeDefined();
            const b = comps.find((c) => c.name === "b")!;
            expect(b).toBeDefined();
            const orGate = comps.find((c) => c.kind === "ORGate")!;
            expect(orGate).toBeDefined();
            const led = comps.find((c) => c.name === "Output")!;
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
            const { schema, warnings } = VersionMigrator(JSON.stringify(threeInputAndCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(5);
            expect(circuit.getWires()).toHaveLength(4);
            const a = comps.find((c) => c.name === "a")!;
            expect(a).toBeDefined();
            const b = comps.find((c) => c.name === "b")!;
            expect(b).toBeDefined();
            const c = comps.find((c) => c.name === "c")!;
            expect(c).toBeDefined();
            const andGate = comps.find((c) => c.kind === "ANDGate")!;
            expect(andGate).toBeDefined();
            const led = comps.find((c) => c.kind === "LED")!;
            expect(led).toBeDefined();

            expect(a).toBeConnectedTo(andGate);
            expect(b).toBeConnectedTo(andGate);
            expect(c).toBeConnectedTo(andGate);
            expect(led).toBeConnectedTo(andGate);
            expect(andGate.inputs[2].connections[0].id).toBe(c.outputs[0].connections[0].id);
        });
        test("Powered OR circuit", () => {
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionMigrator(JSON.stringify(poweredOrCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            const led = comps.find((c) => c.kind === "LED")!;
            expect(led).toBeOn();
        });
        test("All inputs", () => {
            const [circuit] = CreateTestCircuit(/* sim= */false);  // Disable sim since it will queue infinitely
            const { schema, warnings } = VersionMigrator(JSON.stringify(allInputsCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(8);

            const button = comps.find((c) => c.kind === "Button")!;
            expect(button).toBeDefined();
            const low = comps.find((c) => c.kind === "ConstantLow")!;
            expect(low).toBeDefined();
            const high = comps.find((c) => c.kind === "ConstantHigh")!;
            expect(high).toBeDefined();

            const defaultClock = comps.find((c) => c.name === "Default Clock")!;
            expect(defaultClock).toBeDefined();
            expect(defaultClock.getProp("paused")).toBeFalsy();
            expect(defaultClock.getProp("delay")).toBe(1000);
            const customClock = comps.find((c) => c.name === "Custom Clock")!;
            expect(customClock).toBeDefined();
            expect(customClock.getProp("paused")).toBeTruthy();
            expect(customClock.getProp("delay")).toBe(800);
            expect(customClock.outputs[0].signal).toBe(Signal.On);

            const sw = comps.find((c) => c.kind === "Switch")!;
            expect(sw).toBeDefined();
            expect(sw.outputs[0].signal).toBe(Signal.On);

            const constantNumber0 = comps.find((c) => c.name === "Constant Number 0")!;
            expect(constantNumber0).toBeDefined();
            expect(constantNumber0.getProp("inputNum") === undefined || constantNumber0.getProp("inputNum") === 0).toBeTruthy();
            const constantNumber15 = comps.find((c) => c.name === "Constant Number 15")!;
            expect(constantNumber15).toBeDefined();
            expect(constantNumber15.getProp("inputNum")).toBe(15);
        });
        test("LED with custom color", () => {
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionMigrator(JSON.stringify(ledCiruit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(1);
            const led = comps[0];
            expect(led.getProp("color")).toBe("#ff0000");
        });
        test("Segment displays", () => {
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionMigrator(JSON.stringify(segmentDisplayCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(6);

            const segmentDisplay7 = comps.find((c) => c.name === "7 Segment Display")!;
            expect(segmentDisplay7).toBeDefined();
            expect(segmentDisplay7.inputs).toHaveLength(7);
            const segmentDisplay16 = comps.find((c) => c.name === "16 Segment Display")!;
            expect(segmentDisplay16).toBeDefined();
            expect(segmentDisplay16.inputs).toHaveLength(16);

            const bcdDisplay7 = comps.find((c) => c.name === "7 BCD Display")!;
            expect(bcdDisplay7).toBeDefined();
            expect(bcdDisplay7.getProp("segmentCount")).toBeUndefined();  // default value -> unset
            const bcdDisplay16 = comps.find((c) => c.name === "16 BCD Display")!;
            expect(bcdDisplay16).toBeDefined();
            expect(bcdDisplay16.getProp("segmentCount")).toBe(16);

            const asciiDisplay7 = comps.find((c) => c.name === "7 ASCII Display")!;
            expect(asciiDisplay7).toBeDefined();
            expect(asciiDisplay7.getProp("segmentCount")).toBeUndefined();  // default value -> unset
            const asciiDisplay16 = comps.find((c) => c.name === "16 ASCII Display")!;
            expect(asciiDisplay16).toBeDefined();
            expect(asciiDisplay16.getProp("segmentCount")).toBe(16);
        });
        test("Oscilloscope", () => {
            const [circuit] = CreateTestCircuit(/* sim= */false);  // Disable sim since it will queue infinitely
            const { schema, warnings } = VersionMigrator(JSON.stringify(oscilloscopeCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(2);

            const defaultOscilloscope = comps.find((c) => c.name === "Default Oscilloscope")!;
            expect(defaultOscilloscope).toBeDefined();
            expect(defaultOscilloscope.inputs).toHaveLength(1);
            expect(defaultOscilloscope.getProp("w")).toApproximatelyEqual(8);
            expect(defaultOscilloscope.getProp("h")).toApproximatelyEqual(4);
            expect(defaultOscilloscope.getProp("delay")).toApproximatelyEqual(100);
            expect(defaultOscilloscope.getProp("samples")).toApproximatelyEqual(100);
            expect(defaultOscilloscope.getProp("paused")).toBeFalsy();
            const customOscilloscope = comps.find((c) => c.name === "Custom Oscilloscope")!;
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
            const { schema, warnings } = VersionMigrator(JSON.stringify(srFlipFlopCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(8);
            expect(circuit.getWires()).toHaveLength(7);
            const pre = comps.find((c) => c.name === "PRE")!;
            expect(pre).toBeDefined();
            const s = comps.find((c) => c.name === "S")!;
            expect(s).toBeDefined();
            const clk = comps.find((c) => c.name === ">")!;
            expect(clk).toBeDefined();
            const r = comps.find((c) => c.name === "R")!;
            expect(r).toBeDefined();
            const clr = comps.find((c) => c.name === "CLR")!;
            expect(clr).toBeDefined();
            const q = comps.find((c) => c.name === "Q")!;
            expect(q).toBeDefined();
            const qinv = comps.find((c) => c.name === "Q'")!;
            expect(qinv).toBeDefined();
            const flipFlop = comps.find((c) => c.kind === "SRFlipFlop")!;
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
            const { schema, warnings } = VersionMigrator(JSON.stringify(jkFlipFlopCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(8);
            expect(circuit.getWires()).toHaveLength(7);
            const pre = comps.find((c) => c.name === "PRE")!;
            expect(pre).toBeDefined();
            const j = comps.find((c) => c.name === "J")!;
            expect(j).toBeDefined();
            const clk = comps.find((c) => c.name === ">")!;
            expect(clk).toBeDefined();
            const k = comps.find((c) => c.name === "K")!;
            expect(k).toBeDefined();
            const clr = comps.find((c) => c.name === "CLR")!;
            expect(clr).toBeDefined();
            const q = comps.find((c) => c.name === "Q")!;
            expect(q).toBeDefined();
            const qinv = comps.find((c) => c.name === "Q'")!;
            expect(qinv).toBeDefined();
            const flipFlop = comps.find((c) => c.kind === "JKFlipFlop")!;
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
            const { schema, warnings } = VersionMigrator(JSON.stringify(dFlipFlopCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(7);
            expect(circuit.getWires()).toHaveLength(6);
            const pre = comps.find((c) => c.name === "PRE")!;
            expect(pre).toBeDefined();
            const d = comps.find((c) => c.name === "D")!;
            expect(d).toBeDefined();
            const clk = comps.find((c) => c.name === ">")!;
            expect(clk).toBeDefined();
            const clr = comps.find((c) => c.name === "CLR")!;
            expect(clr).toBeDefined();
            const q = comps.find((c) => c.name === "Q")!;
            expect(q).toBeDefined();
            const qinv = comps.find((c) => c.name === "Q'")!;
            expect(qinv).toBeDefined();
            const flipFlop = comps.find((c) => c.kind === "DFlipFlop")!;
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
            const { schema, warnings } = VersionMigrator(JSON.stringify(tFlipFlopCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(7);
            expect(circuit.getWires()).toHaveLength(6);
            const pre = comps.find((c) => c.name === "PRE")!;
            expect(pre).toBeDefined();
            const t = comps.find((c) => c.name === "T")!;
            expect(t).toBeDefined();
            const clk = comps.find((c) => c.name === ">")!;
            expect(clk).toBeDefined();
            const clr = comps.find((c) => c.name === "CLR")!;
            expect(clr).toBeDefined();
            const q = comps.find((c) => c.name === "Q")!;
            expect(q).toBeDefined();
            const qinv = comps.find((c) => c.name === "Q'")!;
            expect(qinv).toBeDefined();
            const flipFlop = comps.find((c) => c.kind === "TFlipFlop")!;
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
            const { schema, warnings } = VersionMigrator(JSON.stringify(dLatchCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(5);
            expect(circuit.getWires()).toHaveLength(4);
            const e = comps.find((c) => c.name === "E")!;
            expect(e).toBeDefined();
            const d = comps.find((c) => c.name === "D")!;
            expect(d).toBeDefined();
            const q = comps.find((c) => c.name === "Q")!;
            expect(q).toBeDefined();
            const qinv = comps.find((c) => c.name === "Q'")!;
            expect(qinv).toBeDefined();
            const flipFlop = comps.find((c) => c.kind === "DLatch")!;
            expect(flipFlop).toBeDefined();

            expect(flipFlop.ports["D"][0].connections[0].id).toBe(d.outputs[0].connections[0].id);
            expect(flipFlop.ports["E"][0].connections[0].id).toBe(e.outputs[0].connections[0].id);
            expect(flipFlop.ports["Q"][0].connections[0].id).toBe(q.inputs[0].connections[0].id);
            expect(flipFlop.ports["Qinv"][0].connections[0].id).toBe(qinv.inputs[0].connections[0].id);
        });
        test("SRLatch", () => {
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionMigrator(JSON.stringify(srLatchCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(6);
            expect(circuit.getWires()).toHaveLength(5);
            const e = comps.find((c) => c.name === "E")!;
            expect(e).toBeDefined();
            const s = comps.find((c) => c.name === "S")!;
            expect(s).toBeDefined();
            const r = comps.find((c) => c.name === "R")!;
            expect(r).toBeDefined();
            const q = comps.find((c) => c.name === "Q")!;
            expect(q).toBeDefined();
            const qinv = comps.find((c) => c.name === "Q'")!;
            expect(qinv).toBeDefined();
            const flipFlop = comps.find((c) => c.kind === "SRLatch")!;
            expect(flipFlop).toBeDefined();

            expect(flipFlop.ports["S"][0].connections[0].id).toBe(s.outputs[0].connections[0].id);
            expect(flipFlop.ports["R"][0].connections[0].id).toBe(r.outputs[0].connections[0].id);
            expect(flipFlop.ports["E"][0].connections[0].id).toBe(e.outputs[0].connections[0].id);
            expect(flipFlop.ports["Q"][0].connections[0].id).toBe(q.inputs[0].connections[0].id);
            expect(flipFlop.ports["Qinv"][0].connections[0].id).toBe(qinv.inputs[0].connections[0].id);
        });
        test("Multiplexer", () => {
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionMigrator(JSON.stringify(multiplexerCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(10);
            expect(circuit.getWires()).toHaveLength(9);
            const i0 = comps.find((c) => c.name === "I0")!;
            expect(i0).toBeDefined();
            const i1 = comps.find((c) => c.name === "I1")!;
            expect(i1).toBeDefined();
            const i2 = comps.find((c) => c.name === "I2")!;
            expect(i2).toBeDefined();
            const i3 = comps.find((c) => c.name === "I3")!;
            expect(i3).toBeDefined();
            const i7 = comps.find((c) => c.name === "I7")!;
            expect(i7).toBeDefined();
            const s0 = comps.find((c) => c.name === "S0")!;
            expect(s0).toBeDefined();
            const s1 = comps.find((c) => c.name === "S1")!;
            expect(s1).toBeDefined();
            const s2 = comps.find((c) => c.name === "S2")!;
            expect(s2).toBeDefined();

            const output = comps.find((c) => c.kind === "LED")!;
            expect(output).toBeDefined();
            const multiplexer = comps.find((c) => c.kind === "Multiplexer")!;
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
            const { schema, warnings } = VersionMigrator(JSON.stringify(demultiplexerCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(10);
            expect(circuit.getWires()).toHaveLength(9);
            const input = comps.find((c) => c.name === "Input")!;
            expect(input).toBeDefined();
            const s0 = comps.find((c) => c.name === "S0")!;
            expect(s0).toBeDefined();
            const s1 = comps.find((c) => c.name === "S1")!;
            expect(s1).toBeDefined();
            const s2 = comps.find((c) => c.name === "S2")!;
            expect(s2).toBeDefined();

            const o0 = comps.find((c) => c.name === "O0")!;
            expect(o0).toBeDefined();
            const o1 = comps.find((c) => c.name === "O1")!;
            expect(o1).toBeDefined();
            const o2 = comps.find((c) => c.name === "O2")!;
            expect(o2).toBeDefined();
            const o3 = comps.find((c) => c.name === "O3")!;
            expect(o3).toBeDefined();
            const o7 = comps.find((c) => c.name === "O7")!;
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
            const { schema, warnings } = VersionMigrator(JSON.stringify(encoderDecoderCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(2);

            const encoder = comps.find((c) => c.kind === "Encoder")!;
            expect(encoder).toBeDefined();
            const decoder = comps.find((c) => c.kind === "Decoder")!;
            expect(decoder).toBeDefined();

            expect(encoder.inputs).toHaveLength(8);
            expect(encoder.outputs).toHaveLength(3);
            expect(decoder.inputs).toHaveLength(1);
            expect(decoder.outputs).toHaveLength(2);
        });
        test("Comparator", () => {
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionMigrator(JSON.stringify(comparatorCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(10);
            expect(circuit.getWires()).toHaveLength(9);

            const comparator = comps.find((comp) => comp.kind === "Comparator")!;
            expect(comparator).toBeDefined();
            const a0 = comps.find((c) => c.name === "a0")!;
            expect(a0).toBeDefined();
            const a1 = comps.find((c) => c.name === "a1")!;
            expect(a1).toBeDefined();
            const a2 = comps.find((c) => c.name === "a2")!;
            expect(a2).toBeDefined();
            const b0 = comps.find((c) => c.name === "b0")!;
            expect(b0).toBeDefined();
            const b1 = comps.find((c) => c.name === "b1")!;
            expect(b1).toBeDefined();
            const b2 = comps.find((c) => c.name === "b2")!;
            expect(b2).toBeDefined();
            const lt = comps.find((c) => c.name === "<")!;
            expect(lt).toBeDefined();
            const eq = comps.find((c) => c.name === "=")!;
            expect(eq).toBeDefined();
            const gt = comps.find((c) => c.name === ">")!;
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
            const { schema, warnings } = VersionMigrator(JSON.stringify(labelCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(1);
            const label = comps[0];
            expect(label.name).toBe("Test label");
            expect(label.getProp("bgColor")).toBe("#0000ff");
            expect(label.getProp("textColor")).toBe("#ffffff");
        });
        test("Nodes", () => {
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionMigrator(JSON.stringify(nodesCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(5);
            expect(circuit.getWires()).toHaveLength(4);
        });
        test("IC Data Only (no instances)", () => {
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionMigrator(JSON.stringify(icDataOnlyCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(0);
            const ics = circuit.getICs();
            expect(ics).toHaveLength(1);
            const ic = ics[0];
            expect(ic.display.pins).toHaveLength(3);
            expect(ic.display.size).toEqual(V(2.8, 1));
            expect(ic.display.pins.filter((p) => p.name === "Switch")).toHaveLength(2);
            expect(ic.display.pins.filter((p) => p.name === "LED")).toHaveLength(1);
        });
        test("Basic IC", () => {
            const [circuit] = CreateTestCircuit();
            const { schema, warnings } = VersionMigrator(JSON.stringify(basicICCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(1);
            const icInstance = comps[0];
            const ics = circuit.getICs();
            expect(ics).toHaveLength(1);
            const icData = ics[0];
            expect(icInstance.kind).toBe(icData.id);
            expect(icInstance.inputs).toHaveLength(2);
            expect(icInstance.outputs).toHaveLength(1);
            const inputPortA = icInstance.inputs.find((p) => (p.name ?? p.defaultName) === "a")!;
            const inputPortB = icInstance.inputs.find((p) => (p.name ?? p.defaultName) === "b")!;
            expect(inputPortA).toBeDefined();
            expect(inputPortB).toBeDefined();
            expect(inputPortA.originPos.y).toBeGreaterThan(inputPortB.originPos.y);
        });
        test("Nested IC", () => {
            const [circuit, _, { Place, Connect, TurnOn }] = CreateTestCircuit();
            const { schema, warnings } = VersionMigrator(JSON.stringify(nestedICCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
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
            const { schema, warnings } = VersionMigrator(JSON.stringify(zIndexCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(3);
            const bottom = comps.find((c) => c.name === "Bottom")!;
            const middle = comps.find((c) => c.name === "Middle")!;
            const top    = comps.find((c) => c.name === "Top")!;
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
            const [circuit, state] = CreateTestCircuit();
            const { schema, warnings } = VersionMigrator(JSON.stringify(clockInICOffCircuit));
            expect(warnings).toBeDefined();
            expect(warnings).toHaveLength(1);
            expect(warnings).toContain(IMPORT_IC_CLOCK_MESSAGE);
            state.simRunner?.pause();
            circuit.import(DigitalProtoToCircuit(schema));
            state.simRunner?.resume();

            const comps = circuit.getComponents();
            expect(comps).toHaveLength(2);
            const icInstance = comps.find((c) => c.kind !== "LED")!;
            const led        = comps.find((c) => c.kind === "LED")!;
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
            const { schema, warnings } = VersionMigrator(JSON.stringify(clockInICOnCircuit));
            expect(warnings).toBeDefined();
            expect(warnings).toHaveLength(1);
            expect(warnings).toContain(IMPORT_IC_CLOCK_MESSAGE);
            circuit.import(DigitalProtoToCircuit(schema));

            const comps = circuit.getComponents();
            expect(comps).toHaveLength(2);
            const icInstance = comps.find((c) => c.kind !== "LED")!;
            const led        = comps.find((c) => c.kind === "LED")!;
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
            const { schema, warnings } = VersionMigrator(JSON.stringify(threeInputICCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(5);

            const sw1 = comps.find((c) => c.name === "Switch1")!;
            const sw2 = comps.find((c) => c.name === "Switch2")!;
            const sw3 = comps.find((c) => c.name === "Switch3")!;
            const out = comps.find((c) => c.kind === "LED");
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
            const { schema, warnings } = VersionMigrator(JSON.stringify(inputOrderICCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(5);

            const a = comps.find((c) => c.name === "a")!;
            const b = comps.find((c) => c.name === "b")!;
            const c = comps.find((c) => c.name === "c")!;
            const out = comps.find(({ kind }) => kind === "LED");
            const icInstance = comps.find(({ kind }) => kind === circuit.getICs()[0].id)!;
            expect(a).toBeDefined();
            expect(b).toBeDefined();
            expect(c).toBeDefined();
            expect(out).toBeDefined();
            expect(icInstance).toBeDefined();

            const icInputs = icInstance.inputs;
            expect(icInputs).toHaveLength(3);
            const icInputA = icInputs.find((p) => (p.name ?? p.defaultName) === "a")!;
            const icInputB = icInputs.find((p) => (p.name ?? p.defaultName) === "b")!;
            const icInputC = icInputs.find((p) => (p.name ?? p.defaultName) === "c")!;
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
            const [circuit, _] = CreateTestCircuit();
            const { schema, warnings } = VersionMigrator(JSON.stringify(allSidesICCircuit));
            expect(warnings).toHaveLength(0);
            circuit.import(DigitalProtoToCircuit(schema));
            const comps = circuit.getComponents();
            expect(comps).toHaveLength(5);

            const top    = comps.find((c) => c.name === "top")!;
            const bottom = comps.find((c) => c.name === "bottom")!;
            const left   = comps.find((c) => c.name === "left")!;
            const right  = comps.find((c) => c.name === "right")!;
            const icInstance = comps.find(({ kind }) => kind === circuit.getICs()[0].id)!;
            expect(top).toBeDefined();
            expect(bottom).toBeDefined();
            expect(left).toBeDefined();
            expect(right).toBeDefined();
            expect(icInstance).toBeDefined();

            const icInputs = icInstance.inputs;
            expect(icInputs).toHaveLength(2);
            const icInputTop  = icInputs.find((p) => (p.name ?? p.defaultName) === "top")!;
            const icInputLeft = icInputs.find((p) => (p.name ?? p.defaultName) === "left")!;
            const icOutputs = icInstance.outputs;
            expect(icOutputs).toHaveLength(2);
            const icOutputRight  = icOutputs.find((p) => (p.name ?? p.defaultName) === "right")!;
            const icOutputBottom = icOutputs.find((p) => (p.name ?? p.defaultName) === "bottom")!;
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
        test("Flip Flop in IC", () => {
            // Need to make sure that FlipFlop state transfers over as initial IC state
            const [circuit, _, { Place, Connect, TurnOn, TurnOff }] = CreateTestCircuit();
            const { schema, warnings } = VersionMigrator(JSON.stringify(flipFlopInICCircuit));
            expect(warnings).toHaveLength(0);

            circuit.import(DigitalProtoToCircuit(schema));

            const comps = circuit.getComponents();
            expect(comps).toHaveLength(1);

            const ics = circuit.getICs();
            expect(ics).toHaveLength(1);

            const icInstance = comps[0];
            expect(icInstance.kind).toBe(ics[0].id);

            const [S, CLK, R, led] = Place("Switch", "Switch", "Switch", "LED");
            Connect(S, icInstance.inputs[0]);
            Connect(CLK, icInstance.inputs[1]);
            Connect(R, icInstance.inputs[2]);
            Connect(icInstance, led);

            expect(led).toBeOn();
            TurnOn(CLK);
            TurnOff(CLK);
            expect(led).toBeOn();
        });
    });

    describe("From version 2.1", () => {
        test("Nested IC Not in Designer", () => {
            const [circuit, _, { Place, Connect, TurnOn }] = CreateTestCircuit();
            const { schema, warnings } = VersionMigrator(JSON.stringify(nestedICNotInDesignerCircuit));
            expect(warnings).toHaveLength(0);

            circuit.import(DigitalProtoToCircuit(schema));

            const comps = circuit.getComponents();
            expect(comps).toHaveLength(1);

            const ics = circuit.getICs();
            expect(ics).toHaveLength(2);

            const outerIC = ics.find((ic) => ic.name === "a2")!;
            expect(outerIC).toBeDefined();

            const icInstance = comps[0];
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
    });
});
