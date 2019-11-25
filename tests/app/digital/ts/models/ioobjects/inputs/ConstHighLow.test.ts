import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {ConstantHigh}    from "digital/models/ioobjects/inputs/ConstantHigh";
import {ConstantLow}     from "digital/models/ioobjects/inputs/ConstantLow";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {Place, Connect} from "test/helpers/Helpers";

describe ("ConstHighLow", () => {
    describe("ConstHigh", () => {
        var designer = new DigitalCircuitDesigner(0);
        var c = new ConstantHigh();
        var l = new LED();
        Place(designer, [c, l]);
        Connect(c, 0, l, 0);

        test("Initial State", () => {
            expect(l.isOn()).toBe(true);
        });

    });
    describe("ConstLow", () => {
        var designer = new DigitalCircuitDesigner(0);
        var c = new ConstantLow();
        var l = new LED();
        Place(designer, [c, l]);
        Connect(c, 0, l, 0);

        test("Initial State", () => {
            expect(l.isOn()).toBe(false);
        });
    });


});
