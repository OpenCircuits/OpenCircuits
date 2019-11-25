import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Clock}           from "digital/models/ioobjects/inputs/Clock";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {Place, Connect} from "test/helpers/Helpers";

describe ("Clock", () => {
    var designer = new DigitalCircuitDesigner(0), c = new Clock(), l = new LED();

    Place(designer, [c, l]);
    Connect(c, 0, l, 0);

    test("Initial State", () => {
        expect(l.isOn()).toBe(true);
    }, 500);

    test("Tick", () => {
        c.tick();
        expect(l.isOn()).toBe(false);
    }, 500);

    test("Tick Again", () => {
        c.tick();
        expect(l.isOn()).toBe(true);
    }, 500);
})
