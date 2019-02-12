import "jest";

import {CircuitDesigner} from "../../../../../../site/public/ts/models/CircuitDesigner";
import {Switch}          from "../../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {SRLatch}         from "../../../../../../site/public/ts/models/ioobjects/latches/SRLatch";
import {LED}             from "../../../../../../site/public/ts/models/ioobjects/outputs/LED";

describe("SRLatch", () => {
    const designer = new CircuitDesigner(0);
    const clk = new Switch(), s = new Switch(), r = new Switch(),
    	l = new SRLatch(), l0 = new LED(), l1 = new LED();

    designer.addObjects([clk, s, r, l, l1, l0]);
    designer.connect(clk, 0,  l, 1);
    designer.connect(s, 0,  l, 0);
    designer.connect(r, 0,  l, 2);
    designer.connect(l, 0,  l0, 0);
    designer.connect(l, 1,  l1, 0);

    it("Initial State", () => {
        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(false);
    });
    it("Toggle the Data without the Clock", () => {
        s.activate(true);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);

        s.activate(false);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);
    });
    it("Latch Off", () => {
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
    it("Latch in False State", () => {
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
    it("Latch in True State", () => {
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
    it("Set and Reset, undefined behavior", () => {
        clk.activate(true);
        s.activate(true);
        clk.activate(false);
    });
});
