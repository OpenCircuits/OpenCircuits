import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Clock}           from "digital/models/ioobjects/inputs/Clock";
import {LED}             from "digital/models/ioobjects/outputs/LED";

describe ("Clock", () => {
    var designer = new DigitalCircuitDesigner(0), c = new Clock(), l = new LED();
    designer.addObjects([c, l]);
    designer.connect(c, 0, l, 0);

    it ("Initial State", () => {
        expect(l.isOn()).toBe(true);
    }, 500)

    it ("Tick", () => {
        c.tick();
        expect(l.isOn()).toBe(false);
    }, 500)

    it ("Tick Again", () => {
        c.tick();
        expect(l.isOn()).toBe(true);
    }, 500)
})
