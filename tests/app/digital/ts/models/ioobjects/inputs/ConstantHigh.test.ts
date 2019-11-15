import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {ConstantHigh}    from "digital/models/ioobjects/inputs/ConstantHigh";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {Place, Connect} from "test/helpers/Helpers";

describe("Constant Low", () => {
    const designer = new DigitalCircuitDesigner(0);
    const i = new ConstantHigh(), o = new LED();

    Place(designer, [i, o]);
    Connect(i, 0,  o, 0);

    test("Check Status", () => {
        expect(o.isOn()).toBe(true);
    });
});
