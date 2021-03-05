import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {ConstantLow}     from "digital/models/ioobjects/inputs/ConstantLow";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {GetHelpers} from "test/helpers/Helpers";


describe("Constant Low", () => {
    const designer = new DigitalCircuitDesigner(0);
    const {Place, Connect} = GetHelpers({designer});
    const i = new ConstantLow(), o = new LED();

    Place(i, o);
    Connect(i, 0,  o, 0);

    test("Check Status", () => {
        expect(o.isOn()).toBe(false);
    });
});
