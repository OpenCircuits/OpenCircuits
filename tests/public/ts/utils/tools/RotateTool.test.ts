import "jest";

import {LEFT_MOUSE_BUTTON,
        ROTATION_CIRCLE_RADIUS} from "../../../../../site/public/ts/utils/Constants";

import {V} from "../../../../../site/public/ts/utils/math/Vector";

import {CircuitDesigner} from "../../../../../site/public/ts/models/CircuitDesigner";
import {Camera} from "../../../../../site/public/ts/utils/Camera";
import {Input} from "../../../../../site/public/ts/utils/Input";
import {ToolManager} from "../../../../../site/public/ts/utils/tools/ToolManager";
import {RotateTool} from "../../../../../site/public/ts/utils/tools/RotateTool";
import {SelectionTool} from "../../../../../site/public/ts/utils/tools/SelectionTool";
import {ANDGate} from "../../../../../site/public/ts/models/ioobjects/gates/ANDGate";
import {ORGate} from "../../../../../site/public/ts/models/ioobjects/gates/ORGate";

import {FakeInput} from "../FakeInput";
import {InitializeInput} from "./Helpers";

describe("Rotate Tool", () => {
    const camera = new Camera(500, 500);
    const center = camera.getCenter();

    const designer = new CircuitDesigner(-1);
    const toolManager = new ToolManager(camera, designer);
    const input = new FakeInput();

    InitializeInput(input, toolManager);

    describe("Single Object", () => {
        const obj = new ANDGate();

        beforeAll(() => {
            // Add object
            designer.addObject(obj);
        });

        beforeEach(() => {
            // Reset gate rotation for each test
            obj.setAngle(0);
        });

        test("Rotate ANDGate 45° CCW from side", () => {
            input.click(center) // Select object
                    .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                    .press()
                    .move(V(0, +ROTATION_CIRCLE_RADIUS))
                    .release();
            expect(obj.getAngle()).toBeCloseTo(-Math.PI/4);
        });

        test("Rotate ANDGate 45° CW from top", () => {
            input.click(center) // Select object
                    .move(V(0, +ROTATION_CIRCLE_RADIUS))
                    .press()
                    .move(V(+ROTATION_CIRCLE_RADIUS, 0))
                    .release();
            expect(obj.getAngle()).toBeCloseTo(-Math.PI/4);
        });
    });

    describe("Multiple Objects", () => {
        const obj1 = new ANDGate();
        const obj2 = new ORGate();

        beforeAll(() => {
            // Clear previous circuit
            designer.reset();

            // Add objects
            designer.addObjects([obj1, obj2]);
        });

        beforeEach(() => {
            // Reset objects
            obj1.setPos(V(-20, 20));
            obj1.setAngle(0);
            obj2.setPos(V(20, 0));
            obj2.setAngle(0);
        });

        test("Rotate Objects 45° CW", () => {
            input.drag(center.add(V(-40, 40)),
                       center.add(V(40, -40))) // Select objects
                    .moveTo(center)
                    .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                    .press()
                    .move(V(0, +ROTATION_CIRCLE_RADIUS))
                    .release();
            expect(obj1.getAngle()).toBeCloseTo(-Math.PI/4);
            expect(obj2.getAngle()).toBeCloseTo(-Math.PI/4);
        })
    });
});
