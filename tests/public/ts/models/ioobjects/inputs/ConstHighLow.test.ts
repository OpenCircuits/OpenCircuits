import "jest";

import {CircuitDesigner} from "digital/models/CircuitDesigner";
import {ConstantHigh}    from "digital/models/ioobjects/inputs/ConstantHigh";
import {ConstantLow}     from "digital/models/ioobjects/inputs/ConstantLow";
import {LED}             from "digital/models/ioobjects/outputs/LED";

describe ("ConstHighLow", () => {
    describe("ConstHigh", () => {
        var designer = new CircuitDesigner(0);
        var c = new ConstantHigh();
        var l = new LED();
        designer.addObjects([c, l]);
        designer.connect(c, 0, l, 0);

        it("Initial State", () => {
            expect(l.isOn()).toBe(true);
        });

    });
    describe("ConstLow", () => {
        var designer = new CircuitDesigner(0);
        var c = new ConstantLow();
        var l = new LED();
        designer.addObjects([c, l]);
        designer.connect(c, 0, l, 0);

        it("Initial State", () => {
            expect(l.isOn()).toBe(false);
        });


    });


});
