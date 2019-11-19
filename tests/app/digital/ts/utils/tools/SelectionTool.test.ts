import "jest";

import {SHIFT_KEY,
        DELETE_KEY,
        BACKSPACE_KEY} from "core/utils/Constants";

import {V} from "Vector";

import {Camera} from "math/Camera";

import {Selectable} from "core/utils/Selectable";

import {SelectionTool} from "core/tools/SelectionTool";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {ANDGate}         from "digital/models/ioobjects/gates/ANDGate";
import {Multiplexer}     from "digital/models/ioobjects/other/Multiplexer";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";

import {FakeInput} from "../FakeInput";
import {InitializeInput, CreateDefaultToolManager} from "test/helpers/ToolHelpers";

import {Place, Connect} from "test/helpers/Helpers";

describe("Selection Tool", () => {
    const camera = new Camera(500, 500);
    const designer = new DigitalCircuitDesigner(0);
    const toolManager = CreateDefaultToolManager(designer, camera);
    const input = new FakeInput(camera.getCenter());

    const selectionTool = toolManager.getDefaultTool() as SelectionTool;

    InitializeInput(input, toolManager);

    function selections(): Selectable[] {
        return selectionTool.getSelections();
    }

    describe("Single Object", () => {
        afterEach(() => {
            // Clear previous circuit
            designer.reset();
        });

        test("Click to Select then Deselect ANDGate", () => {
            const gate = new ANDGate();
            Place(designer, [gate]);

            input.click(V(0, 0));
            expect(selections().length).toBe(1);
            expect(selections()).toContain(gate);

            input.move(V(100, 0), 10)
                    .click();
            expect(selections().length).toBe(0);
        });

        test("Drag to Select then Click to Deselect ANDGate", () => {
            const gate = new ANDGate();
            Place(designer, [gate]);

            input.drag(V(-100, 100),
                       V(100, -100));
            expect(selections().length).toBe(1);
            expect(selections()).toContain(gate);

            input.move(V(0, 100), 10)
                    .click();
            expect(selections().length).toBe(0);
        });

        test("Tap to Select then Deselect ANDGate", () => {
            const gate = new ANDGate();
            Place(designer, [gate]);

            input.tap(V(0, 0));
            expect(selections().length).toBe(1);
            expect(selections()).toContain(gate);

            input.tap(V(0, -100));
            expect(selections().length).toBe(0);
        });
        test("Tap to Toggle Switch", () => {
            const obj = new Switch();
            Place(designer, [obj]);

            input.tap(V(0, 0));
            expect(selections().length).toBe(0);
            expect(obj.isOn()).toBe(true);

            input.tap(V(0, 0));
            expect(selections().length).toBe(0);
            expect(obj.isOn()).toBe(false);
        });

        test("Drag with Finger to Select then Tap to Deselect ANDGate", () => {
            const gate = new ANDGate();
            Place(designer, [gate]);

            input.touch(V(-100, -100))
                    .moveTouches(V(200, 200), 5)
                    .releaseTouch();
            expect(selections().length).toBe(1);
            expect(selections()).toContain(gate);

            input.tap(V(-100, 0));
            expect(selections().length).toBe(0);
        });

        test("Click to Toggle Switch", () => {
            const obj = new Switch();
            Place(designer, [obj]);

            input.click(V(0, 0));
            expect(selections().length).toBe(0);
            expect(obj.isOn()).toBe(true);

            input.click(V(0, 0));
            expect(selections().length).toBe(0);
            expect(obj.isOn()).toBe(false);
        });

        test("Click to Select Wire", () => {
            const obj1 = new Switch();
            const obj2 = new ANDGate();
            obj2.setPos(V(200, -12.5));

            Place(designer, [obj1, obj2]);
            const wire = Connect(obj1, 0, obj2, 0).getWire();

            input.click(V(100, 0));
            expect(selections().length).toBe(1);
            expect(selections()).toContain(wire);
        });

        test("Select then Delete ANDGate", () => {
            const gate = new ANDGate();
            Place(designer, [gate]);

            input.drag(V(-100, 100),
                       V(100, -100))
                    .pressKey(DELETE_KEY);
            expect(selections().length).toBe(0);
            expect(designer.getObjects().length).toBe(0);
        });

        test("Select then Delete ANDGate w/ Backspace", () => {
            const gate = new ANDGate();
            Place(designer, [gate]);

            input.drag(V(-100, 100),
                       V(100, -100))
                    .pressKey(BACKSPACE_KEY);
            expect(selections().length).toBe(0);
            expect(designer.getObjects().length).toBe(0);
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
            Place(designer, [obj1, obj2]);

            input.click(V(0, 0));
            input.pressKey(SHIFT_KEY);
            input.click(obj1.getPos());
            input.releaseKey(SHIFT_KEY);

            expect(selections().length).toBe(2);
            expect(selections()).toContain(obj1);
            expect(selections()).toContain(obj2);

            input.move(V(0, -100), 10)
                    .click();
            expect(selections().length).toBe(0);
        });

        // TODO: Add test for deleting multiple objects/wires
    });

});
