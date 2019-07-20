import "jest";

import {CircuitDesigner} from "../../../../../../site/public/ts/models/CircuitDesigner";
import {Switch}          from "../../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {ANDGate}         from "../../../../../../site/public/ts/models/ioobjects/gates/ANDGate";
import {LED}             from "../../../../../../site/public/ts/models/ioobjects/outputs/LED";

describe("ANDGate", () => {
    describe("ANDGate", () => {
        const designer = new CircuitDesigner(0);
        const a = new Switch(), b = new Switch(), g = new ANDGate(), o = new LED();

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

    describe("NANDGate", () => {
        const designer = new CircuitDesigner(0);
        const a = new Switch(), b = new Switch(), g = new ANDGate(true), o = new LED();

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
    
    describe("Copy", () => {
        it("ANDGate Copy", () => {
            let a = new ANDGate();
            a.setInputPortCount(4);
            let b = <ANDGate>a.copy();
            
            expect(a).not.toBe(b);
            expect(b).toBeInstanceOf(ANDGate);
            expect(b.isNot()).toBe(false);
            expect(b.numOutputs()).toEqual(a.numOutputs());
            expect(b.numInputs()).toEqual(a.numInputs());
        });
        it("NANDGate Copy", () => {
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
