import "jest";

import {CircuitDesigner} from "../../../../../../site/public/ts/models/CircuitDesigner";
import {Switch}          from "../../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {ORGate}          from "../../../../../../site/public/ts/models/ioobjects/gates/ORGate";
import {LED}             from "../../../../../../site/public/ts/models/ioobjects/outputs/LED";

describe("ORGate", () => {
    describe("ORGate", () => {
        var designer = new CircuitDesigner(0);
        var a = new Switch(), b = new Switch(), g = new ORGate(), o = new LED();

        designer.addObjects([a, b, g, o]);
        designer.connect(a, 0,  g, 0);
        designer.connect(b, 0,  g, 1);
        designer.connect(g, 0,  o, 0);

        it("Initial State", () => {
            expect(o.isOn()).toBe(false);
        });
        it("Input A OR B Off", () => {
            a.activate(false);
            b.activate(false);

            expect(o.isOn()).toBe(false);
        });
        it("Input A On", () => {
            a.activate(true);
            b.activate(false);

            expect(o.isOn()).toBe(true);
        });
        it("Input B On", () => {
            a.activate(false);
            b.activate(true);

            expect(o.isOn()).toBe(true);
        });
        it("Input A OR B On", () => {
            a.activate(true);
            b.activate(true);

            expect(o.isOn()).toBe(true);
        });
    });

    describe("NORGate", () => {
        var designer = new CircuitDesigner(0);
        var a = new Switch(), b = new Switch(), g = new ORGate(true), o = new LED();

        designer.addObjects([a, b, g, o]);
        designer.connect(a, 0,  g, 0);
        designer.connect(b, 0,  g, 1);
        designer.connect(g, 0,  o, 0);

        it("Initial State", () => {
            expect(o.isOn()).toBe(true);
        });
        it("Input A and B Off", () => {
            a.activate(false);
            b.activate(false);

            expect(o.isOn()).toBe(true);
        });
        it("Input A On", () => {
            a.activate(true);
            b.activate(false);

            expect(o.isOn()).toBe(false);
        });
        it("Input B On", () => {
            a.activate(false);
            b.activate(true);

            expect(o.isOn()).toBe(false);
        });
        it("Input A and B On", () => {
            a.activate(true);
            b.activate(true);

            expect(o.isOn()).toBe(false);
        });
    });
});
