import "jest";

import {V} from "../../../../../site/public/ts/utils/math/Vector";

import {Camera} from "../../../../../site/public/ts/utils/Camera";
import {ToolManager} from "../../../../../site/public/ts/utils/tools/ToolManager";

import {CircuitDesigner} from "../../../../../site/public/ts/models/CircuitDesigner";
import {Switch} from "../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {Button} from "../../../../../site/public/ts/models/ioobjects/inputs/Button";
import {ANDGate} from "../../../../../site/public/ts/models/ioobjects/gates/ANDGate";

import {FakeInput} from "../FakeInput";
import {InitializeInput} from "./Helpers";

describe("Translate Tool", () => {
    const camera = new Camera(500, 500);
    const designer = new CircuitDesigner(-1);
    const toolManager = new ToolManager(camera, designer);
    const input = new FakeInput(camera.getCenter());

    InitializeInput(input, toolManager);

    describe("Single Object", () => {
        afterEach(() => {
            // Clear previous circuit
            designer.reset();
        });

        test("Move mouse without dragging", () => {
            const obj = new Switch();
            designer.addObject(obj);

            input.moveTo(V(0, 0))
                    .move(V(20, 0));

            expect(obj.getPos()).toEqual(V(0, 0));
        });

        test("Click and Move mouse not on Switch", () => {
            const obj = new Switch();
            designer.addObject(obj);

            input.moveTo(V(0, 50))
                    .press()
                    .move(V(0, -100))
                    .release();

            expect(obj.getPos()).toEqual(V(0, 0));
        });

        test("Move Switch", () => {
            const obj = new Switch();
            designer.addObject(obj);

            input.moveTo(V(0, 0))
                    .press()
                    .move(V(100, 0))
                    .release();

            expect(obj.getPos()).toEqual(V(100, 0));
        });

        test("Move Button", () => {
            const obj = new Button();
            designer.addObject(obj);

            input.moveTo(V(0, 0))
                    .press()
                    .move(V(-100, 0))
                    .release();

            expect(obj.getPos()).toEqual(V(-100, 0));
        });

        test("Move ANDGate", () => {
            const obj = new ANDGate();
            designer.addObject(obj);

            input.moveTo(V(0, 0))
                    .press()
                    .move(V(0, 100))
                    .release();

            expect(obj.getPos()).toEqual(V(0, 100));
        });
    });



});
