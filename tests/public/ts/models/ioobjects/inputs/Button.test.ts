import "jest";

import {CircuitDesigner} from "../../../../../../site/public/ts/models/CircuitDesigner";
import {Switch}          from "../../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {Button}          from "../../../../../../site/public/ts/models/ioobjects/inputs/Button";
import {ANDGate}         from "../../../../../../site/public/ts/models/ioobjects/gates/ANDGate";
import {LED}             from "../../../../../../site/public/ts/models/ioobjects/outputs/LED";

describe("Button", () => {
    var designer = new CircuitDesigner(0);
    var a = new Switch();
    var b = new Button(), b2 = new Button();
    var g = new ANDGate();
    var o = new LED(), o2 = new LED();

    designer.addObjects([a, b, g, o, b2, o2]);
    designer.connect(a, 0,  g, 0);
    designer.connect(b, 0,  g, 1);
    designer.connect(g, 0,  o, 0);
    designer.connect(b2, 0, o2, 0);

    it("Initial State", () => {
        b2.press();

        expect(o2.isOn()).toBe(true);
        b2.release();
    });

    it("Input A and B Off", () => {
        a.activate(false);
        b.activate(false);

        expect(o.isOn()).toBe(false);
        b.release();
    });

    it("Input A On", () => {
        a.activate(true);
        b.activate(false);

        expect(o.isOn()).toBe(false);
    });

    it("Input B On", () => {
        a.activate(false);
        b.press();

        expect(o.isOn()).toBe(false);
        b.release();
    });

    it("Input A and B On", () => {
        a.activate(true);
        b.press();

        expect(o.isOn()).toBe(true);
        b.release();
    });
});
