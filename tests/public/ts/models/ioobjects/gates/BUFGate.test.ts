import "jest";

import {CircuitDesigner} from "../../../../../../site/public/ts/models/CircuitDesigner";
import {Switch}          from "../../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {BUFGate}         from "../../../../../../site/public/ts/models/ioobjects/gates/BUFGate";
import {LED}             from "../../../../../../site/public/ts/models/ioobjects/outputs/LED";

describe("BUFGate", () => {
    describe("BUFGate", () => {
        var designer = new CircuitDesigner(0);
        var a = new Switch(); var o1 = new LED(); var not_gate = new BUFGate(true);
        var b = new Switch;  var o2 = new LED(); var buf_gate = new BUFGate();

        designer.addObjects([a, o1, not_gate, b, o2, buf_gate]);
        designer.connect(a, 0, not_gate, 0);
        designer.connect(not_gate, 0, o1, 0);

        designer.connect(b, 0, buf_gate, 0);
        designer.connect(buf_gate, 0, o2, 0);

        it("Initial State", () => {
            expect(o1.isOn()).toBe(true);
            expect(o2.isOn()).toBe(false);
        });
        it("Input A is on", () => {
            a.activate(true);

            expect(o1.isOn()).toBe(false);
        });
        it("Input A is off", () => {
            a.activate(false);

            expect(o1.isOn()).toBe(true);
        });
        it("Input B is on", () => {
            b.activate(true);

            expect(o2.isOn()).toBe(true);
        });
        it("Input B is off", () => {
            b.activate(false);

            expect(o2.isOn()).toBe(false);
        });
    });
});
