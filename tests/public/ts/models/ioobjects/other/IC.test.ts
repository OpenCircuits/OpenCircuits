import "jest";

import {CircuitDesigner} from "../../../../../../site/public/ts/models/CircuitDesigner";
import {Switch}          from "../../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {BUFGate}         from "../../../../../../site/public/ts/models/ioobjects/gates/BUFGate";
import {ANDGate}         from "../../../../../../site/public/ts/models/ioobjects/gates/ANDGate";
import {LED}             from "../../../../../../site/public/ts/models/ioobjects/outputs/LED";

import {IC}     from "../../../../../../site/public/ts/models/ioobjects/other/IC";
import {ICData} from "../../../../../../site/public/ts/models/ioobjects/other/ICData";

describe("IC", () => {
    it("Basic IC", () => {
        const designer = new CircuitDesigner(0);
        const a = new Switch, o = new LED(), buf_gate = new BUFGate();

        designer.addObjects([a, o, buf_gate]);
        designer.connect(a, 0, buf_gate, 0);
        designer.connect(buf_gate, 0, o, 0);

        const icdata = ICData.Create([a, buf_gate, o]);
        let ic = new IC(icdata);

        expect(ic.numInputs()).toBe(1);
        expect(ic.numOutputs()).toBe(1);

        const a2 = new Switch(), o2 = new LED();
        designer.addObjects([a2, o2, ic]);
        designer.connect(a2, 0, ic, 0);
        designer.connect(ic, 0, o2, 0);

        expect(o2.isOn()).toBe(false);
        a2.activate(true);
        expect(o2.isOn()).toBe(true);
    });
    it("Basic IC 2", () => {
        const designer = new CircuitDesigner(0);
        const a = new Switch, b = new Switch, o = new LED(), and_gate = new ANDGate();

        designer.addObjects([a, b, o, and_gate]);
        designer.connect(a, 0, and_gate, 0);
        designer.connect(b, 0, and_gate, 1);
        designer.connect(and_gate, 0, o, 0);

        const icdata = ICData.Create([a, b, and_gate, o]);
        let ic = new IC(icdata);

        expect(ic.numInputs()).toBe(2);
        expect(ic.numOutputs()).toBe(1);

        const a2 = new Switch(), b2 = new Switch(), o2 = new LED();
        designer.addObjects([a2, b2, o2, ic]);
        designer.connect(a2, 0, ic, 0);
        designer.connect(b2, 0, ic, 1);
        designer.connect(ic, 0, o2, 0);

        expect(o2.isOn()).toBe(false);
        a2.activate(true);
        expect(o2.isOn()).toBe(false);
        a2.activate(false);
        b2.activate(true);
        expect(o2.isOn()).toBe(false);
        a2.activate(true);
        b2.activate(true);
        expect(o2.isOn()).toBe(true);
    });
});
