import "shared/tests/helpers/Extensions";

import {CreateTestCircuit} from "tests/helpers/CreateTestCircuit";


describe("Inputs", () => {
    describe("Constant Number", () => {
        test("0", () => {
            const [{}, {}, { Place, Connect }] = CreateTestCircuit();
            const [i1, o1, o2, o3, o4] = Place("ConstantNumber", "OutputPin", "OutputPin", "OutputPin", "OutputPin");
            Connect(i1.outputs[0], o1), Connect(i1.outputs[1], o2), Connect(i1.outputs[2], o3), Connect(i1.outputs[3], o4);

            expect(o1).toBeOff();
            expect(o2).toBeOff();
            expect(o3).toBeOff();
            expect(o4).toBeOff();
        });
        test("F", () => {
            const [{}, {}, { Place, Connect }] = CreateTestCircuit();
            const [i1, o1, o2, o3, o4] = Place("ConstantNumber", "OutputPin", "OutputPin", "OutputPin", "OutputPin");
            Connect(i1.outputs[0], o1), Connect(i1.outputs[1], o2), Connect(i1.outputs[2], o3), Connect(i1.outputs[3], o4);

            i1.setProp("inputNum", 15);

            expect(o1).toBeOn();
            expect(o2).toBeOn();
            expect(o3).toBeOn();
            expect(o4).toBeOn();
        });
    });
});
