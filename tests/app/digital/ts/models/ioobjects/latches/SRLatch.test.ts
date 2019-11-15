import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {SRLatch}         from "digital/models/ioobjects/latches/SRLatch";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {Place, Connect} from "test/helpers/Helpers";

describe("SRLatch", () => {
    const designer = new DigitalCircuitDesigner(0);
    const clk = new Switch(), s = new Switch(), r = new Switch(),
    	l = new SRLatch(), l0 = new LED(), l1 = new LED();

    Place(designer, [clk, s, r, l, l1, l0]);
    Connect(clk, 0,  l, 1);
    Connect(s, 0,  l, 2);
    Connect(r, 0,  l, 0);
    Connect(l, 0,  l0, 0);
    Connect(l, 1,  l1, 0);

    test("Initial State", () => {
        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(false);
    });
    test("Toggle the Data without the Clock", () => {
        s.activate(true);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);

        s.activate(false);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);
    });
    test("Latch Off", () => {
        clk.activate(true);
        s.activate(true);
        s.activate(false);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);

        r.activate(true);
        r.activate(false);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);
    });
    test("Latch in False State", () => {
        clk.activate(false);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);

        s.activate(true);
        s.activate(false);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);

        r.activate(true);
        r.activate(false);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);
    });
    test("Latch in True State", () => {
    	clk.activate(true);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);

        s.activate(true);
        s.activate(false);
        clk.activate(false);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);

        s.activate(true);
        s.activate(false);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);

        r.activate(true);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);
    });
    test("Set and Reset, undefined behavior", () => {
        clk.activate(true);
        s.activate(true);
        clk.activate(false);
    });
});
