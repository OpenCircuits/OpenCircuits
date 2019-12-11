import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {TFlipFlop}       from "digital/models/ioobjects/flipflops/TFlipFlop";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {Place, Connect} from "test/helpers/Helpers";

describe("TFlipFLop", () => {
    const designer = new DigitalCircuitDesigner(0);
    const clk = new Switch(), tgl = new Switch(), f = new TFlipFlop(), l0 = new LED(), l1 = new LED();

    Place(designer, [clk, tgl, f, l1, l0]);
    Connect(clk, 0,  f, 0);
    Connect(tgl, 0,  f, 1);
    Connect(f, 0,  l0, 0);
    Connect(f, 1,  l1, 0);

    test("Initial State", () => {
        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(false);
    });
    test("Turn On the Toggle", () => {
        clk.activate(false);
        tgl.activate(true);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);
    });
    test("Turn On the Clock, 1", () => {
        clk.activate(true);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);
    });
    test("Turn Off the Clock, 1", () => {
        clk.activate(false);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);
    });
    test("Turn On the Clock, 2", () => {
        clk.activate(true);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);
    });
    test("Turn Off the Clock, 2", () => {
        clk.activate(false);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);
    });
    test("Turn Off the Toggle", () => {
        tgl.activate(false);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);
    });
    test("Pulse the Clock with the Toggle Off", () => {
        clk.activate(true);
        clk.activate(false);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);
    });
});
