import "jest";

import {CircuitDesigner} from "../../../../../../site/public/ts/models/CircuitDesigner";
import {Switch}          from "../../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {TFlipFlop}         from "../../../../../../site/public/ts/models/ioobjects/flipflops/TFlipFlop";
import {LED}             from "../../../../../../site/public/ts/models/ioobjects/outputs/LED";

describe("TFlipFLop", () => {
    const designer = new CircuitDesigner(0);
    const clk = new Switch(), tgl = new Switch(), f = new TFlipFlop(), l0 = new LED(), l1 = new LED();

    designer.addObjects([clk, tgl, f, l1, l0]);
    designer.connect(clk, 0,  f, 0);
    designer.connect(tgl, 0,  f, 1);
    designer.connect(f, 0,  l0, 0);
    designer.connect(f, 1,  l1, 0);

    it("Initial State", () => {
        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(false);
    });
    it("Turn On the Toggle", () => {
        clk.activate(false);
        tgl.activate(true);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);
    });
    it("Turn On the Clock, 1", () => {
        clk.activate(true);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);
    });
    it("Turn Off the Clock, 1", () => {
        clk.activate(false);

        expect(l1.isOn()).toBe(false);
        expect(l0.isOn()).toBe(true);
    });
    it("Turn On the Clock, 2", () => {
        clk.activate(true);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);
    });
    it("Turn Off the Clock, 2", () => {
        clk.activate(false);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);
    });
    it("Turn Off the Toggle", () => {
        tgl.activate(false);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);
    });
    it("Pulse the Clock with the Toggle Off", () => {
        clk.activate(true);
        clk.activate(false);

        expect(l1.isOn()).toBe(true);
        expect(l0.isOn()).toBe(false);
    });
    /*
     * I like TFlipFlops, so I am testing the getImageName function
     * for flipflops here because it should be tested and only needs
     * to be tested once ~NTP
     */
    it("Check Image Name", () => {
        expect(f.getImageName()).toBe("flipflop.svg");
    });
});
