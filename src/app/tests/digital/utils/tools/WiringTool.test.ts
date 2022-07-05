import {V} from "Vector";

import "test/helpers/Extensions";
import {GetHelpers} from "test/helpers/Helpers";
import {Setup}      from "test/helpers/Setup";

import {LED, Switch} from "digital/models/ioobjects";



describe("Wiring Tool", () => {
    const { designer, input } = Setup({ propagationTime: 0 });
    const { Place } = GetHelpers(designer);

    afterEach(() => {
        // Clear circuit
        designer.reset();
    });

    test("Click to Connect Switch -> LED", () => {
        const [sw, led] = Place(new Switch(), new LED());
        led.setPos(V(100, 0));

        input.click(sw.getOutputPort(0).getWorldTargetPos())
                .click(led.getInputPort(0).getWorldTargetPos());

        expect(sw).toBeConnectedTo(led);
    });

    test("Drag to Connect Switch -> LED", () => {
        const [sw, led] = Place(new Switch(), new LED());
        led.setPos(V(100, 0));

        input.drag(sw.getOutputPort(0).getWorldTargetPos(),
                   led.getInputPort(0).getWorldTargetPos());

        expect(sw).toBeConnectedTo(led);
    });

    test("Click to Connect LED -> Switch", () => {
        const [sw, led] = Place(new Switch(), new LED());
        led.setPos(V(100, 0));

        input.click(led.getInputPort(0).getWorldTargetPos())
                .click(sw.getOutputPort(0).getWorldTargetPos());

        expect(sw).toBeConnectedTo(led);
    });

    test("Drag to Connect LED -> Switch", () => {
        const [sw, led] = Place(new Switch(), new LED());
        led.setPos(V(100, 0));

        input.drag(led.getInputPort(0).getWorldTargetPos(),
                   sw.getOutputPort(0).getWorldTargetPos());

        expect(sw).toBeConnectedTo(led);
    });

    test("Connect Switch to Multiple LEDs", () => {
        const [sw, led1, led2] = Place(new Switch(), new LED(), new LED());
        led1.setPos(V(100, 200));
        led2.setPos(V(100, -200));

        input.drag(sw.getOutputPort(0).getWorldTargetPos(),
                   led1.getInputPort(0).getWorldTargetPos());
        input.drag(sw.getOutputPort(0).getWorldTargetPos(),
                   led2.getInputPort(0).getWorldTargetPos());

        expect(sw).toBeConnectedTo(led1);
        expect(sw).toBeConnectedTo(led2);
    });

    test("Try to Connect LED to Multiple Inputs", () => {
        const [sw1, sw2, led] = Place(new Switch(), new Switch(), new LED());
        sw1.setPos(V(-100, 50));
        sw2.setPos(V(-100, -50));

        input.drag(led.getInputPort(0).getWorldTargetPos(),
                   sw1.getOutputPort(0).getWorldTargetPos());
        input.click(led.getInputPort(0).getWorldTargetPos())
                .click(sw2.getOutputPort(0).getWorldTargetPos());

        expect(sw1).toBeConnectedTo(led);
        expect(sw2).not.toBeConnectedTo(led);
    });

});
