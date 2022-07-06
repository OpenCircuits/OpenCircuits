import {GetHelpers} from "test/helpers/Helpers";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {ANDGate} from "digital/models/ioobjects/gates/ANDGate";
import {BUFGate} from "digital/models/ioobjects/gates/BUFGate";

import {ConstantHigh} from "digital/models/ioobjects/inputs/ConstantHigh";
import {Switch}       from "digital/models/ioobjects/inputs/Switch";

import {IC}     from "digital/models/ioobjects/other/IC";
import {ICData} from "digital/models/ioobjects/other/ICData";

import {LED} from "digital/models/ioobjects/outputs/LED";




describe("IC", () => {
    test("Basic IC", () => {
        const designer = new DigitalCircuitDesigner(0);
        const { Place, Connect } = GetHelpers(designer);
        const a = new Switch, o = new LED(), bufGate = new BUFGate();

        Place(a, o, bufGate);
        Connect(a, bufGate);
        Connect(bufGate, o);

        const icdata = ICData.Create([a, bufGate, o]);
        const ic = new IC(icdata);

        expect(ic.numInputs()).toBe(1);
        expect(ic.numOutputs()).toBe(1);

        const a2 = new Switch(), o2 = new LED();
        Place(a2, o2, ic);
        Connect(a2, ic);
        Connect(ic, o2);

        expect(o2.isOn()).toBe(false);
        a2.activate(true);
        expect(o2.isOn()).toBe(true);
    });
    test("Basic IC 2", () => {
        const designer = new DigitalCircuitDesigner(0);
        const { Place, Connect } = GetHelpers(designer);
        const a = new Switch, b = new Switch, o = new LED(), andGate = new ANDGate();

        Place(a, b, o, andGate);
        Connect(a, andGate);
        Connect(b, andGate);
        Connect(andGate, o);

        const icdata = ICData.Create([a, b, andGate, o]);
        const ic = new IC(icdata);

        expect(ic.numInputs()).toBe(2);
        expect(ic.numOutputs()).toBe(1);

        const a2 = new Switch(), b2 = new Switch(), o2 = new LED();
        Place(a2, b2, o2, ic);
        Connect(a2, ic);
        Connect(b2, ic);
        Connect(ic, o2);

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
    test("Basic IC 3 - ON Switch -> LED (issue #468)", () => {
        const designer = new DigitalCircuitDesigner(0);
        const { Place, Connect } = GetHelpers(designer);
        const a = new Switch, o = new LED();

        Place(a, o);
        Connect(a, o);

        a.click(); // Turn on Switch initially

        const icdata = ICData.Create([a, o]);
        const ic = new IC(icdata);

        expect(ic.numInputs()).toBe(1);
        expect(ic.numOutputs()).toBe(1);

        const a2 = new Switch(), o2 = new LED();
        Place(a2, o2, ic);
        Connect(a2, ic);
        Connect(ic, o2);

        expect(o2.isOn()).toBe(false);
        a2.activate(true);
        expect(o2.isOn()).toBe(true);
        a2.activate(false);
        expect(o2.isOn()).toBe(false);
    });
    test("Basic IC 4 - Constant High -> LED (issue #468)", () => {
        const designer = new DigitalCircuitDesigner(0);
        const { Place, Connect } = GetHelpers(designer);
        const a = new ConstantHigh(), o = new LED();

        Place(a, o);
        Connect(a, o);

        const icdata = ICData.Create([a, o]);
        const ic = new IC(icdata);

        expect(ic.numInputs()).toBe(0);
        expect(ic.numOutputs()).toBe(1);

        const o2 = new LED();
        Place(o2, ic);
        Connect(ic, o2);

        expect(o2.isOn()).toBe(true);
    });
});
