import "jest";

import {Vector,V}        from "../../../../refactor/public/js/utils/Math/Vector";
import {CircuitDesigner} from "../../../../refactor/public/js/models/CircuitDesigner";
import {Switch}          from "../../../../refactor/public/js/models/ioobjects/inputs/Switch";
import {ANDGate}         from "../../../../refactor/public/js/models/ioobjects/gates/ANDGate";
import {LED}             from "../../../../refactor/public/js/models/ioobjects/outputs/LED";

describe("CircuitDesigner", () => {
    describe("Empty Circuit", () => {
        var designer = new CircuitDesigner(0);

        expect(designer.getObjects().length).toBe(0);
        expect(designer.getWires().length).toBe(0);
    });
    describe("Add", () => {
        it("Add Object", () => {
            var designer = new CircuitDesigner(0);
            var a = new Switch(), o = new LED();

            designer.addObject(a);
            designer.addObject(o);

            expect(designer.getObjects().length).toBe(2);

            expect(() => designer.addObject(a)).toThrowError();
            expect(designer.getObjects().length).toBe(2);

            expect(() => designer.addObject(o)).toThrowError();
            expect(designer.getObjects().length).toBe(2);
        });
        it("Add Objects", () => {
            var designer = new CircuitDesigner(0);
            var a = new Switch(), o = new LED();

            designer.addObjects([a, o]);

            expect(designer.getObjects().length).toBe(2);

            expect(() => designer.addObject(a)).toThrowError();
            expect(designer.getObjects().length).toBe(2);

            expect(() => designer.addObject(o)).toThrowError();
            expect(designer.getObjects().length).toBe(2);
        });
    });
    describe("Basic Circuit", () => {
        var designer = new CircuitDesigner(0);
        var a = new Switch(), o = new LED();

        designer.addObjects([a, o]);
        designer.connect(a, 0,  o, 0);

        var objects = designer.getObjects();
        expect(objects.length).toBe(2);
        expect(objects[0]).toBe(a);
        expect(objects[1]).toBe(o);

        var wires = designer.getWires();
        expect(wires.length).toBe(1);
        expect(wires[0].getInputComponent()).toBe(a);
        expect(wires[0].getOutputComponent()).toBe(o);

        it("Initial State", () => {
            expect(o.isOn()).toBe(false);
        });

        it("Turn On", () => {
            a.activate(true);

            expect(o.isOn()).toBe(true);
        });
    });
    describe("Remove Object", () => {
        it("Add Remove No Connection", () => {
            var designer = new CircuitDesigner(0);
            var a = new Switch(), o = new LED();

            designer.addObjects([a, o]);

            expect(designer.getObjects().length).toBe(2);

            designer.removeObject(a);
            designer.removeObject(o);

            expect(designer.getObjects().length).toBe(0);

            expect(a.getDesigner()).toBe(undefined);
            expect(o.getDesigner()).toBe(undefined);

            expect(() => designer.removeObject(a)).toThrowError();
            expect(() => designer.removeObject(o)).toThrowError();
        });
        it("Add Remove Connected 1", () => {
            var designer = new CircuitDesigner(0);
            var a = new Switch(), o = new LED();

            designer.addObjects([a, o]);
            designer.connect(a, 0,  o, 0);

            expect(designer.getObjects().length).toBe(2);
            expect(designer.getWires().length).toBe(1);
            expect(a.getOutputs().length).toBe(1);
            expect(o.getInputs().length).toBe(1);

            designer.removeObject(a);

            expect(designer.getObjects().length).toBe(1);
            expect(designer.getWires().length).toBe(0);
            expect(a.getOutputs().length).toBe(0);
            expect(o.getInputs().length).toBe(0);

            expect(() => designer.removeObject(a)).toThrowError();
        });
    });
    describe("Reset Circuit", () => {
        var designer = new CircuitDesigner(0);
        var a = new Switch(), o = new LED();

        designer.addObjects([a, o]);
        designer.connect(a, 0,  o, 0);
    });
});
