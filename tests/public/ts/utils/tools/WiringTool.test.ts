import "jest";

import {V} from "../../../../../site/public/ts/utils/math/Vector";

import {Camera} from "../../../../../site/public/ts/utils/Camera";
import {ToolManager} from "../../../../../site/public/ts/utils/tools/ToolManager";

import {CircuitDesigner} from "../../../../../site/public/ts/models/CircuitDesigner";
import {Component} from "../../../../../site/public/ts/models/ioobjects/Component";
import {Switch} from "../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {LED} from "../../../../../site/public/ts/models/ioobjects/outputs/LED";

import {FakeInput} from "../FakeInput";
import {InitializeInput} from "./Helpers";

describe("Wiring Tool", () => {
    const camera = new Camera(500, 500);
    const designer = new CircuitDesigner(0);
    const toolManager = new ToolManager(camera, designer);
    const input = new FakeInput(camera.getCenter());

    InitializeInput(input, toolManager);

    function expectToBeConnected(obj1: Component, obj2: Component): void {
        const connections = obj1.getOutputs().map((w) => w.getOutputComponent());
        expect(connections).toContain(obj2);
    }
    function expectNotToBeConnected(obj1: Component, obj2: Component): void {
        const connections = obj1.getOutputs().map((w) => w.getOutputComponent());
        expect(connections).not.toContain(obj2);
    }

    afterEach(() => {
        // Clear circuit
        designer.reset();
    });

    test("Click to Connect Switch -> LED", () => {
        const sw = new Switch();
        const led = new LED();
        led.setPos(V(100, 0));
        designer.addObjects([sw, led]);

        input.click(sw.getOutputPort(0).getWorldTargetPos())
                .click(led.getInputPort(0).getWorldTargetPos());

        expectToBeConnected(sw, led);
    });

    test("Drag to Connect Switch -> LED", () => {
        const sw = new Switch();
        const led = new LED();
        led.setPos(V(100, 0));
        designer.addObjects([sw, led]);

        input.drag(sw.getOutputPort(0).getWorldTargetPos(),
                   led.getInputPort(0).getWorldTargetPos());

        expectToBeConnected(sw, led);
    });

    test("Click to Connect LED -> Switch", () => {
        const sw = new Switch();
        const led = new LED();
        led.setPos(V(100, 0));
        designer.addObjects([sw, led]);

        input.click(led.getInputPort(0).getWorldTargetPos())
                .click(sw.getOutputPort(0).getWorldTargetPos());

        expectToBeConnected(sw, led);
    });

    test("Drag to Connect LED -> Switch", () => {
        const sw = new Switch();
        const led = new LED();
        led.setPos(V(100, 0));
        designer.addObjects([sw, led]);

        input.drag(led.getInputPort(0).getWorldTargetPos(),
                   sw.getOutputPort(0).getWorldTargetPos());

        expectToBeConnected(sw, led);
    });

    test("Connect Switch to Multiple LEDs", () => {
        const sw = new Switch();
        const led1 = new LED();
        const led2 = new LED();
        led1.setPos(V(100, 50));
        led2.setPos(V(100, -50));
        designer.addObjects([sw, led1, led2]);

        input.drag(sw.getOutputPort(0).getWorldTargetPos(),
                   led1.getInputPort(0).getWorldTargetPos());
        input.drag(sw.getOutputPort(0).getWorldTargetPos(),
                   led2.getInputPort(0).getWorldTargetPos());

        expectToBeConnected(sw, led1);
        expectToBeConnected(sw, led2);
    });

    test("Try to Connect LED to Multiple Inputs", () => {
        const sw1 = new Switch();
        const sw2 = new Switch();
        const led = new LED();
        sw1.setPos(V(-100, 50));
        sw2.setPos(V(-100, -50));
        designer.addObjects([sw1, sw2, led]);

        input.drag(led.getInputPort(0).getWorldTargetPos(),
                   sw1.getOutputPort(0).getWorldTargetPos());
        input.click(led.getInputPort(0).getWorldTargetPos())
                .click(sw2.getOutputPort(0).getWorldTargetPos());

        expectToBeConnected(sw1, led);
        expectNotToBeConnected(sw2, led);
    });

});
