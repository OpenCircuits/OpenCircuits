import "jest";

import {CircuitDesigner} from "../../../../../../site/public/ts/models/CircuitDesigner";
import {ConstantHigh}   from "../../../../../../site/public/ts/models/ioobjects/inputs/ConstantHigh";
import {LED}             from "../../../../../../site/public/ts/models/ioobjects/outputs/LED";

describe("Constant Low", () => {
    const designer = new CircuitDesigner(0);
    const i = new ConstantHigh(), o = new LED();

    designer.addObjects([i, o]);
    designer.connect(i, 0,  o, 0);

    it("Check Status", () => {
        expect(o.isOn()).toBe(true);
    });
});
