import "jest";

import {CircuitDesigner} from "../../../../../../site/public/ts/models/CircuitDesigner";
import {Switch}          from "../../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {DLatch}          from "../../../../../../site/public/ts/models/ioobjects/latches/DLatch";
import {LED}             from "../../../../../../site/public/ts/models/ioobjects/outputs/LED";

describe("DLatch", () => {
    const designer = new CircuitDesigner(0);
    const clk = new Switch(), data = new Switch(), l = new DLatch(), l0 = new LED(), l1 = new LED();

    designer.addObjects([clk, data, l, l1, l0]);
    designer.connect(clk, 0,  l, 0);
    designer.connect(data, 0,  l, 1);
    designer.connect(l, 0,  l0, 0);
    designer.connect(l, 1,  l1, 0);

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
    it("Latch Off", () => {
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
    it("Latch in False State", () => {
        clk.activate(false);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);

        data.activate(true);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);
    });
    it("Latch in True State", () => {
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
