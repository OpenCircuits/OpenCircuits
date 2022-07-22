import {GetHelpers} from "test/helpers/Helpers";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {DigitalNode} from "digital/models/ioobjects/other/DigitalNode";



describe("Digital Node", () => {
    const designer = new DigitalCircuitDesigner(0);
    const { AutoPlace } = GetHelpers(designer);

    const [, [s], [o]] = AutoPlace(new DigitalNode());

    test("Off", () => {
        s.activate(false);
        expect(o.isOn()).toBe(false);
    });
    test("On", () => {
        s.activate(true);
        expect(o.isOn()).toBe(true);
    });
});
