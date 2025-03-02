/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "tests/helpers/Extensions";

import {V} from "Vector";

import {CreateTestRootCircuit} from "tests/helpers/CreateTestCircuit";
import {Rect} from "math/Rect";


describe("IntegratedCircuit", () => {
    test("Basic IC", () => {
        const [mainCircuit, mainState, { }] = CreateTestRootCircuit();

        const [icCircuit, icState, { GetPort, Connect }] = CreateTestRootCircuit();

        const pin1 = icCircuit.placeComponentAt("Pin", V(-5, -5));
        const pin2 = icCircuit.placeComponentAt("Pin", V(-5, +5));
        const pin3 = icCircuit.placeComponentAt("Pin", V(+5, 0));
        const g = icCircuit.placeComponentAt("TestComp", V(0, 0));

        icCircuit.name = "My IC";
        GetPort(pin1).name = "In 1";
        GetPort(pin2).name = "In 2";
        GetPort(pin3).name = "Out";

        Connect(pin1, g), Connect(pin2, g), Connect(g, pin3);

        const ic = mainCircuit.createIC({
            circuit: icCircuit,
            display: {
                size: V(4, 2),
                pins: [
                    { id: GetPort(pin1).id, pos: V(-2, -0.5) },
                    { id: GetPort(pin2).id, pos: V(-2, +0.5) },
                    { id: GetPort(pin3).id, pos: V(+2, 0) },
                ],
            },
        });

        expect(ic.name).toBe("My IC");
        expect(ic.display.size).toEqual(V(4, 2));
        expect(ic.display.pins).toHaveLength(3);

        const icInstance = mainCircuit.placeComponentAt(ic.id, V(1, 1));

        expect(icInstance.ports[""]).toHaveLength(3);
        expect(icInstance.bounds).toEqual(new Rect(V(1, 1), V(4, 2)));
    });
});
