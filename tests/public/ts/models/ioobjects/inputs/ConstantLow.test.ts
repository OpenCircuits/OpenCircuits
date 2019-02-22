import "jest";

import {CircuitDesigner} from "../../../../../../site/public/ts/models/CircuitDesigner";
import {ConstantLow}    from "../../../../../../site/public/ts/models/ioobjects/inputs/ConstantLow";
import {LED}             from "../../../../../../site/public/ts/models/ioobjects/outputs/LED";

describe("Constant Low", () => {
    const designer = new CircuitDesigner(0);
    const i = new ConstantLow(), o = new LED();

    designer.addObjects([i, o]);
    designer.connect(i, 0,  o, 0);

    it("Check Status", () => {
        expect(o.isOn()).toBe(false);
    });
});
