import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {ANDGate}         from "digital/models/ioobjects/gates/ANDGate";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {Place, Connect} from "test/helpers/Helpers";

describe("ANDGate", () => {
    describe("ANDGate", () => {
        const designer = new DigitalCircuitDesigner(0);
        const a = new Switch(), b = new Switch(), g = new ANDGate(), o = new LED();

        Place(designer, [a, b, g, o]);
        Connect(a, 0,  g, 0);
        Connect(b, 0,  g, 1);
        Connect(g, 0,  o, 0);

        test("Initial State", () => {
            expect(o.isOn()).toBe(false);
        });
        test("Input A and B Off", () => {
            a.activate(false);
            b.activate(false);

            expect(o.isOn()).toBe(false);
        });
        test("Input A On", () => {
            a.activate(true);
            b.activate(false);

            expect(o.isOn()).toBe(false);
        });
        test("Input B On", () => {
            a.activate(false);
            b.activate(true);

            expect(o.isOn()).toBe(false);
        });
        test("Input A and B On", () => {
            a.activate(true);
            b.activate(true);

            expect(o.isOn()).toBe(true);
        });
    });

    describe("NANDGate", () => {
        const designer = new DigitalCircuitDesigner(0);
        const a = new Switch(), b = new Switch(), g = new ANDGate(true), o = new LED();

        Place(designer, [a, b, g, o]);
        Connect(a, 0,  g, 0);
        Connect(b, 0,  g, 1);
        Connect(g, 0,  o, 0);

        test("Initial State", () => {
            expect(o.isOn()).toBe(true);
        });
        test("Input A and B Off", () => {
            a.activate(false);
            b.activate(false);

            expect(o.isOn()).toBe(true);
        });
        test("Input A On", () => {
            a.activate(true);
            b.activate(false);

            expect(o.isOn()).toBe(true);
        });
        test("Input B On", () => {
            a.activate(false);
            b.activate(true);

            expect(o.isOn()).toBe(true);
        });
        test("Input A and B On", () => {
            a.activate(true);
            b.activate(true);

            expect(o.isOn()).toBe(false);
        });
    });

    describe("Copy", () => {
        test("ANDGate Copy", () => {
            let a = new ANDGate();
            a.setInputPortCount(4);
            let b = <ANDGate>a.copy();

            expect(a).not.toBe(b);
            expect(b).toBeInstanceOf(ANDGate);
            expect(b.isNot()).toBe(false);
            expect(b.numOutputs()).toEqual(a.numOutputs());
            expect(b.numInputs()).toEqual(a.numInputs());
        });
        test("NANDGate Copy", () => {
            let a = new ANDGate(true);
            a.setInputPortCount(4);

            let b = <ANDGate>a.copy();

            expect(a).not.toBe(b);
            expect(b).toBeInstanceOf(ANDGate);
            expect(b.isNot()).toBe(true);
            expect(b.numOutputs()).toEqual(a.numOutputs());
            expect(b.numInputs()).toEqual(a.numInputs());
        });
    });
});
