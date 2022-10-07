import {GetHelpers} from "test/helpers/Helpers";

import {DigitalCircuitDesigner}          from "digital/models/DigitalCircuitDesigner";
import {Comparator, ConstantNumber, LED} from "digital/models/ioobjects";


describe("Comparator", () => {
    const designer = new DigitalCircuitDesigner(0);
    const { Place,Connect } = GetHelpers(designer);

    // create necessary components for testing
    const [c] = Place(new Comparator());
    const [a,b] = Place(new ConstantNumber(), new ConstantNumber());
    const [lt,eq,gt] = Place(new LED(), new LED(), new LED());

    c.setInputPortCount(8); // 4 -> 4 comparison

    // Connect everything together
    Connect(a, c);
    Connect(b, c);
    Connect(c, Comparator.LT_PORT, lt, 0);
    Connect(c, Comparator.EQ_PORT, eq, 0);
    Connect(c, Comparator.GT_PORT, gt, 0);

    // testing numbers 0-15 to make sure they work
    test("Numbers 0-15", () => {
        a.setProp("inputNum", 5);
        b.setProp("inputNum", 6);
        expect(lt.isOn()).toBe((5 < 6));
        expect(gt.isOn()).toBe((5 > 6));

        for (let i = 0; i < 15; i++){
            a.setProp("inputNum", i);
            for (let j = 0; j < 15; j++){
                b.setProp("inputNum", j);

                expect(lt.isOn()).toBe((i < j));
                expect(gt.isOn()).toBe((i > j));
                expect(eq.isOn()).toBe((i===j));
            }
        }
    });
});
