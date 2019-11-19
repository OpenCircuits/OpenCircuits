import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {BUFGate}         from "digital/models/ioobjects/gates/BUFGate";
import {ANDGate}         from "digital/models/ioobjects/gates/ANDGate";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {IC}     from "digital/models/ioobjects/other/IC";
import {ICData} from "digital/models/ioobjects/other/ICData";

import {Place, Connect} from "test/helpers/Helpers";

describe("IC", () => {
    test("Basic IC", () => {
        const designer = new DigitalCircuitDesigner(0);
        const a = new Switch, o = new LED(), buf_gate = new BUFGate();

        Place(designer, [a, o, buf_gate]);
        Connect(a, 0, buf_gate, 0);
        Connect(buf_gate, 0, o, 0);

        const icdata = ICData.Create([a, buf_gate, o]);
        const ic = new IC(icdata);

        expect(ic.numInputs()).toBe(1);
        expect(ic.numOutputs()).toBe(1);

        const a2 = new Switch(), o2 = new LED();
        Place(designer, [a2, o2, ic]);
        Connect(a2, 0, ic, 0);
        Connect(ic, 0, o2, 0);

        expect(o2.isOn()).toBe(false);
        a2.activate(true);
        expect(o2.isOn()).toBe(true);
    });
    test("Basic IC 2", () => {
        const designer = new DigitalCircuitDesigner(0);
        const a = new Switch, b = new Switch, o = new LED(), and_gate = new ANDGate();

        Place(designer, [a, b, o, and_gate]);
        Connect(a, 0, and_gate, 0);
        Connect(b, 0, and_gate, 1);
        Connect(and_gate, 0, o, 0);

        const icdata = ICData.Create([a, b, and_gate, o]);
        let ic = new IC(icdata);

        expect(ic.numInputs()).toBe(2);
        expect(ic.numOutputs()).toBe(1);

        const a2 = new Switch(), b2 = new Switch(), o2 = new LED();
        Place(designer, [a2, b2, o2, ic]);
        Connect(a2, 0, ic, 0);
        Connect(b2, 0, ic, 1);
        Connect(ic, 0, o2, 0);

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
