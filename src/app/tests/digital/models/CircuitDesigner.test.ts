import {GetHelpers} from "test/helpers/Helpers";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {Switch} from "digital/models/ioobjects/inputs/Switch";

import {LED} from "digital/models/ioobjects/outputs/LED";



describe("CircuitDesigner", () => {
    test("Empty Circuit", () => {
        const designer = new DigitalCircuitDesigner(0);

        expect(designer.getObjects()).toHaveLength(0);
        expect(designer.getWires()).toHaveLength(0);
    });

    describe("Add", () => {
        test("Add Object", () => {
            const designer = new DigitalCircuitDesigner(0);
            const { Place } = GetHelpers(designer);

            const [a, o] = Place(new Switch(), new LED());

            expect(designer.getObjects()).toHaveLength(2);

            expect(() => Place(a)).toThrow();
            expect(designer.getObjects()).toHaveLength(2);

            expect(() => Place(o)).toThrow();
            expect(designer.getObjects()).toHaveLength(2);
        });
        test("Add Objects", () => {
            const designer = new DigitalCircuitDesigner(0);
            const { Place } = GetHelpers(designer);

            const [a, o] = Place(new Switch(), new LED());

            expect(designer.getObjects()).toHaveLength(2);

            expect(() => Place(a)).toThrow();
            expect(designer.getObjects()).toHaveLength(2);

            expect(() => Place(o)).toThrow();
            expect(designer.getObjects()).toHaveLength(2);
        });
    });

    describe("Basic Circuit", () => {
        const designer = new DigitalCircuitDesigner(0);
        const { Place, Connect } = GetHelpers(designer);

        const [a, o] = Place(new Switch(), new LED());
        Connect(a,  o);

        test("Object Initialization", () => {
            const objects = designer.getObjects();
            expect(objects).toHaveLength(2);
            expect(objects[0]).toBe(a);
            expect(objects[1]).toBe(o);
        });

        test("Wire Initialization", () => {
            const wires = designer.getWires();
            expect(wires).toHaveLength(1);
            expect(wires[0].getInputComponent()).toBe(a);
            expect(wires[0].getOutputComponent()).toBe(o);
        });

        test("Initial State", () => {
            expect(o.isOn()).toBe(false);
        });

        test("Turn On", () => {
            a.activate(true);

            expect(o.isOn()).toBe(true);
        });
    });

    describe("Remove Object", () => {
        test("Add Remove No Connection", () => {
            const designer = new DigitalCircuitDesigner(0);
            const { Place, Remove } = GetHelpers(designer);

            const [a, o] = Place(new Switch(), new LED());

            expect(designer.getObjects()).toHaveLength(2);

            Remove(a, o);

            expect(designer.getObjects()).toHaveLength(0);

            expect(a.getDesigner()).toBeUndefined();
            expect(o.getDesigner()).toBeUndefined();

            expect(() => Remove(a)).toThrow();
            expect(() => Remove(o)).toThrow();
        });
        test("Add Remove Connected 1", () => {
            const designer = new DigitalCircuitDesigner(0);
            const { Place, Connect, Remove } = GetHelpers(designer);

            const [a, o] = Place(new Switch(), new LED());
            Connect(a,  o);

            expect(designer.getObjects()).toHaveLength(2);
            expect(designer.getWires()).toHaveLength(1);
            expect(a.getOutputs()).toHaveLength(1);
            expect(o.getInputs()).toHaveLength(1);

            Remove(a);

            expect(designer.getObjects()).toHaveLength(1);
            expect(designer.getWires()).toHaveLength(0);
            expect(a.getOutputs()).toHaveLength(0);
            expect(o.getInputs()).toHaveLength(0);

            expect(() => Remove(a)).toThrow();
        });
    });

    test("Reset Circuit", () => {
        const designer = new DigitalCircuitDesigner(0);
        const { Place, Connect } = GetHelpers(designer);

        const [a, o] = Place(new Switch(), new LED());
        Connect(a,  o);

        expect(designer.getObjects()).toHaveLength(2);
        expect(designer.getWires()).toHaveLength(1);

        designer.reset();

        expect(designer.getObjects()).toHaveLength(0);
        expect(designer.getWires()).toHaveLength(0);
    });
});
