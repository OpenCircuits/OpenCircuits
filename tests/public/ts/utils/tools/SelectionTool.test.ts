import "jest";

import {SHIFT_KEY,
        DELETE_KEY,
        BACKSPACE_KEY} from "../../../../../site/public/ts/utils/Constants";

import {V} from "../../../../../site/public/ts/utils/math/Vector";

import {Camera} from "../../../../../site/public/ts/utils/Camera";
import {ToolManager} from "../../../../../site/public/ts/utils/tools/ToolManager";

import {CircuitDesigner} from "../../../../../site/public/ts/models/CircuitDesigner";
import {Selectable} from "../../../../../site/public/ts/utils/Selectable";
import {ANDGate} from "../../../../../site/public/ts/models/ioobjects/gates/ANDGate";
import {Multiplexer} from "../../../../../site/public/ts/models/ioobjects/other/Multiplexer";
import {Switch} from "../../../../../site/public/ts/models/ioobjects/inputs/Switch";

import {FakeInput} from "../FakeInput";
import {InitializeInput} from "./Helpers";

describe("Selection Tool", () => {
    const camera = new Camera(500, 500);
    const designer = new CircuitDesigner(0);
    const toolManager = new ToolManager(camera, designer);
    const input = new FakeInput(camera.getCenter());

    InitializeInput(input, toolManager);

    function selections(): Selectable[] {
        return toolManager.getSelectionTool().getSelections();
    }

    describe("Single Object", () => {
        afterEach(() => {
            // Clear previous circuit
            designer.reset();
        });

        test("Click to Select then Deselect ANDGate", () => {
            const gate = new ANDGate();
            designer.addObject(gate);

            input.click(V(0, 0));
            expect(selections().length).toBe(1);
            expect(selections()).toContain(gate);

            input.move(V(100, 0), 10)
                    .click();
            expect(selections().length).toBe(0);
        });

        test("Drag to Select then Click to Deselect ANDGate", () => {
            const gate = new ANDGate();
            designer.addObject(gate);

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
            designer.addObject(gate);

            input.tap(V(0, 0));
            expect(selections().length).toBe(1);
            expect(selections()).toContain(gate);

            input.tap(V(0, -100));
            expect(selections().length).toBe(0);
        });
        test("Tap to Toggle Switch", () => {
            const obj = new Switch();
            designer.addObject(obj);

            input.tap(V(0, 0));
            expect(selections().length).toBe(0);
            expect(obj.isOn()).toBe(true);

            input.tap(V(0, 0));
            expect(selections().length).toBe(0);
            expect(obj.isOn()).toBe(false);
        });

        test("Drag with Finger to Select then Tap to Deselect ANDGate", () => {
            const gate = new ANDGate();
            designer.addObject(gate);

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
            designer.addObject(obj);

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

            designer.addObjects([obj1, obj2]);
            const wire = designer.connect(obj1, 0,  obj2, 0);

            input.click(V(100, 0));
            expect(selections().length).toBe(1);
            expect(selections()).toContain(wire);
        });

        test("Select then Delete ANDGate", () => {
            const gate = new ANDGate();
            designer.addObject(gate);

            input.drag(V(-100, 100),
                       V(100, -100))
                    .pressKey(DELETE_KEY);
            expect(selections().length).toBe(0);
            expect(designer.getObjects().length).toBe(0);
        });

        test("Select then Delete ANDGate w/ Backspace", () => {
            const gate = new ANDGate();
            designer.addObject(gate);

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
            designer.addObjects([obj1, obj2]);

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
