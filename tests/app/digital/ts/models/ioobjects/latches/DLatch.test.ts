import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {DLatch}          from "digital/models/ioobjects/latches/DLatch";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {Place, Connect} from "test/helpers/Helpers";

describe("DLatch", () => {
    const designer = new DigitalCircuitDesigner(0);
    const clk = new Switch(), data = new Switch(), l = new DLatch(), l0 = new LED(), l1 = new LED();

    Place(designer, [clk, data, l, l1, l0]);
    Connect(clk, 0,  l, 0);
    Connect(data, 0,  l, 1);
    Connect(l, 0,  l0, 0);
    Connect(l, 1,  l1, 0);

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
    test("Latch Off", () => {
        clk.activate(true);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);

        data.activate(true);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);

        data.activate(false);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);
    });
    test("Latch in False State", () => {
        clk.activate(false);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);

        data.activate(true);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);
    });
    test("Latch in True State", () => {
        clk.activate(true);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);

        clk.activate(false);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);

        data.activate(false);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);
    });
});
