import "shared/tests/helpers/Extensions";

import {V} from "Vector";
import {Rect} from "math/Rect";

import {CreateTestCircuit} from "./helpers/CreateTestCircuit";


describe("IntegratedCircuit", () => {
    test("Basic IC", () => {
        const [circuit, _] = CreateTestCircuit();

        const [icCircuit] = CreateTestCircuit();

        const i1 = icCircuit.placeComponentAt("Switch", V(-5, -5));
        const i2 = icCircuit.placeComponentAt("Switch", V(-5, +5));
        const o1 = icCircuit.placeComponentAt("LED", V(+5,  0));
        const g  = icCircuit.placeComponentAt("ANDGate", V(0, 0));

        i1.outputs[0].connectTo(g.inputs[0]);
        i2.outputs[0].connectTo(g.inputs[1]);
        g.outputs[0].connectTo(o1.inputs[0]);

        icCircuit.name = "My IC";
        const ic = circuit.createIC({
            circuit: icCircuit,
            display: {
                size: V(4, 2),
                pins: [
                    { id: i1.outputs[0].id, group: "inputs", name: "In 1", pos: V(-1, -0.5), dir: V(-1, 0) },
                    { id: i2.outputs[0].id, group: "inputs", name: "In 2", pos: V(-1, +0.5), dir: V(-1, 0) },
                    { id: o1.inputs[0].id, group: "outputs", name: "Out",  pos: V(+1,    0), dir: V(+1, 0) },
                ],
            },
        })

        expect(ic.name).toBe("My IC");
        expect(ic.display.size).toEqual(V(4, 2));
        expect(ic.display.pins).toHaveLength(3);

        const icInstance = circuit.placeComponentAt(ic.id, V(1, 1));

        expect(icInstance.inputs).toHaveLength(2);
        expect(icInstance.outputs).toHaveLength(1);
        expect(icInstance.bounds).toEqual(new Rect(V(1, 1), V(4, 2)));

        expect(icInstance.inputs[0].originPos).toApproximatelyEqual(V(-2, -0.5).add(icInstance.pos));
        expect(icInstance.inputs[1].originPos).toApproximatelyEqual(V(-2, +0.5).add(icInstance.pos));
        expect(icInstance.outputs[0].originPos).toApproximatelyEqual(V(+2, 0).add(icInstance.pos));

        expect(icInstance.inputs[0].targetPos).toApproximatelyEqual(V(-2.7, -0.5).add(icInstance.pos));
        expect(icInstance.inputs[1].targetPos).toApproximatelyEqual(V(-2.7, +0.5).add(icInstance.pos));
        expect(icInstance.outputs[0].targetPos).toApproximatelyEqual(V(+2.7, 0).add(icInstance.pos));
    });

    test("Nested IC", () => {
        const [circuit, _] = CreateTestCircuit();

        const [innerIcCircuit] = CreateTestCircuit();

        const i1Inner = innerIcCircuit.placeComponentAt("Switch", V(-5, -5));
        const i2Inner = innerIcCircuit.placeComponentAt("Switch", V(-5, +5));
        const o1Inner = innerIcCircuit.placeComponentAt("LED", V(+5,  0));
        const gInner  = innerIcCircuit.placeComponentAt("ANDGate", V(0, 0));

        i1Inner.outputs[0].connectTo(gInner.inputs[0]);
        i2Inner.outputs[0].connectTo(gInner.inputs[1]);
        gInner.outputs[0].connectTo(o1Inner.inputs[0]);

        innerIcCircuit.name = "Inner IC";

        const innerIc = circuit.createIC({
            circuit: innerIcCircuit,
            display: {
                size: V(4, 2),
                pins: [
                    { id: i1Inner.outputs[0].id, group: "inputs", name: "Inner In 1", pos: V(-1, -0.5), dir: V(-1, 0) },
                    { id: i2Inner.outputs[0].id, group: "inputs", name: "Inner In 2", pos: V(-1, +0.5), dir: V(-1, 0) },
                    { id: o1Inner.inputs[0].id, group: "outputs", name: "Inner Out",  pos: V(+1,    0), dir: V(+1, 0) },
                ],
            },
        });
        expect(circuit.getICs()).toHaveLength(1);
        expect(circuit.getICs()[0].id).toEqual(innerIc.id);

        const [outerIcCircuit] = CreateTestCircuit();

        expect(outerIcCircuit.getICs()).toHaveLength(0);
        outerIcCircuit.importICs(circuit.getICs());
        expect(outerIcCircuit.getICs()).toHaveLength(1);
        expect(outerIcCircuit.getICs()[0].id).toEqual(innerIc.id);

        const i1Outer = outerIcCircuit.placeComponentAt("Switch", V(-5, -5));
        const i2Outer = outerIcCircuit.placeComponentAt("Switch", V(-5, +5));
        const o1Outer = outerIcCircuit.placeComponentAt("LED", V(+5,  0));
        const innerIcInstance = outerIcCircuit.placeComponentAt(innerIc.id, V(1, 1));
        expect(innerIcInstance.allPorts).toHaveLength(3);
        expect(innerIcInstance.ports["inputs"]).toHaveLength(2);
        expect(innerIcInstance.ports["outputs"]).toHaveLength(1);

        i1Outer.outputs[0].connectTo(innerIcInstance.inputs[0]);
        i2Outer.outputs[0].connectTo(innerIcInstance.inputs[1]);
        innerIcInstance.outputs[0].connectTo(o1Outer.inputs[0]);

        innerIcCircuit.name = "Outer IC";

        const outerIc = circuit.createIC({
            circuit: outerIcCircuit,
            display: {
                size: V(4, 2),
                pins: [
                    { id: i1Outer.outputs[0].id, group: "inputs", name: "Outer In 1", pos: V(-1, -0.5), dir: V(-1, 0) },
                    { id: i2Outer.outputs[0].id, group: "inputs", name: "Outer In 2", pos: V(-1, +0.5), dir: V(-1, 0) },
                    { id: o1Outer.inputs[0].id, group: "outputs", name: "Outer Out",  pos: V(+1,    0), dir: V(+1, 0) },
                ],
            },
        });

        const outerIcInstance = circuit.placeComponentAt(outerIc.id, V(1, 1));

        expect(outerIcInstance.allPorts).toHaveLength(3);
        expect(outerIcInstance.inputs).toHaveLength(2);
        expect(outerIcInstance.outputs).toHaveLength(1);
        expect(outerIcInstance.bounds).toEqual(new Rect(V(1, 1), V(4, 2)));
    });

    test("Basic IC from components in main circuit", () => {
        const [circuit, _] = CreateTestCircuit();

        const i1 = circuit.placeComponentAt("Switch", V(-5, -5));
        const i2 = circuit.placeComponentAt("Switch", V(-5, +5));
        const o1 = circuit.placeComponentAt("LED", V(+5,  0));
        const g  = circuit.placeComponentAt("ANDGate", V(0, 0));

        i1.outputs[0].connectTo(g.inputs[0]);
        i2.outputs[0].connectTo(g.inputs[1]);
        g.outputs[0].connectTo(o1.inputs[0]);

        // Import into new circuit
        const [icCircuit] = CreateTestCircuit();
        icCircuit.import(circuit);
        icCircuit.name = "My IC";
        const ic = circuit.createIC({
            circuit: icCircuit,
            display: {
                size: V(4, 2),
                pins: [
                    { id: i1.outputs[0].id, group: "inputs", name: "In 1", pos: V(-1, -0.5), dir: V(-1, 0) },
                    { id: i2.outputs[0].id, group: "inputs", name: "In 2", pos: V(-1, +0.5), dir: V(-1, 0) },
                    { id: o1.inputs[0].id, group: "outputs", name: "Out",  pos: V(+1,    0), dir: V(+1, 0) },
                ],
            },
        });

        expect(ic.name).toBe("My IC");
        expect(ic.display.size).toEqual(V(4, 2));
        expect(ic.display.pins).toHaveLength(3);
        // TODO[model_refactor_api]: This tests when we have replace-kind working
        // (after importing above, replace switches/leds with pins)
        // expect(ic.components.map((c) => c.kind)).toContain("InputPin");
        // expect(ic.components.map((c) => c.kind)).toContain("OutputPin");

        const icInstance = circuit.placeComponentAt(ic.id, V(1, 1));

        expect(icInstance.inputs).toHaveLength(2);
        expect(icInstance.outputs).toHaveLength(1);
        expect(icInstance.bounds).toEqual(new Rect(V(1, 1), V(4, 2)));

        expect(icInstance.inputs[0].originPos).toApproximatelyEqual(V(-2, -0.5).add(icInstance.pos));
        expect(icInstance.inputs[1].originPos).toApproximatelyEqual(V(-2, +0.5).add(icInstance.pos));
        expect(icInstance.outputs[0].originPos).toApproximatelyEqual(V(+2, 0).add(icInstance.pos));

        expect(icInstance.inputs[0].targetPos).toApproximatelyEqual(V(-2.7, -0.5).add(icInstance.pos));
        expect(icInstance.inputs[1].targetPos).toApproximatelyEqual(V(-2.7, +0.5).add(icInstance.pos));
        expect(icInstance.outputs[0].targetPos).toApproximatelyEqual(V(+2.7, 0).add(icInstance.pos));
    });
});
