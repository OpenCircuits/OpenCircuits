import "jest";

import {CircuitDesigner} from "../../../../../../site/public/ts/models/CircuitDesigner";
import {Switch}          from "../../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {DLatch}          from "../../../../../../site/public/ts/models/ioobjects/latches/DLatch";
import {LED}             from "../../../../../../site/public/ts/models/ioobjects/outputs/LED";

describe("DFlipFLop", () => {
    const designer = new CircuitDesigner(0);
    const clk = new Switch(), data = new Switch(), f = new DFlipFlop(), l0 = new LED(), l1 = new LED();

    designer.addObjects([clk, data, f, l1, l0]);
    designer.connect(clk, 0,  f, 0);
    designer.connect(data, 0,  f, 1);
    designer.connect(f, 0,  l0, 0);
    designer.connect(f, 1,  l1, 0);

    it("Initial State", () => {
        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(false);
    });
    it("Toggle the Data without the Clock", () => {
        data.activate(true);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);

        data.activate(false);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);
    });
    it("Latch to Off", () => {
        clk.activate(true);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);

        clk.activate(false);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);
    });
    it("Latch to On", () => {
        data.activate(true);
        clk.activate(true);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);

        clk.activate(false);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);
    });
    it("Change During Latch", () => {
        data.activate(false);
        clk.activate(true);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);

        clk.activate(false);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);
    });
});
