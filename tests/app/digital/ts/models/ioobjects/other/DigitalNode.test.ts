import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {LED}             from "digital/models/ioobjects/outputs/LED";
import {DigitalNode}     from "digital/models/ioobjects/other/DigitalNode";

import {Place, Connect} from "test/helpers/Helpers";

describe("Digital Node", () => {
    const designer = new DigitalCircuitDesigner(0);
    const wp = new DigitalNode(), s = new Switch(), o = new LED();

    Place(designer, [wp, s, o]);
    Connect(s, 0,  wp, 0);
    Connect(wp, 0,  o, 0);

    test("Off", () => {
    	s.activate(false);
        expect(o.isOn()).toBe(false);
    });
    test("On", () => {
        s.activate(true);
        expect(o.isOn()).toBe(true);
    });
});
