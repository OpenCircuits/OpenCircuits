import "digital/api/circuit/tests/helpers/Extensions";
import "shared/tests/helpers/Extensions";

import {V} from "Vector";

import {CreateTestCircuit} from "digital/api/circuit/tests/helpers/CreateTestCircuit";

import {SmartPlace, SmartPlaceOptions} from "digital/site/utils/SmartPlace";


describe("SmartPlace", () => {
    describe("Input/Output order", () => {
        test("ANDGate", () => {
            const [circuit] = CreateTestCircuit();

            SmartPlace(V(0, 0), "ANDGate", circuit, 1, SmartPlaceOptions.Full);

            const gate = circuit.getComponents().find(({ kind }) => kind === "ANDGate")!;
            expect(gate).toBeDefined();

            const a = gate.inputs[0].connectedPorts[0].parent;
            const b = gate.inputs[1].connectedPorts[0].parent;

            expect(a).toBeDefined();
            expect(b).toBeDefined();

            expect(a.pos.y).toBeGreaterThan(b.pos.y);
            expect(a.pos.x).toApproximatelyEqual(b.pos.x);
        });
        test("JKFlipFlop", () => {
            const [circuit] = CreateTestCircuit();

            SmartPlace(V(0, 0), "JKFlipFlop", circuit, 1, SmartPlaceOptions.Full);

            const flipFlop = circuit.getComponents().find(({ kind }) => kind === "JKFlipFlop")!;
            expect(flipFlop).toBeDefined();

            const pre = flipFlop.ports["pre"][0].connectedPorts[0].parent;
            const j = flipFlop.ports["J"][0].connectedPorts[0].parent;
            const clk = flipFlop.ports["clk"][0].connectedPorts[0].parent;
            const k = flipFlop.ports["K"][0].connectedPorts[0].parent;
            const clr = flipFlop.ports["clr"][0].connectedPorts[0].parent;
            const q = flipFlop.ports["Q"][0].connectedPorts[0].parent;
            const qInv = flipFlop.ports["Qinv"][0].connectedPorts[0].parent;

            expect(pre).toBeDefined();
            expect(j).toBeDefined();
            expect(clk).toBeDefined();
            expect(k).toBeDefined();
            expect(clr).toBeDefined();
            expect(q).toBeDefined();
            expect(qInv).toBeDefined();

            expect(pre.pos.y).toBeGreaterThan(j.pos.y);
            expect(pre.pos.x).toApproximatelyEqual(j.pos.x);
            expect(j.pos.y).toBeGreaterThan(clk.pos.y);
            expect(j.pos.x).toApproximatelyEqual(clk.pos.x);
            expect(clk.pos.y).toBeGreaterThan(k.pos.y);
            expect(clk.pos.x).toApproximatelyEqual(k.pos.x);
            expect(k.pos.y).toBeGreaterThan(clr.pos.y);
            expect(k.pos.x).toApproximatelyEqual(clr.pos.x);

            expect(q.pos.y).toBeGreaterThan(qInv.pos.y);
            expect(q.pos.x).toBeLessThan(qInv.pos.x);
        });
        test("TFlipFlop", () => {
            const [circuit] = CreateTestCircuit();

            SmartPlace(V(0, 0), "TFlipFlop", circuit, 1, SmartPlaceOptions.Full);

            const flipFlop = circuit.getComponents().find(({ kind }) => kind === "TFlipFlop")!;
            expect(flipFlop).toBeDefined();

            const pre = flipFlop.ports["pre"][0].connectedPorts[0].parent;
            const t = flipFlop.ports["T"][0].connectedPorts[0].parent;
            const clk = flipFlop.ports["clk"][0].connectedPorts[0].parent;
            const clr = flipFlop.ports["clr"][0].connectedPorts[0].parent;
            const q = flipFlop.ports["Q"][0].connectedPorts[0].parent;
            const qInv = flipFlop.ports["Qinv"][0].connectedPorts[0].parent;

            expect(pre).toBeDefined();
            expect(t).toBeDefined();
            expect(clk).toBeDefined();
            expect(clr).toBeDefined();
            expect(q).toBeDefined();
            expect(qInv).toBeDefined();

            expect(pre.pos.y).toBeGreaterThan(t.pos.y);
            expect(pre.pos.x).toApproximatelyEqual(t.pos.x);
            expect(t.pos.y).toBeGreaterThan(clk.pos.y);
            expect(t.pos.x).toApproximatelyEqual(clk.pos.x);
            expect(clk.pos.y).toBeGreaterThan(clr.pos.y);
            expect(clk.pos.x).toApproximatelyEqual(clr.pos.x);

            expect(q.pos.y).toBeGreaterThan(qInv.pos.y);
            expect(q.pos.x).toBeLessThan(qInv.pos.x);
        });
        test("SRLatch", () => {
            const [circuit] = CreateTestCircuit();

            SmartPlace(V(0, 0), "SRLatch", circuit, 1, SmartPlaceOptions.Full);

            const latch = circuit.getComponents().find(({ kind }) => kind === "SRLatch")!;
            expect(latch).toBeDefined();

            const s = latch.ports["S"][0].connectedPorts[0].parent;
            const e = latch.ports["E"][0].connectedPorts[0].parent;
            const r = latch.ports["R"][0].connectedPorts[0].parent;
            const q = latch.ports["Q"][0].connectedPorts[0].parent;
            const qInv = latch.ports["Qinv"][0].connectedPorts[0].parent;

            expect(s).toBeDefined();
            expect(e).toBeDefined();
            expect(r).toBeDefined();
            expect(q).toBeDefined();
            expect(qInv).toBeDefined();

            expect(s.pos.y).toBeGreaterThan(e.pos.y);
            expect(s.pos.x).toApproximatelyEqual(e.pos.x);
            expect(e.pos.y).toBeGreaterThan(r.pos.y);
            expect(e.pos.x).toApproximatelyEqual(r.pos.x);

            expect(q.pos.y).toBeGreaterThan(qInv.pos.y);
            expect(q.pos.x).toBeLessThan(qInv.pos.x);
        });
        test("DLatch", () => {
            const [circuit] = CreateTestCircuit();

            SmartPlace(V(0, 0), "DLatch", circuit, 1, SmartPlaceOptions.Full);

            const latch = circuit.getComponents().find(({ kind }) => kind === "DLatch")!;
            expect(latch).toBeDefined();

            const d = latch.ports["D"][0].connectedPorts[0].parent;
            const e = latch.ports["E"][0].connectedPorts[0].parent;
            const q = latch.ports["Q"][0].connectedPorts[0].parent;
            const qInv = latch.ports["Qinv"][0].connectedPorts[0].parent;

            expect(d).toBeDefined();
            expect(e).toBeDefined();
            expect(q).toBeDefined();
            expect(qInv).toBeDefined();

            expect(d.pos.y).toBeGreaterThan(e.pos.y);
            expect(d.pos.x).toApproximatelyEqual(e.pos.x);

            expect(q.pos.y).toBeGreaterThan(qInv.pos.y);
            expect(q.pos.x).toBeLessThan(qInv.pos.x);
        });
        test("Multiplexer", () => {
            const [circuit] = CreateTestCircuit();

            SmartPlace(V(0, 0), "Multiplexer", circuit, 1, SmartPlaceOptions.Full);

            const flipFlop = circuit.getComponents().find(({ kind }) => kind === "Multiplexer")!;
            expect(flipFlop).toBeDefined();

            const i0 = flipFlop.ports["inputs"][0].connectedPorts[0].parent;
            const i1 = flipFlop.ports["inputs"][1].connectedPorts[0].parent;
            const i2 = flipFlop.ports["inputs"][2].connectedPorts[0].parent;
            const i3 = flipFlop.ports["inputs"][3].connectedPorts[0].parent;
            const s0 = flipFlop.ports["selects"][0].connectedPorts[0].parent;
            const s1 = flipFlop.ports["selects"][1].connectedPorts[0].parent;

            expect(i0).toBeDefined();
            expect(i1).toBeDefined();
            expect(i2).toBeDefined();
            expect(i3).toBeDefined();
            expect(s0).toBeDefined();
            expect(s1).toBeDefined();

            expect(i0.pos.y).toBeGreaterThan(i1.pos.y);
            expect(i0.pos.x).toApproximatelyEqual(i1.pos.x);
            expect(i1.pos.y).toBeGreaterThan(i2.pos.y);
            expect(i1.pos.x).toApproximatelyEqual(i2.pos.x);
            expect(i2.pos.y).toBeGreaterThan(i3.pos.y);
            expect(i2.pos.x).toApproximatelyEqual(i3.pos.x);
            expect(i3.pos.y).toBeGreaterThan(s0.pos.y);
            expect(i3.pos.x).toApproximatelyEqual(s0.pos.x);
            expect(s0.pos.y).toBeGreaterThan(s1.pos.y);
            expect(s0.pos.x).toApproximatelyEqual(s1.pos.x);
        });
        test("Demultiplexer", () => {
            const [circuit] = CreateTestCircuit();

            SmartPlace(V(0, 0), "Demultiplexer", circuit, 1, SmartPlaceOptions.Full);

            const flipFlop = circuit.getComponents().find(({ kind }) => kind === "Demultiplexer")!;
            expect(flipFlop).toBeDefined();

            const i = flipFlop.ports["inputs"][0].connectedPorts[0].parent;
            const s0 = flipFlop.ports["selects"][0].connectedPorts[0].parent;
            const s1 = flipFlop.ports["selects"][1].connectedPorts[0].parent;
            const o0 = flipFlop.ports["outputs"][0].connectedPorts[0].parent;
            const o1 = flipFlop.ports["outputs"][1].connectedPorts[0].parent;
            const o2 = flipFlop.ports["outputs"][2].connectedPorts[0].parent;
            const o3 = flipFlop.ports["outputs"][3].connectedPorts[0].parent;

            expect(i).toBeDefined();
            expect(s0).toBeDefined();
            expect(s1).toBeDefined();
            expect(o0).toBeDefined();
            expect(o1).toBeDefined();
            expect(o2).toBeDefined();
            expect(o3).toBeDefined();

            expect(i.pos.y).toBeGreaterThan(s0.pos.y);
            expect(i.pos.x).toApproximatelyEqual(s0.pos.x);
            expect(s0.pos.y).toBeGreaterThan(s1.pos.y);
            expect(s0.pos.x).toApproximatelyEqual(s1.pos.x);

            expect(o0.pos.y).toBeGreaterThan(o1.pos.y);
            expect(o0.pos.x).toBeLessThan(o1.pos.x);
            expect(o1.pos.y).toBeGreaterThan(o2.pos.y);
            expect(o1.pos.x).toBeLessThan(o2.pos.x);
            expect(o2.pos.y).toBeGreaterThan(o3.pos.y);
            expect(o2.pos.x).toBeLessThan(o3.pos.x);
        });
        test("Comparator", () => {
            const [circuit] = CreateTestCircuit();

            SmartPlace(V(0, 0), "Comparator", circuit, 1, SmartPlaceOptions.Full);

            const flipFlop = circuit.getComponents().find(({ kind }) => kind === "Comparator")!;
            expect(flipFlop).toBeDefined();

            const a0 = flipFlop.ports["inputsA"][0].connectedPorts[0].parent;
            const a1 = flipFlop.ports["inputsA"][1].connectedPorts[0].parent;
            const b0 = flipFlop.ports["inputsB"][0].connectedPorts[0].parent;
            const b1 = flipFlop.ports["inputsB"][1].connectedPorts[0].parent;
            const lt = flipFlop.ports["lt"][0].connectedPorts[0].parent;
            const eq = flipFlop.ports["eq"][0].connectedPorts[0].parent;
            const gt = flipFlop.ports["gt"][0].connectedPorts[0].parent;

            expect(a0).toBeDefined();
            expect(a1).toBeDefined();
            expect(b0).toBeDefined();
            expect(b1).toBeDefined();
            expect(lt).toBeDefined();
            expect(eq).toBeDefined();
            expect(gt).toBeDefined();

            expect(a0.pos.y).toBeGreaterThan(a1.pos.y);
            expect(a0.pos.x).toApproximatelyEqual(a1.pos.x);
            expect(a1.pos.y).toBeGreaterThan(b0.pos.y);
            expect(a1.pos.x).toApproximatelyEqual(b0.pos.x);
            expect(b0.pos.y).toBeGreaterThan(b1.pos.y);
            expect(b0.pos.x).toApproximatelyEqual(b1.pos.x);

            expect(lt.pos.y).toBeGreaterThan(eq.pos.y);
            expect(lt.pos.x).toBeLessThan(eq.pos.x);
            expect(eq.pos.y).toBeGreaterThan(gt.pos.y);
            expect(eq.pos.x).toBeLessThan(gt.pos.x);
        });
    });
});
