import "jest";
import "test/helpers/Extensions";

import {SHIFT_KEY,
        DELETE_KEY,
        BACKSPACE_KEY,
        IO_PORT_LENGTH} from "core/utils/Constants";

import {V} from "Vector";

import {ANDGate, BUFGate,
        Multiplexer, Switch} from "digital/models/ioobjects";

import {Setup}      from "test/helpers/Setup";
import {GetHelpers} from "test/helpers/Helpers";


describe("Selection Tool", () => {
    const {designer, input, selections, history} = Setup();
    const {Place, Connect} = GetHelpers({designer});

    describe("Single Object", () => {
        afterEach(() => {
            // Clear previous circuit
            designer.reset();
            history.reset();
        });

        test("Clicking on nothing should NOT create an action", () => {
            input.click(V(0, 0));
            input.click(V(50, 0));
            input.click(V(0, 50));

            expect(history.getActions()).toHaveLength(0);
        });

        test("Click to Select then Deselect ANDGate", () => {
            const gate = new ANDGate();
            Place(gate);

            input.click(V(0, 0));
            expect(selections.get().length).toBe(1);
            expect(selections.get()).toContain(gate);

            input.move(V(100, 0), 10)
                    .click();
            expect(selections.get().length).toBe(0);

            expect(history.getActions()).toHaveLength(2);
        });

        test("Drag to Select then Click to Deselect ANDGate", () => {
            const gate = new ANDGate();
            Place(gate);

            input.drag(V(-100, 100),
                       V(100, -100));
            expect(selections.get().length).toBe(1);
            expect(selections.get()).toContain(gate);

            input.move(V(0, 100), 10)
                    .click();
            expect(selections.get().length).toBe(0);

            expect(history.getActions()).toHaveLength(2);
        });

        test("Tap to Select then Deselect ANDGate", () => {
            const gate = new ANDGate();
            Place(gate);

            input.tap(V(0, 0));
            expect(selections.get().length).toBe(1);
            expect(selections.get()).toContain(gate);

            input.tap(V(0, -100));
            expect(selections.get().length).toBe(0);

            expect(history.getActions()).toHaveLength(2);
        });
        test("Tap to Toggle Switch", () => {
            const obj = new Switch();
            Place(obj);

            input.tap(V(0, 0));
            expect(selections.get().length).toBe(0);
            expect(obj.isOn()).toBe(true);

            input.tap(V(0, 0));
            expect(selections.get().length).toBe(0);
            expect(obj.isOn()).toBe(false);

            expect(history.getActions()).toHaveLength(0);
        });

        test("Drag with Finger to Select then Tap to Deselect ANDGate", () => {
            const gate = new ANDGate();
            Place(gate);

            input.touch(V(-100, -100))
                    .moveTouches(V(200, 200), 5)
                    .releaseTouch();
            expect(selections.get().length).toBe(1);
            expect(selections.get()).toContain(gate);

            input.tap(V(-100, 0));
            expect(selections.get().length).toBe(0);

            expect(history.getActions()).toHaveLength(2);
        });

        test("Click to Toggle Switch", () => {
            const obj = new Switch();
            Place(obj);

            input.click(V(0, 0));
            expect(selections.get().length).toBe(0);
            expect(obj.isOn()).toBe(true);

            input.click(V(0, 0));
            expect(selections.get().length).toBe(0);
            expect(obj.isOn()).toBe(false);

            expect(history.getActions()).toHaveLength(0);
        });

        test("Click to Select Wire", () => {
            const obj1 = new Switch();
            const obj2 = new BUFGate();
            obj2.setPos(V(200, 0));

            Place(obj1, obj2);
            const wire = Connect(obj1, 0, obj2, 0).getWire();

            input.click(V(100, 0));
            expect(selections.get().length).toBe(1);
            expect(selections.get()).toContain(wire);

            expect(history.getActions()).toHaveLength(1);
        });

        test("Click to Select Straight Horizontal Wire", () => {
            const obj1 = new Switch();
            const obj2 = new BUFGate();

            // Move obj1 s.t. the Port is on the origin
            obj1.setPos(V(-IO_PORT_LENGTH - obj1.getSize().x/2, 0));
            expect(obj1.getOutputPortPos(0)).toApproximatelyEqual(V(0, 0));

            obj2.setPos(V(200, 0));

            Place(obj1, obj2);
            Connect(obj1, 0, obj2, 0).getWire().setIsStraight(true);

            input.click(V(20, 0));
            expect(selections.get().length).toBe(1);

            expect(history.getActions()).toHaveLength(1);
        });

        test("Click to Select Straight Vertical Wire", () => {
            const obj1 = new Switch();
            const obj2 = new BUFGate();

            // Move obj1 s.t. the Port is on the origin
            obj1.setPos(V(-IO_PORT_LENGTH - obj1.getSize().x/2, 0));
            expect(obj1.getOutputPortPos(0)).toApproximatelyEqual(V(0, 0));

            // Move obj2 s.t. the Port is on the origin + 200 vertically
            obj2.setPos(V(IO_PORT_LENGTH + obj2.getSize().x/2, 200));
            expect(obj2.getInputPortPos(0)).toApproximatelyEqual(V(0, 200));

            Place(obj1, obj2);
            Connect(obj1, 0, obj2, 0).getWire().setIsStraight(true);

            input.click(V(0, 20));
            expect(selections.get().length).toBe(1);

            expect(history.getActions()).toHaveLength(1);
        });

        test("Select then Delete ANDGate", () => {
            const gate = new ANDGate();
            Place(gate);

            input.drag(V(-100, 100),
                       V(100, -100))
                    .pressKey(DELETE_KEY);
            expect(selections.get().length).toBe(0);
            expect(designer.getObjects().length).toBe(0);

            expect(history.getActions()).toHaveLength(2);
        });

        test("Select then Delete ANDGate w/ Backspace", () => {
            const gate = new ANDGate();
            Place(gate);

            input.drag(V(-100, 100),
                       V(100, -100))
                    .pressKey(BACKSPACE_KEY);
            expect(selections.get().length).toBe(0);
            expect(designer.getObjects().length).toBe(0);

            expect(history.getActions()).toHaveLength(2);
        });

        // TODO: Add test for deleting wire
    });

    describe("Multiple Objects", () => {
        afterEach(() => {
            // Clear previous circuit
            designer.reset();
        });

        test("Click with Shift to Select Objects then Deselect", () => {
            const obj1 = new ANDGate();
            const obj2 = new Multiplexer();
            obj1.setPos(V(100, 0));
            Place(obj1, obj2);

            input.click(V(0, 0));
            input.pressKey(SHIFT_KEY);
            input.click(obj1.getPos());
            input.releaseKey(SHIFT_KEY);

            expect(selections.get().length).toBe(2);
            expect(selections.get()).toContain(obj1);
            expect(selections.get()).toContain(obj2);

            input.move(V(0, -100), 10)
                    .click();
            expect(selections.get().length).toBe(0);

            expect(history.getActions()).toHaveLength(3);
        });

        // TODO: Add test for deleting multiple objects/wires
    });

});
