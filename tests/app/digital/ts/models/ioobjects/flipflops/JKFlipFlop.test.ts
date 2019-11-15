import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {JKFlipFlop}      from "digital/models/ioobjects/flipflops/JKFlipFlop";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {Place, Connect} from "test/helpers/Helpers";

describe("JKFlipFLop", () => {
    const designer = new DigitalCircuitDesigner(0);
    const clk = new Switch(), s = new Switch(), r = new Switch(),
    	f = new JKFlipFlop(), l0 = new LED(), l1 = new LED();

    Place(designer, [clk, s, r, f, l1, l0]);
    Connect(clk, 0, f, 1);
    Connect(s, 0, f, 0);
    Connect(r, 0, f , 2);
    Connect(f, 0, l0, 0);
    Connect(f, 1, l1, 0);

    test("Initial State", () => {
        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(false);
    });
    test("Turn On an Input", () => {
        clk.activate(false);
        s.activate(true);
        s.activate(false);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);
    });
    test("Set", () => {
		s.activate(true);
		clk.activate(true);
        s.activate(false);
        clk.activate(false);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);
    });
    test("Set while On, Reset falling edge", () => {
    	s.activate(true);
		clk.activate(true);
        s.activate(false);
        r.activate(true);
        clk.activate(false);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);
    });
    test("Reset", () => {
    	clk.activate(true);
        r.activate(false);
        clk.activate(false);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);
    });
    test("Reset while Off, Set falling edge", () => {
		r.activate(true);
		clk.activate(true);
        r.activate(false);
        s.activate(true);
        clk.activate(false);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);
	});
    test("Set and Reset", () => {
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
