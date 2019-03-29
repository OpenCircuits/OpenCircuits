import "jest";

import {CircuitDesigner} from "../../../../../../site/public/ts/models/CircuitDesigner";
import {Switch}   from "../../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {LED}      from "../../../../../../site/public/ts/models/ioobjects/outputs/LED";
import {WirePort} from "../../../../../../site/public/ts/models/ioobjects/other/WirePort";

describe("Wire Port", () => {
    const designer = new CircuitDesigner(0);
    const wp = new WirePort(), s = new Switch(), o = new LED();

    designer.addObjects([wp, s, o]);
    designer.connect(s, 0,  wp, 0);
    designer.connect(wp, 0,  o, 0);

    it("Off", () => {
    	s.activate(false);
        expect(o.isOn()).toBe(false);
    });
    it("On", () => {
        s.activate(true);
        expect(o.isOn()).toBe(true);
    });
});
