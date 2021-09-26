import "jest";
import "test/helpers/Extensions";

import {SHIFT_KEY,
        DELETE_KEY,
        BACKSPACE_KEY,
        IO_PORT_LENGTH,
        COMMAND_KEY,
        A_KEY} from "core/utils/Constants";

import {V} from "Vector";

import {ANDGate, BUFGate,
        Multiplexer, Switch} from "digital/models/ioobjects";

import {Setup}      from "test/helpers/Setup";
import {GetHelpers} from "test/helpers/Helpers";
import {DigitalComponent} from "digital/models";


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
            const [gate] = Place(new ANDGate());

            input.click(V(0, 0));
            expect(selections.get().length).toBe(1);
            expect(selections.get()).toContain(gate);

            input.move(V(100, 0), 10)
                    .click();
            expect(selections.get().length).toBe(0);

            expect(history.getActions()).toHaveLength(2);
        });

        test("Drag to Select then Click to Deselect ANDGate", () => {
            const [gate] = Place(new ANDGate());

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
            const [gate] = Place(new ANDGate());

            input.tap(V(0, 0));
            expect(selections.get().length).toBe(1);
            expect(selections.get()).toContain(gate);

            input.tap(V(0, -100));
            expect(selections.get().length).toBe(0);

            expect(history.getActions()).toHaveLength(2);
        });
        test("Tap to Toggle Switch", () => {
            const [obj] = Place(new Switch());

            input.tap(V(0, 0));
            expect(selections.get().length).toBe(0);
            expect(obj.isOn()).toBe(true);

            input.tap(V(0, 0));
            expect(selections.get().length).toBe(0);
            expect(obj.isOn()).toBe(false);

            expect(history.getActions()).toHaveLength(0);
        });

        test("Drag with Finger to Select then Tap to Deselect ANDGate", () => {
            const [gate] = Place(new ANDGate());

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
            const [obj] = Place(new Switch());

            input.click(V(0, 0));
            expect(selections.get().length).toBe(0);
            expect(obj.isOn()).toBe(true);

            input.click(V(0, 0));
            expect(selections.get().length).toBe(0);
            expect(obj.isOn()).toBe(false);

            expect(history.getActions()).toHaveLength(0);
        });

        test("Click to Select Wire", () => {
            const [obj1, obj2] = Place(new Switch(), new BUFGate());
            obj2.setPos(V(200, 0));

            const wire = Connect(obj1, 0, obj2, 0).getWire();

            input.click(V(100, 0));
            expect(selections.get().length).toBe(1);
            expect(selections.get()).toContain(wire);

            expect(history.getActions()).toHaveLength(1);
        });

        test("Click to Select Straight Horizontal Wire", () => {
            const [obj1, obj2] = Place(new Switch(), new BUFGate());

            // Move obj1 s.t. the Port is on the origin
            obj1.setPos(V(-IO_PORT_LENGTH - obj1.getSize().x/2, 0));
            expect(obj1.getOutputPortPos(0)).toApproximatelyEqual(V(0, 0));

            obj2.setPos(V(200, 0));

            Connect(obj1, 0, obj2, 0).getWire().setIsStraight(true);

            input.click(V(20, 0));
            expect(selections.get().length).toBe(1);

            expect(history.getActions()).toHaveLength(1);
        });

        test("Click to Select Straight Vertical Wire", () => {
            const [obj1, obj2] = Place(new Switch(), new BUFGate());

            // Move obj1 s.t. the Port is on the origin
            obj1.setPos(V(-IO_PORT_LENGTH - obj1.getSize().x/2, 0));
            expect(obj1.getOutputPortPos(0)).toApproximatelyEqual(V(0, 0));

            // Move obj2 s.t. the Port is on the origin + 200 vertically
            obj2.setPos(V(IO_PORT_LENGTH + obj2.getSize().x/2, 200));
            expect(obj2.getInputPortPos(0)).toApproximatelyEqual(V(0, 200));

            Connect(obj1, 0, obj2, 0).getWire().setIsStraight(true);

            input.click(V(0, 20));
            expect(selections.get().length).toBe(1);

            expect(history.getActions()).toHaveLength(1);
        });

        test("Select then Delete ANDGate", () => {
            const [gate] = Place(new ANDGate());

            input.drag(V(-100, 100),
                       V(100, -100))
                    .pressKey(DELETE_KEY);
            expect(selections.get().length).toBe(0);
            expect(designer.getObjects().length).toBe(0);

            expect(history.getActions()).toHaveLength(2);
        });

        test("Select then Delete ANDGate w/ Backspace", () => {
            const [gate] = Place(new ANDGate());

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
            history.reset();
        });

        test("Click with Shift to Select Objects then Deselect", () => {
            const [obj1, obj2] = Place(new ANDGate(), new Multiplexer());
            obj1.setPos(V(100, 0));

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

        test("Select All Test", () => {
            input.pressKey(COMMAND_KEY)
                .pressKey(A_KEY)
                .releaseKey(A_KEY)
                .releaseKey(COMMAND_KEY);

            // When no objects, there should be no action made
            expect(history.getActions()).toHaveLength(0);

            // Create objects and select all
            const [obj1, obj2] = Place(new ANDGate(), new Multiplexer());

            input.pressKey(COMMAND_KEY)
                .pressKey(A_KEY)
                .releaseKey(A_KEY)
                .releaseKey(COMMAND_KEY);

            expect(selections.get()).toHaveLength(2);
            expect(selections.get()).toContain(obj1);
            expect(selections.get()).toContain(obj2);

            expect(history.getActions()).toHaveLength(1);

            // When everything is already selected, selecting-all again shouldn't create another action
            input.pressKey(COMMAND_KEY)
                .pressKey(A_KEY)
                .releaseKey(A_KEY)
                .releaseKey(COMMAND_KEY);

            expect(history.getActions()).toHaveLength(1);
        });

        // TODO: Add test for deleting multiple objects/wires
    });

});
