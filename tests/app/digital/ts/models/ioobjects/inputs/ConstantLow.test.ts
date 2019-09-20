import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {ConstantLow}     from "digital/models/ioobjects/inputs/ConstantLow";
import {LED}             from "digital/models/ioobjects/outputs/LED";

describe("Constant Low", () => {
    const designer = new DigitalCircuitDesigner(0);
    const i = new ConstantLow(), o = new LED();

    designer.addObjects([i, o]);
    designer.connect(i, 0,  o, 0);

    it("Check Status", () => {
        expect(o.isOn()).toBe(false);
    });
});
