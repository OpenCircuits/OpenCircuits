import "jest";
import "test/helpers/Extensions";

import {V} from "Vector";

import {Switch, LED,
        DigitalNode} from "digital/models/ioobjects";

import {Setup}      from "test/helpers/Setup";
import {GetHelpers} from "test/helpers/Helpers";


describe("Split Wire Tool", () => {
    const {camera, designer, input} = Setup();
    const {Place} = GetHelpers(designer);

    afterEach(() => {
        // Clear circuit
        designer.reset();
    });

    test("Connect Switch -> LED then Split and then Undo/Redo", () => {
        const [sw, led] = Place(new Switch(), new LED());
        sw.setPos(V(-60, 0));
        led.setPos(V(400, -100));


        // Connect Switch -> LED
        input.drag(sw.getOutputPort(0).getWorldTargetPos(),
                   led.getInputPort(0).getWorldTargetPos());

        // Split into Snap position
        const wire = sw.getOutputs()[0];
        input.press(wire.getShape().getPos(0.5))
                .move(V(20, 0))
                .release()
                .pressKey("Control")
                .pressKey("z")
                .releaseKey("z")
                .pressKey("z")
                .releaseKey("z");
    });

    test("Connect Switch -> LED then Split and Snap then Unsnap and move Down", () => {
        const [sw, led] = Place(new Switch(), new LED());
        sw.setPos(V(-60, 0));
        led.setPos(V(400, -100));

        // Connect Switch -> LED
        input.drag(sw.getOutputPort(0).getWorldTargetPos(),
                   led.getInputPort(0).getWorldTargetPos());


        // Split into Snap position
        const wire = sw.getOutputs()[0];
        input.press(wire.getShape().getPos(0.5))
                .moveTo(V(200, 0));

        const port = sw.getOutputs()[0].getOutputComponent();
        expect(port).toBeInstanceOf(DigitalNode);
        expect(port.getInputs()[0].isStraight()).toBe(true);
        expect(port.getOutputs()[0].isStraight()).toBe(true);
        expect(port.getPos()).toApproximatelyEqual(V(200, 0));

        // Move down
        input.move(V(0, 50))
                .release();

        expect(port.getInputs()[0].isStraight()).toBe(false);
        expect(port.getOutputs()[0].isStraight()).toBe(false);
        expect(port.getPos()).toApproximatelyEqual(V(200, 50));
    });

    test("Connect Switch -> LED then Split Twice into Snapped Rectangle", () => {
        const [sw, led] = Place(new Switch(), new LED());
        sw.setPos(V(-66, 0)); // 66 is from size of Switch (62)/2 + IO_PORT_LENGTH (35)
        led.setPos(V(400, -100));

        // Connect Switch -> LED
        input.drag(sw.getOutputPort(0).getWorldTargetPos(),
                   led.getInputPort(0).getWorldTargetPos());

        expect(led.getInputs()).toHaveLength(1);
        expect(sw.getOutputs()).toHaveLength(1);

        // Split twice
        input.press(sw.getOutputs()[0].getShape().getPos(0.5))
                .moveTo(V(0, 100))
                .release();
        input.press(led.getInputs()[0].getShape().getPos(0.5))
                .moveTo(V(400, 100))
                .release();

        const port1 = sw.getOutputs()[0].getOutputComponent();
        expect(port1).toBeInstanceOf(DigitalNode);
        expect(port1.getInputs()[0].isStraight()).toBe(true);
        expect(port1.getOutputs()[0].isStraight()).toBe(true);
        expect(port1.getPos()).toApproximatelyEqual(V(0, 100));

        const port2 = led.getInputs()[0].getInputComponent();
        expect(port2).toBeInstanceOf(DigitalNode);
        expect(port2.getInputs()[0].isStraight()).toBe(true);
        expect(port2.getOutputs()[0].isStraight()).toBe(true);
        expect(port2.getPos()).toApproximatelyEqual(V(400, 100))
    });
});
