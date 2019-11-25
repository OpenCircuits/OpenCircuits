import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {ORGate}          from "digital/models/ioobjects/gates/ORGate";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {Place, Connect} from "test/helpers/Helpers";

describe("ORGate", () => {
    describe("ORGate", () => {
        const designer = new DigitalCircuitDesigner(0);
        const a = new Switch(), b = new Switch(), g = new ORGate(), o = new LED();

        Place(designer, [a, b, g, o]);
        Connect(a, 0,  g, 0);
        Connect(b, 0,  g, 1);
        Connect(g, 0,  o, 0);

        test("Initial State", () => {
            expect(o.isOn()).toBe(false);
        });
        test("Input A OR B Off", () => {
            a.activate(false);
            b.activate(false);

            expect(o.isOn()).toBe(false);
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
        test("Input A OR B On", () => {
            a.activate(true);
            b.activate(true);

            expect(o.isOn()).toBe(true);
        });
    });

    describe("NORGate", () => {
        const designer = new DigitalCircuitDesigner(0);
        const a = new Switch(), b = new Switch(), g = new ORGate(true), o = new LED();

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

            expect(o.isOn()).toBe(false);
        });
    });

    describe("Copy", () => {
        test("ORGate Copy", () => {
            let a = new ORGate();
            a.setInputPortCount(4);
            let b = <ORGate>a.copy();

            expect(a).not.toBe(b);
            expect(b).toBeInstanceOf(ORGate);
            expect(b.isNot()).toBe(false);
            expect(b.numOutputs()).toEqual(a.numOutputs());
            expect(b.numInputs()).toEqual(a.numInputs());
        });
        test("NORGate Copy", () => {
            let a = new ORGate(true);
            a.setInputPortCount(4);

            let b = <ORGate>a.copy();

            expect(a).not.toBe(b);
            expect(b).toBeInstanceOf(ORGate);
            expect(b.isNot()).toBe(true);
            expect(b.numOutputs()).toEqual(a.numOutputs());
            expect(b.numInputs()).toEqual(a.numInputs());
        });
    });
});
