import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {DigitalNode} from "digital/models/ioobjects/other/DigitalNode";

import {GetHelpers} from "test/helpers/Helpers";


describe("Digital Node", () => {
    const designer = new DigitalCircuitDesigner(0);
    const {AutoPlace} = GetHelpers(designer);

    const [wp, [s], [o]] = AutoPlace(new DigitalNode());

    test("Off", () => {
    	s.activate(false);
        expect(o.isOn()).toBe(false);
    });
    test("On", () => {
        s.activate(true);
        expect(o.isOn()).toBe(true);
    });
});
