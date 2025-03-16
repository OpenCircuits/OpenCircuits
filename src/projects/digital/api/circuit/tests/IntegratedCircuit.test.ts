import "shared/tests/helpers/Extensions";

import {CreateCircuit} from "digital/api/circuit/public";

import {V} from "Vector";
import {Rect} from "math/Rect";


describe("IntegratedCircuit", () => {
    test("Basic IC", () => {
        const [circuit, _] = CreateCircuit();

        const [icCircuit] = CreateCircuit();

        const i1 = icCircuit.placeComponentAt("Switch", V(-5, -5));
        const i2 = icCircuit.placeComponentAt("Switch", V(-5, +5));
        const o1 = icCircuit.placeComponentAt("LED", V(+5,  0));
        const g  = icCircuit.placeComponentAt("ANDGate", V(0, 0));

        i1.outputs[0].connectTo(g.inputs[0]);
        i2.outputs[0].connectTo(g.inputs[1]);
        g.outputs[0].connectTo(o1.inputs[0]);

        icCircuit.name = "My IC";
        i1.outputs[0].name = "In 1";
        i2.outputs[0].name = "In 2";
        o1.inputs[0].name = "Out";

        const ic = circuit.createIC({
            circuit: icCircuit,
            display: {
                size: V(4, 2),
                pins: [
                    { id: i1.outputs[0].id, group: "inputs", pos: V(-2, -0.5) },
                    { id: i2.outputs[0].id, group: "inputs", pos: V(-2, +0.5) },
                    { id: o1.inputs[0].id, group: "outputs", pos: V(+2, 0) },
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

        expect(icInstance.inputs[0].originPos).toApproximatelyEqual(V(-2, -0.5).add(1, 1));
        expect(icInstance.inputs[1].originPos).toApproximatelyEqual(V(-2, +0.5).add(1, 1));
        expect(icInstance.outputs[0].originPos).toApproximatelyEqual(V(+2, 0).add(1, 1));

        expect(icInstance.inputs[0].targetPos).toApproximatelyEqual(V(-2.7, -0.5).add(1, 1));
        expect(icInstance.inputs[1].targetPos).toApproximatelyEqual(V(-2.7, +0.5).add(1, 1));
        expect(icInstance.outputs[0].targetPos).toApproximatelyEqual(V(+2.7, 0).add(1, 1));
    });

    test("Nested IC", () => {
        const [circuit, _] = CreateCircuit();

        const [innerIcCircuit] = CreateCircuit();

        const i1Inner = innerIcCircuit.placeComponentAt("Switch", V(-5, -5));
        const i2Inner = innerIcCircuit.placeComponentAt("Switch", V(-5, +5));
        const o1Inner = innerIcCircuit.placeComponentAt("LED", V(+5,  0));
        const gInner  = innerIcCircuit.placeComponentAt("ANDGate", V(0, 0));

        i1Inner.outputs[0].connectTo(gInner.inputs[0]);
        i2Inner.outputs[0].connectTo(gInner.inputs[1]);
        gInner.outputs[0].connectTo(o1Inner.inputs[0]);

        innerIcCircuit.name = "Inner IC";
        i1Inner.outputs[0].name = "Inner In 1";
        i2Inner.outputs[0].name = "Inner In 2";
        o1Inner.inputs[0].name = "Inner Out";

        const innerIc = circuit.createIC({
            circuit: innerIcCircuit,
            display: {
                size: V(4, 2),
                pins: [
                    { id: i1Inner.outputs[0].id, group: "inputs", pos: V(-2, -0.5) },
                    { id: i2Inner.outputs[0].id, group: "inputs", pos: V(-2, +0.5) },
                    { id: o1Inner.inputs[0].id, group: "outputs", pos: V(+2, 0) },
                ],
            },
        });

        const [outerIcCircuit] = CreateCircuit();

        outerIcCircuit.importICs(circuit.getICs());

        const i1Outer = outerIcCircuit.placeComponentAt("Switch", V(-5, -5));
        const i2Outer = outerIcCircuit.placeComponentAt("Switch", V(-5, +5));
        const o1Outer = outerIcCircuit.placeComponentAt("LED", V(+5,  0));
        const innerIcInstance = outerIcCircuit.placeComponentAt(innerIc.id, V(1, 1));

        i1Outer.outputs[0].connectTo(innerIcInstance.inputs[0]);
        i2Outer.outputs[0].connectTo(innerIcInstance.inputs[1]);
        innerIcInstance.outputs[0].connectTo(o1Outer.inputs[0]);

        innerIcCircuit.name = "Outer IC";
        i1Outer.outputs[0].name = "Outer In 1";
        i2Outer.outputs[0].name = "Outer In 2";
        o1Outer.inputs[0].name = "Outer Out";

        const outerIc = circuit.createIC({
            circuit: outerIcCircuit,
            display: {
                size: V(4, 2),
                pins: [
                    { id: i1Outer.outputs[0].id, group: "inputs", pos: V(-2, -0.5) },
                    { id: i2Outer.outputs[0].id, group: "inputs", pos: V(-2, +0.5) },
                    { id: o1Outer.inputs[0].id, group: "outputs", pos: V(+2, 0) },
                ],
            },
        });

        const outerIcInstance = circuit.placeComponentAt(outerIc.id, V(1, 1));

        expect(outerIcInstance.inputs).toHaveLength(2);
        expect(outerIcInstance.outputs).toHaveLength(1);
        expect(outerIcInstance.bounds).toEqual(new Rect(V(1, 1), V(4, 2)));
    });
});
