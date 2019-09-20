import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {JKFlipFlop}      from "digital/models/ioobjects/flipflops/JKFlipFlop";
import {LED}             from "digital/models/ioobjects/outputs/LED";

describe("JKFlipFLop", () => {
    const designer = new DigitalCircuitDesigner(0);
    const clk = new Switch(), s = new Switch(), r = new Switch(),
    	f = new JKFlipFlop(), l0 = new LED(), l1 = new LED();

    designer.addObjects([clk, s, r, f, l1, l0]);
    designer.connect(clk, 0,  f, 1);
    designer.connect(s, 0,  f, 0);
    designer.connect(r, 0,  f, 2);
    designer.connect(f, 0,  l0, 0);
    designer.connect(f, 1,  l1, 0);

    it("Initial State", () => {
        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(false);
    });
    it("Turn On an Input", () => {
        clk.activate(false);
        s.activate(true);
        s.activate(false);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);
    });
    it("Set", () => {
		s.activate(true);
		clk.activate(true);
        s.activate(false);
        clk.activate(false);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);
    });
    it("Set while On, Reset falling edge", () => {
    	s.activate(true);
		clk.activate(true);
        s.activate(false);
        r.activate(true);
        clk.activate(false);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);
    });
    it("Reset", () => {
    	clk.activate(true);
        r.activate(false);
        clk.activate(false);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);
    });
    it("Reset while Off, Set falling edge", () => {
		r.activate(true);
		clk.activate(true);
        r.activate(false);
        s.activate(true);
        clk.activate(false);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);
	});
    it("Set and Reset", () => {
	    r.activate(true);
	    clk.activate(true);
	    clk.activate(false);

    	expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);

        clk.activate(true);
        clk.activate(false);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);
    });
});
