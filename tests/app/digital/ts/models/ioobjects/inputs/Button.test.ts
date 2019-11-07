import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {Button}          from "digital/models/ioobjects/inputs/Button";
import {ANDGate}         from "digital/models/ioobjects/gates/ANDGate";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {Place, Connect} from "test/helpers/Helpers";

describe("Button", () => {
    const designer = new DigitalCircuitDesigner(0);
    const a = new Switch();
    const b = new Button(), b2 = new Button();
    const g = new ANDGate();
    const o = new LED(), o2 = new LED();

    Place(designer, [a, b, g, o, b2, o2]);
    Connect(a, 0,  g, 0);
    Connect(b, 0,  g, 1);
    Connect(g, 0,  o, 0);
    Connect(b2, 0, o2, 0);

    test("Initial State", () => {
        b2.press();

        expect(o2.isOn()).toBe(true);
        b2.release();
    });

    test("Input A and B Off", () => {
        a.activate(false);
        b.activate(false);

        expect(o.isOn()).toBe(false);
        b.release();
    });

    test("Input A On", () => {
        a.activate(true);
        b.activate(false);

        expect(o.isOn()).toBe(false);
    });

    test("Input B On", () => {
        a.activate(false);
        b.press();

        expect(o.isOn()).toBe(false);
        b.release();
    });

    test("Input A and B On", () => {
        a.activate(true);
        b.press();

        expect(o.isOn()).toBe(true);
        b.release();
    });
});
