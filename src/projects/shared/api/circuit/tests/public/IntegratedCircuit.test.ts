/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "tests/helpers/Extensions";

import {V} from "Vector";

import {Circuit, Obj} from "shared/api/circuit/public";

import {CreateTestRootCircuit} from "tests/helpers/CreateTestCircuit";


describe("IntegratedCircuit", () => {
    test("Basic IC", () => {
        const [circuit, state, { Connect }] = CreateTestRootCircuit();

        const ic = circuit.createIC();

        const i1 = ic.placeComponentAt("Pin", V(-5, -5));
        const i2 = ic.placeComponentAt("Pin", V(-5, +5));
        const o1 = ic.placeComponentAt("Pin", V(+5,  0));
        const g  = ic.placeComponentAt("TestComp", V(0, 0));

        Connect(i1, g), Connect(i2, g), Connect(g, o1);

        ic.name = "My IC";
        ic.display.size = V(4, 2);
        i1.name = "In 1";
        ic.display.setPinPos(i1.id, V(-3, 1));
        i2.name = "In 2";
        ic.display.setPinPos(i2.id, V(-3, -1));
        o1.name = "Out";
        ic.display.setPinPos(o1.id, V(3, 0));

        expect(ic.display.size).toBe(V(4, 2));
    });
});
