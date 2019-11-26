import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {BUFGate}         from "digital/models/ioobjects/gates/BUFGate";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {Place, Connect} from "test/helpers/Helpers";

describe("BUFGate", () => {
    describe("BUFGate", () => {
        const designer = new DigitalCircuitDesigner(0);
        const a = new Switch, o = new LED(), buf_gate = new BUFGate();

        Place(designer, [a, o, buf_gate]);
        Connect(a, 0, buf_gate, 0);
        Connect(buf_gate, 0, o, 0);

        test("Initial State", () => {
            expect(o.isOn()).toBe(false);
        });
        test("Input on", () => {
            a.activate(true);

            expect(o.isOn()).toBe(true);
        });
        test("Input off", () => {
            a.activate(false);

            expect(o.isOn()).toBe(false);
        });
    });

    describe("NOTGate", () => {
        const designer = new DigitalCircuitDesigner(0);
        const a = new Switch(), o = new LED(), not_gate = new BUFGate(true);

        Place(designer, [a, o, not_gate]);
        Connect(a, 0, not_gate, 0);
        Connect(not_gate, 0, o, 0);

        test("Initial State", () => {
            expect(o.isOn()).toBe(true);
        });
        test("Input on", () => {
            a.activate(true);

            expect(o.isOn()).toBe(false);
        });
        test("Input off", () => {
            a.activate(false);

            expect(o.isOn()).toBe(true);
        });
    });

    describe("Copy", () => {
        test("BUFGate Copy", () => {
            let a = new BUFGate();
            a.setInputPortCount(4);
            let b = <BUFGate>a.copy();

            expect(a).not.toBe(b);
            expect(b).toBeInstanceOf(BUFGate);
            expect(b.isNot()).toBe(false);
            expect(b.numOutputs()).toEqual(a.numOutputs());
            expect(b.numInputs()).toEqual(a.numInputs());
        });
        test("NOTGate Copy", () => {
            let a = new BUFGate(true);
            a.setInputPortCount(4);

            let b = <BUFGate>a.copy();

            expect(a).not.toBe(b);
            expect(b).toBeInstanceOf(BUFGate);
            expect(b.isNot()).toBe(true);
            expect(b.numOutputs()).toEqual(a.numOutputs());
            expect(b.numInputs()).toEqual(a.numInputs());
        });
    });
});
