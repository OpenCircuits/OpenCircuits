import "jest";

import {CircuitDesigner} from "../../../../../../site/public/ts/models/CircuitDesigner";
import {Switch}          from "../../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {BUFGate}         from "../../../../../../site/public/ts/models/ioobjects/gates/BUFGate";
import {LED}             from "../../../../../../site/public/ts/models/ioobjects/outputs/LED";

describe("BUFGate", () => {
    describe("BUFGate", () => {
        const designer = new CircuitDesigner(0);
        const a = new Switch, o = new LED(), buf_gate = new BUFGate();

        designer.addObjects([a, o, buf_gate]);
        designer.connect(a, 0, buf_gate, 0);
        designer.connect(buf_gate, 0, o, 0);

        it("Initial State", () => {
            expect(o.isOn()).toBe(false);
        });
        it("Input B is on", () => {
            a.activate(true);

            expect(o.isOn()).toBe(true);
        });
        it("Input B is off", () => {
            a.activate(false);

            expect(o.isOn()).toBe(false);
        });
    });

    describe("NOTGate", () => {
        const designer = new CircuitDesigner(0);
        const a = new Switch(), o = new LED(), not_gate = new BUFGate(true);
        
        designer.addObjects([a, o, not_gate]);
        designer.connect(a, 0, not_gate, 0);
        designer.connect(not_gate, 0, o, 0);

        it("Initial State", () => {
            expect(o.isOn()).toBe(true);
        });
        it("Input A is on", () => {
            a.activate(true);

            expect(o.isOn()).toBe(false);
        });
        it("Input A is off", () => {
            a.activate(false);

            expect(o.isOn()).toBe(true);
        });
    });
});
