import {GetHelpers} from "test/helpers/Helpers";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {ConstantHigh} from "digital/models/ioobjects/inputs/ConstantHigh";

import {LED} from "digital/models/ioobjects/outputs/LED";



describe("Constant Low", () => {
    const designer = new DigitalCircuitDesigner(0);
    const { Place, Connect } = GetHelpers(designer);

    const [i, o] = Place(new ConstantHigh(), new LED());
    Connect(i,  o);

    test("Check Status", () => {
        expect(o.isOn()).toBe(true);
    });
});
