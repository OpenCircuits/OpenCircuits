import {MIDDLE_MOUSE_BUTTON, RIGHT_MOUSE_BUTTON} from "core/utils/Constants";

import {V} from "Vector";

import "test/helpers/Extensions";
import {GetHelpers} from "test/helpers/Helpers";
import {Setup}      from "test/helpers/Setup";

import {DigitalNode, LED, Switch} from "digital/models/ioobjects";


describe("Node and Wire Interaction", () => {
    const { designer, input } = Setup();
    const { Place } = GetHelpers(designer);

    afterEach(() => {
        // Clear circuit
        designer.reset();
    });

    test("Drag to Connect Switch -> LED with Right Mouse", () => {
        const [sw, led] = Place(new Switch(), new LED());
        led.setPos(V(100, 0));

        input.drag(sw.getOutputPort(0).getWorldTargetPos(),
                   led.getInputPort(0).getWorldTargetPos(), RIGHT_MOUSE_BUTTON);

        expect(sw).not.toBeConnectedTo(led);
    });

    test("Connect Switch -> LED then Split Twice into Snapped Rectangle With Right Mouse Button", () => {
        const [sw, led] = Place(new Switch(), new LED());
        sw.setPos(V(-66, 0)); // 66 is from size of Switch (62)/2 + IO_PORT_LENGTH (35)
        led.setPos(V(400, -100));

        // Connect Switch -> LED
        input.drag(sw.getOutputPort(0).getWorldTargetPos(),
                   led.getInputPort(0).getWorldTargetPos());

        expect(led.getInputs()).toHaveLength(1);
        expect(sw.getOutputs()).toHaveLength(1);

        // Split twice
        input.press(sw.getOutputs()[0].getShape().getPos(0.5), RIGHT_MOUSE_BUTTON)
                .moveTo(V(0, 100))
                .release();
        input.press(led.getInputs()[0].getShape().getPos(0.5), RIGHT_MOUSE_BUTTON)
                .moveTo(V(400, 100))
                .release();

        const port1 = sw.getOutputs()[0].getOutputComponent();
        expect(port1).not.toBeInstanceOf(DigitalNode);

        const port2 = led.getInputs()[0].getInputComponent();
        expect(port2).not.toBeInstanceOf(DigitalNode);
    });



    test("Connect Switch -> LED then Split Twice into Snapped Rectangle With Middle Mouse Button", () => {
        const [sw, led] = Place(new Switch(), new LED());
        sw.setPos(V(-66, 0)); // 66 is from size of Switch (62)/2 + IO_PORT_LENGTH (35)
        led.setPos(V(400, -100));

        // Connect Switch -> LED
        input.drag(sw.getOutputPort(0).getWorldTargetPos(),
        led.getInputPort(0).getWorldTargetPos());

        expect(led.getInputs()).toHaveLength(1);
        expect(sw.getOutputs()).toHaveLength(1);

        // Split twice
        input.press(sw.getOutputs()[0].getShape().getPos(0.5), MIDDLE_MOUSE_BUTTON)
        .moveTo(V(0, 100))
        .release();
        input.press(led.getInputs()[0].getShape().getPos(0.5), MIDDLE_MOUSE_BUTTON)
        .moveTo(V(400, 100))
        .release();

        const port1 = sw.getOutputs()[0].getOutputComponent();
        expect(port1).not.toBeInstanceOf(DigitalNode);

        const port2 = led.getInputs()[0].getInputComponent();
        expect(port2).not.toBeInstanceOf(DigitalNode);
    });

    test("Drag to Connect Switch -> LED with Middle Mouse", () => {
        const [sw, led] = Place(new Switch(), new LED());
        led.setPos(V(100, 0));

        input.drag(sw.getOutputPort(0).getWorldTargetPos(),
                   led.getInputPort(0).getWorldTargetPos(), MIDDLE_MOUSE_BUTTON);

        expect(sw).not.toBeConnectedTo(led);
    });
});
