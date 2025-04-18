import "shared/tests/helpers/Extensions";

import {CreateTestCircuit} from "tests/helpers/CreateTestCircuit";
import {V} from "Vector";


describe("ConstantNumber", () => {
    test("Default outputs 0", () => {
        const [{}, {}, { PlaceAndConnect }] = CreateTestCircuit();
        const [_comp, { outputs: [out1, out2, out3, out4] }] = PlaceAndConnect("ConstantNumber");

        expect(out1).toBeOff();
        expect(out2).toBeOff();
        expect(out3).toBeOff();
        expect(out4).toBeOff();
    });
    test("Changing inputNum changes outputs", () => {
        const [{}, {}, { PlaceAndConnect }] = CreateTestCircuit();
        const [comp, { outputs: [out1, out2, out3, out4] }] = PlaceAndConnect("ConstantNumber");

        comp.setProp("inputNum", 1);

        expect(out1).toBeOn();
        expect(out2).toBeOff();
        expect(out3).toBeOff();
        expect(out4).toBeOff();
    });
});