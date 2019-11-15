import "jest";

import {V} from "Vector";

import {Camera} from "math/Camera";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {DigitalComponent} from "digital/models/DigitalComponent";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {FakeInput} from "../FakeInput";
import {InitializeInput, CreateDefaultToolManager} from "test/helpers/ToolHelpers";

import {Place} from "test/helpers/Helpers";

describe("Wiring Tool", () => {
    const camera = new Camera(500, 500);
    const designer = new DigitalCircuitDesigner(0);
    const toolManager = CreateDefaultToolManager(designer, camera);
    const input = new FakeInput(camera.getCenter());

    InitializeInput(input, toolManager);

    function expectToBeConnected(obj1: DigitalComponent, obj2: DigitalComponent): void {
        const connections = obj1.getOutputs().map((w) => w.getOutputComponent());
        expect(connections).toContain(obj2);
    }
    function expectNotToBeConnected(obj1: DigitalComponent, obj2: DigitalComponent): void {
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
        Place(designer, [sw, led]);

        input.click(sw.getOutputPort(0).getWorldTargetPos())
                .click(led.getInputPort(0).getWorldTargetPos());

        expectToBeConnected(sw, led);
    });

    test("Drag to Connect Switch -> LED", () => {
        const sw = new Switch();
        const led = new LED();
        led.setPos(V(100, 0));
        Place(designer, [sw, led]);

        input.drag(sw.getOutputPort(0).getWorldTargetPos(),
                   led.getInputPort(0).getWorldTargetPos());

        expectToBeConnected(sw, led);
    });

    test("Click to Connect LED -> Switch", () => {
        const sw = new Switch();
        const led = new LED();
        led.setPos(V(100, 0));
        Place(designer, [sw, led]);

        input.click(led.getInputPort(0).getWorldTargetPos())
                .click(sw.getOutputPort(0).getWorldTargetPos());

        expectToBeConnected(sw, led);
    });

    test("Drag to Connect LED -> Switch", () => {
        const sw = new Switch();
        const led = new LED();
        led.setPos(V(100, 0));
        Place(designer, [sw, led]);

        input.drag(led.getInputPort(0).getWorldTargetPos(),
                   sw.getOutputPort(0).getWorldTargetPos());

        expectToBeConnected(sw, led);
    });

    test("Connect Switch to Multiple LEDs", () => {
        const sw = new Switch();
        const led1 = new LED();
        const led2 = new LED();
        led1.setPos(V(100, 200));
        led2.setPos(V(100, -200));
        Place(designer, [sw, led1, led2]);

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
        Place(designer, [sw1, sw2, led]);

        input.drag(led.getInputPort(0).getWorldTargetPos(),
                   sw1.getOutputPort(0).getWorldTargetPos());
        input.click(led.getInputPort(0).getWorldTargetPos())
                .click(sw2.getOutputPort(0).getWorldTargetPos());

        expectToBeConnected(sw1, led);
        expectNotToBeConnected(sw2, led);
    });

});
