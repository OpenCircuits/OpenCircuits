/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "tests/helpers/Extensions";

import {V} from "Vector";

import {CreateTestCircuit} from "tests/helpers/CreateTestCircuit";
import {Rect} from "math/Rect";


describe("IntegratedCircuit", () => {
    test("Basic IC", () => {
        const [mainCircuit, mainState, { }] = CreateTestCircuit();

        const [icCircuit, icState, { GetPort, Connect }] = CreateTestCircuit();

        const pin1 = icCircuit.placeComponentAt("Pin", V(-5, -5));
        const pin2 = icCircuit.placeComponentAt("Pin", V(-5, +5));
        const pin3 = icCircuit.placeComponentAt("Pin", V(+5, 0));
        const g = icCircuit.placeComponentAt("TestComp", V(0, 0));

        icCircuit.name = "My IC";

        Connect(pin1, g), Connect(pin2, g), Connect(g, pin3);

        const ic = mainCircuit.createIC({
            circuit: icCircuit,
            display: {
                size: V(4, 2),
                pins: [
                    { id: GetPort(pin1).id, group: "", name: "In 1", pos: V(-1, -0.5), dir: V(-1, 0) },
                    { id: GetPort(pin2).id, group: "", name: "In 2", pos: V(-1, +0.5), dir: V(-1, 0) },
                    { id: GetPort(pin3).id, group: "", name: "Out", pos: V(+1,    0), dir: V(+1, 0) },
                ],
            },
        });
        expect(mainCircuit.getICs()).toHaveLength(1);
        expect(mainCircuit.getICs()[0].id).toEqual(ic.id);

        expect(ic.name).toBe("My IC");
        expect(ic.display.size).toEqual(V(4, 2));
        expect(ic.display.pins).toHaveLength(3);

        const icInstance = mainCircuit.placeComponentAt(ic.id, V(1, 1));

        expect(icInstance.ports[""]).toHaveLength(3);
        expect(icInstance.bounds).toEqual(new Rect(V(1, 1), V(4, 2)));

        expect(icInstance.ports[""][0].originPos).toApproximatelyEqual(V(-2, -0.5).add(icInstance.pos));
        expect(icInstance.ports[""][1].originPos).toApproximatelyEqual(V(-2, +0.5).add(icInstance.pos));
        expect(icInstance.ports[""][2].originPos).toApproximatelyEqual(V(+2, 0).add(icInstance.pos));

        expect(icInstance.ports[""][0].targetPos).toApproximatelyEqual(V(-2.7, -0.5).add(icInstance.pos));
        expect(icInstance.ports[""][1].targetPos).toApproximatelyEqual(V(-2.7, +0.5).add(icInstance.pos));
        expect(icInstance.ports[""][2].targetPos).toApproximatelyEqual(V(+2.7, 0).add(icInstance.pos));
    });

    test("Nested IC", () => {
        const [mainCircuit, _, { }] = CreateTestCircuit();

        const [innerIcCircuit, __, { Connect, GetPort }] = CreateTestCircuit();

        const pin1Inner = innerIcCircuit.placeComponentAt("Pin", V(-5, -5));
        const pin2Inner = innerIcCircuit.placeComponentAt("Pin", V(-5, +5));
        const pin3Inner = innerIcCircuit.placeComponentAt("Pin", V(+5, 0));
        const gInner = innerIcCircuit.placeComponentAt("TestComp", V(0, 0));

        Connect(pin1Inner, gInner), Connect(pin2Inner, gInner), Connect(gInner, pin3Inner);

        innerIcCircuit.name = "Inner IC";

        const innerIc = mainCircuit.createIC({
            circuit: innerIcCircuit,
            display: {
                size: V(4, 2),
                pins: [
                    { id: GetPort(pin1Inner).id, group: "inputs",  name: "Inner In 1", pos: V(-1, -0.5), dir: V(-1, 0) },
                    { id: GetPort(pin2Inner).id, group: "inputs",  name: "Inner In 2", pos: V(-1, +0.5), dir: V(-1, 0) },
                    { id: GetPort(pin3Inner).id, group: "outputs", name: "Inner Out",  pos: V(+1,    0), dir: V(+1, 0) },
                ],
            },
        });
        expect(mainCircuit.getICs()).toHaveLength(1);
        expect(mainCircuit.getICs()[0].id).toEqual(innerIc.id);

        const [outerIcCircuit, ___, { Connect: Connect2, GetPort: GetPort2 }] = CreateTestCircuit();

        expect(outerIcCircuit.getICs()).toHaveLength(0);
        outerIcCircuit.importICs(mainCircuit.getICs());
        expect(outerIcCircuit.getICs()).toHaveLength(1);
        expect(outerIcCircuit.getICs()[0].id).toEqual(innerIc.id);

        const pin1Outer = outerIcCircuit.placeComponentAt("Pin", V(-5, -5));
        const pin2Outer = outerIcCircuit.placeComponentAt("Pin", V(-5, +5));
        const pin3Outer = outerIcCircuit.placeComponentAt("Pin", V(+5, 0));
        const innerIcInstance = outerIcCircuit.placeComponentAt(innerIc.id, V(1, 1));

        expect(innerIcInstance.allPorts).toHaveLength(3);
        expect(innerIcInstance.ports["inputs"]).toHaveLength(2);
        expect(innerIcInstance.ports["outputs"]).toHaveLength(1);

        pin1Outer.allPorts[0].connectTo(innerIcInstance.ports["inputs"][0]);
        pin2Outer.allPorts[0].connectTo(innerIcInstance.ports["inputs"][1]);
        innerIcInstance.ports["outputs"][0].connectTo(pin3Outer.allPorts[0]);

        innerIcCircuit.name = "Outer IC";

        const outerIc = mainCircuit.createIC({
            circuit: outerIcCircuit,
            display: {
                size: V(4, 2),
                pins: [
                    { id: pin1Outer.allPorts[0].id, group: "inputs",  name: "Outer In 1", pos: V(-1, -0.5), dir: V(-1, 0) },
                    { id: pin2Outer.allPorts[0].id, group: "inputs",  name: "Outer In 2", pos: V(-1, +0.5), dir: V(-1, 0) },
                    { id: pin3Outer.allPorts[0].id, group: "outputs", name: "Outer Out",  pos: V(+1,    0), dir: V(+1, 0) },
                ],
            },
        });

        const outerIcInstance = mainCircuit.placeComponentAt(outerIc.id, V(1, 1));

        expect(outerIcInstance.allPorts).toHaveLength(3);
        expect(outerIcInstance.ports["inputs"]).toHaveLength(2);
        expect(outerIcInstance.ports["outputs"]).toHaveLength(1);
        expect(outerIcInstance.bounds).toEqual(new Rect(V(1, 1), V(4, 2)));
    });

    test("Change IC display", () => {
        const [mainCircuit, mainState, { }] = CreateTestCircuit();

        const [icCircuit, icState, { GetPort, Connect }] = CreateTestCircuit();

        const pin1 = icCircuit.placeComponentAt("Pin", V(-5, -5));
        const pin2 = icCircuit.placeComponentAt("Pin", V(-5, +5));
        const pin3 = icCircuit.placeComponentAt("Pin", V(+5, 0));
        const g = icCircuit.placeComponentAt("TestComp", V(0, 0));

        icCircuit.name = "My IC";

        Connect(pin1, g), Connect(pin2, g), Connect(g, pin3);

        const ic = mainCircuit.createIC({
            circuit: icCircuit,
            display: {
                size: V(4, 2),
                pins: [
                    { id: GetPort(pin1).id, group: "", name: "In 1", pos: V(-1, -0.5), dir: V(-1, 0) },
                    { id: GetPort(pin2).id, group: "", name: "In 2", pos: V(-1, +0.5), dir: V(-1, 0) },
                    { id: GetPort(pin3).id, group: "", name: "Out",  pos: V(+1,    0), dir: V(+1, 0) },
                ],
            },
        });
        expect(mainCircuit.getICs()).toHaveLength(1);
        expect(mainCircuit.getICs()[0].id).toEqual(ic.id);

        expect(ic.name).toBe("My IC");
        expect(ic.display.size).toEqual(V(4, 2));
        expect(ic.display.pins).toHaveLength(3);

        const icInstance = mainCircuit.placeComponentAt(ic.id, V(1, 1));

        expect(icInstance.ports[""]).toHaveLength(3);
        expect(icInstance.bounds).toEqual(new Rect(V(1, 1), V(4, 2)));

        expect(icInstance.ports[""][0].originPos).toApproximatelyEqual(V(-2, -0.5).add(icInstance.pos));
        expect(icInstance.ports[""][1].originPos).toApproximatelyEqual(V(-2, +0.5).add(icInstance.pos));
        expect(icInstance.ports[""][2].originPos).toApproximatelyEqual(V(+2, 0).add(icInstance.pos));

        expect(icInstance.ports[""][0].targetPos).toApproximatelyEqual(V(-2.7, -0.5).add(icInstance.pos));
        expect(icInstance.ports[""][1].targetPos).toApproximatelyEqual(V(-2.7, +0.5).add(icInstance.pos));
        expect(icInstance.ports[""][2].targetPos).toApproximatelyEqual(V(+2.7, 0).add(icInstance.pos));

        // Change size
        ic.display.size = V(6, 4);
        expect(icInstance.bounds).toEqual(new Rect(V(1, 1), V(6, 4)));

        expect(icInstance.ports[""][0].originPos).toApproximatelyEqual(V(-3, -1).add(icInstance.pos));
        expect(icInstance.ports[""][1].originPos).toApproximatelyEqual(V(-3, +1).add(icInstance.pos));
        expect(icInstance.ports[""][2].originPos).toApproximatelyEqual(V(+3, 0).add(icInstance.pos));

        expect(icInstance.ports[""][0].targetPos).toApproximatelyEqual(V(-3.7, -1).add(icInstance.pos));
        expect(icInstance.ports[""][1].targetPos).toApproximatelyEqual(V(-3.7, +1).add(icInstance.pos));
        expect(icInstance.ports[""][2].targetPos).toApproximatelyEqual(V(+3.7, 0).add(icInstance.pos));

        // Change port location
        ic.display.pins[2].pos = V(1, 1);
        expect(icInstance.ports[""][2].originPos).toApproximatelyEqual(V(+3, 2).add(icInstance.pos));
        expect(icInstance.ports[""][2].targetPos).toApproximatelyEqual(V(+3.7, 2).add(icInstance.pos));
    });
});
