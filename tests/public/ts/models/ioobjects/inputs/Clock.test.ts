import "jest";

import {CircuitDesigner} from "../../../../../../site/public/ts/models/CircuitDesigner";
import {Clock} from "../../../../../../site/public/ts/models/ioobjects/inputs/Clock";
import {LED} from "../../../../../../site/public/ts/models/ioobjects/outputs/LED";

describe ("Clock", () => {
    var designer = new CircuitDesigner(0), c = new Clock(), l = new LED();
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
