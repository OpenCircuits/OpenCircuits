import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {ConstantHigh}    from "digital/models/ioobjects/inputs/ConstantHigh";
import {ConstantLow}     from "digital/models/ioobjects/inputs/ConstantLow";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {GetHelpers} from "test/helpers/Helpers";


describe ("ConstHighLow", () => {
    describe("ConstHigh", () => {
        const designer = new DigitalCircuitDesigner(0);
        const {Place, Connect} = GetHelpers({designer});

        const c = new ConstantHigh();
        const l = new LED();
        Place(c, l);
        Connect(c, 0, l, 0);

        test("Initial State", () => {
            expect(l.isOn()).toBe(true);
        });

    });
    describe("ConstLow", () => {
        const designer = new DigitalCircuitDesigner(0);
        const {Place, Connect} = GetHelpers({designer});

        const c = new ConstantLow();
        const l = new LED();
        Place(c, l);
        Connect(c, 0, l, 0);

        test("Initial State", () => {
            expect(l.isOn()).toBe(false);
        });
    });
});
