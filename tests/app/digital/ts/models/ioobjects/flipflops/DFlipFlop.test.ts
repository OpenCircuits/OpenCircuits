import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {DFlipFlop}       from "digital/models/ioobjects/flipflops/DFlipFlop";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {Place, Connect} from "test/helpers/Helpers";

describe("DFlipFLop", () => {
    const designer = new DigitalCircuitDesigner(0);
    const clk = new Switch(), data = new Switch(), f = new DFlipFlop(), l0 = new LED(), l1 = new LED();

    Place(designer, [clk, data, f, l1, l0]);
    Connect(clk, 0, f, 0);
    Connect(data, 0, f, 1);
    Connect(f, 0, l0, 0);
    Connect(f, 1, l1, 0);

    test("Initial State", () => {
        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(false);
    });
    test("Toggle the Data without the Clock", () => {
        data.activate(true);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);

        data.activate(false);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);
    });
    test("Latch to Off", () => {
        clk.activate(true);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);

        clk.activate(false);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);
    });
    test("Latch to On", () => {
        data.activate(true);
        clk.activate(true);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);

        clk.activate(false);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);
    });
    test("Change During Latch", () => {
        data.activate(false);
        clk.activate(true);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);

        clk.activate(false);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);
    });
});
