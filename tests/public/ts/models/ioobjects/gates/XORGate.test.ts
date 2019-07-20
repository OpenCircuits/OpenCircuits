import "jest";

import {CircuitDesigner} from "../../../../../../site/public/ts/models/CircuitDesigner";
import {Switch}          from "../../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {XORGate}         from "../../../../../../site/public/ts/models/ioobjects/gates/XORGate";
import {LED}             from "../../../../../../site/public/ts/models/ioobjects/outputs/LED";

describe("XORGate", () => {
    describe("XORGate", () => {
        const designer = new CircuitDesigner(0);
        const a = new Switch(), b = new Switch(), g = new XORGate(), o = new LED();

        designer.addObjects([a, b, g, o]);
        designer.connect(a, 0,  g, 0);
        designer.connect(b, 0,  g, 1);
        designer.connect(g, 0,  o, 0);

        it("Initial State", () => {
            expect(o.isOn()).toBe(false);
        });
        it("Input A and B Off", () => {
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
        it("Input A and B On", () => {
            a.activate(true);
            b.activate(true);

            expect(o.isOn()).toBe(false);
        });
    });
    describe("XNORGate", () => {
        const designer = new CircuitDesigner(0);
        const a = new Switch(), b = new Switch(), g = new XORGate(true), o = new LED();

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

            expect(o.isOn()).toBe(true);
        });
    });
    
    describe("Copy", () => {
        it("XORGate Copy", () => {
            let a = new XORGate();
            a.setInputPortCount(4);
            let b = <XORGate>a.copy();
            
            expect(a).not.toBe(b);
            expect(b).toBeInstanceOf(XORGate);
            expect(b.isNot()).toBe(false);
            expect(b.numOutputs()).toEqual(a.numOutputs());
            expect(b.numInputs()).toEqual(a.numInputs());
        });
        it("XNORGate Copy", () => {
            let a = new XORGate(true);
            a.setInputPortCount(4);
            
            let b = <XORGate>a.copy();
            
            expect(a).not.toBe(b);
            expect(b).toBeInstanceOf(XORGate);
            expect(b.isNot()).toBe(true);
            expect(b.numOutputs()).toEqual(a.numOutputs());
            expect(b.numInputs()).toEqual(a.numInputs());
        });
    });
});
