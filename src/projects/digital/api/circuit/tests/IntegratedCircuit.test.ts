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
});
