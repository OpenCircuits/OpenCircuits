import "jest";

import {SPACEBAR_KEY} from "../../../../../site/public/ts/utils/Constants";

import {V} from "../../../../../site/public/ts/utils/math/Vector";

import {Camera} from "../../../../../site/public/ts/utils/Camera";
import {ToolManager} from "../../../../../site/public/ts/utils/tools/ToolManager";

import {CircuitDesigner} from "../../../../../site/public/ts/models/CircuitDesigner";
import {Switch} from "../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {Button} from "../../../../../site/public/ts/models/ioobjects/inputs/Button";
import {ANDGate} from "../../../../../site/public/ts/models/ioobjects/gates/ANDGate";
import {LED} from "../../../../../site/public/ts/models/ioobjects/outputs/LED";
import {WirePort} from "../../../../../site/public/ts/models/ioobjects/other/WirePort";

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

            input.drag(V(0, 0), V(100, 0));

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

        // TODO: Test with holding shift key
    });

    describe("Multiple Objects", () => {
        afterEach(() => {
            // Clear previous circuit
            designer.reset();
        });

        test("Move Switch + ANDGate", () => {
            const obj1 = new Switch();
            const obj2 = new ANDGate();
            obj1.setPos(V(100, 0));
            designer.addObjects([obj1, obj2]);

            // Select objects
            input.drag(V(-200, -200), V(200, 200));

            // Drag the objects
            input.drag(V(0, 0), V(100, 0));

            expect(obj1.getPos()).toEqual(V(200, 0));
            expect(obj2.getPos()).toEqual(V(100, 0));
        });

        test("Move Switch while ANDGate is Selected", () => {
            const sw = new Switch();
            const gate = new ANDGate();
            gate.setPos(V(100, 0));
            designer.addObjects([sw, gate]);

            // Select ANDGate
            input.click(gate.getPos());

            // Drag the Switch
            input.drag(V(0, 0), V(-100, 0));

            expect(sw.getPos()).toEqual(V(-100, 0));
            expect(gate.getPos()).toEqual(V(100, 0));
        });

        // TODO: Test with holding shift key
    });

    describe("Cloning", () => {
        afterEach(() => {
            // Clear previous circuit
            designer.reset();
        });

        test("Clone Switch -> LED with Snapped WirePort", () => {
            const sw   = new Switch();
            const led  = new LED();
            const port = new WirePort();

            // Set port to vertically align with Switch and horizontally with LED
            port.setPos(V(sw.getOutputPortPos(0).x, led.getInputPortPos(0).y));
            led.setPos(V(100, 0));

            designer.addObjects([sw, led, port]);

            // Connect to Port and set as straight
            designer.connect(sw,   0, port, 0).setIsStraight(true);
            designer.connect(port, 0, led,  0).setIsStraight(true);

            // Select all
            input.drag(V(-200, -200), V(200, 200));

            // Start Translating then Clone
            input.press(V(0, 0))
                    .moveTo(V(-100, 0))
                    .pressKey(SPACEBAR_KEY)
                    .releaseKey(SPACEBAR_KEY)
                    .moveTo(V(100, 0))
                    .release();

            // Expect initial objects to stay relatively the same
            expect(sw.getPos()).toEqual(V(100, 0));
            expect(led.getPos()).toEqual(V(200, 0));
            expect(port.getPos()).toEqual(V(sw.getOutputPortPos(0).x, led.getInputPortPos(0).y));
            expect(port.getInputs()[0].isStraight()).toBe(true);
            expect(port.getOutputs()[0].isStraight()).toBe(true);

            // Find duplicated objects
            const objs = designer.getObjects();
            expect(objs.length).toBe(6);

            objs.splice(objs.indexOf(sw), 1);
            objs.splice(objs.indexOf(led), 1);
            objs.splice(objs.indexOf(port), 1);
            expect(objs.length).toBe(3);

            const sw2 = objs.filter((o) => o instanceof Switch)[0] as Switch;
            const led2 = objs.filter((o) => o instanceof LED)[0] as LED;
            const port2 = objs.filter((o) => o instanceof WirePort)[0] as WirePort;

            // Expect duplicated objects to be the same
            expect(sw2.getPos()).toEqual(V(-100, 0));
            expect(led2.getPos()).toEqual(V(0, 0));
            expect(port2.getPos()).toEqual(V(sw2.getOutputPortPos(0).x, led2.getInputPortPos(0).y));
            expect(port2.getInputs()[0].isStraight()).toBe(true);
            expect(port2.getOutputs()[0].isStraight()).toBe(true);
        });

        // TODO: More cloning tests
    });
});
