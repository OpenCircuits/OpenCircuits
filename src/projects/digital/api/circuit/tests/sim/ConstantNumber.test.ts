import "shared/tests/helpers/Extensions";

import {CreateTestCircuit} from "tests/helpers/CreateTestCircuit";


describe("ConstantNumber", () => {
    test("Default outputs 0", () => {
        const [_, { PlaceAndConnect }] = CreateTestCircuit();
        const [_comp, { outputs: [out1, out2, out3, out4] }] = PlaceAndConnect("ConstantNumber");

        expect(out1).toBeOff();
        expect(out2).toBeOff();
        expect(out3).toBeOff();
        expect(out4).toBeOff();
    });
    test("Changing inputNum changes outputs", () => {
        const [_, { PlaceAndConnect }] = CreateTestCircuit();
        const [comp, { outputs: [out1, out2, out3, out4] }] = PlaceAndConnect("ConstantNumber");

        comp.setProp("inputNum", 1);

        expect(out1).toBeOn();
        expect(out2).toBeOff();
        expect(out3).toBeOff();
        expect(out4).toBeOff();
    });
    test("Output order", () => {
        const [_, { PlaceAndConnect }] = CreateTestCircuit();
        const [comp] = PlaceAndConnect("ConstantNumber");
        expect(comp.outputs[0].targetPos.y).toBeGreaterThan(comp.outputs[1].targetPos.y);
    });
});
