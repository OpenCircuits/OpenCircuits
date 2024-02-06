import {IO_PORT_LENGTH} from "core/utils/Constants";

import {V} from "Vector";

import "test/helpers/Extensions";
import {GetHelpers} from "test/helpers/Helpers";
import {Setup}      from "test/helpers/Setup";

import {DeselectAll} from "core/actions/units/Select";

import {ANDGate, BUFGate,
        DigitalNode,
        LED,
        Multiplexer, Switch} from "digital/models/ioobjects";


describe("Selection Tool", () => {
    const { designer, input, selections, history } = Setup();
    const { Place, Connect } = GetHelpers(designer);

    const reset = () => {
        // Clear previous circuit
        designer.reset();
        history.reset();
        DeselectAll(selections);
    }

    describe("Single Object", () => {
        afterEach(reset);

        test("Clicking on nothing should NOT create an action", () => {
            input.click(V(0, 0));
            input.click(V(1, 0));
            input.click(V(0, 1));

            expect(history.getActions()).toHaveLength(0);
        });

        test("Click to Select then Deselect ANDGate", () => {
            const [gate] = Place(new ANDGate());

            input.click(V(0, 0));
            expect(selections.get()).toHaveLength(1);
            expect(selections.get()).toContain(gate);

            input.move(V(2, 0), 10)
                    .click();
            expect(selections.get()).toHaveLength(0);

            expect(history.getActions()).toHaveLength(2);
        });

        test("Drag to Select then Click to Deselect ANDGate", () => {
            const [gate] = Place(new ANDGate());

            input.drag(V(-2, 2),
                       V(2, -2));
            expect(selections.get()).toHaveLength(1);
            expect(selections.get()).toContain(gate);

            input.move(V(0, 2), 10)
                    .click();
            expect(selections.get()).toHaveLength(0);

            expect(history.getActions()).toHaveLength(2);
        });

        test("Tap to Select then Deselect ANDGate", () => {
            const [gate] = Place(new ANDGate());

            input.tap(V(0, 0));
            expect(selections.get()).toHaveLength(1);
            expect(selections.get()).toContain(gate);

            input.tap(V(0, -2));
            expect(selections.get()).toHaveLength(0);

            expect(history.getActions()).toHaveLength(2);
        });
        test("Tap to Toggle Switch", () => {
            const [obj] = Place(new Switch());

            input.tap(V(0, 0));
            expect(selections.get()).toHaveLength(0);
            expect(obj.isOn()).toBe(true);

            input.tap(V(0, 0));
            expect(selections.get()).toHaveLength(0);
            expect(obj.isOn()).toBe(false);

            expect(history.getActions()).toHaveLength(0);
        });

        test("Drag with Finger to Select then Tap to Deselect ANDGate", () => {
            const [gate] = Place(new ANDGate());

            input.touch(V(-2, -2))
                    .moveTouches(V(4, 4), 5)
                    .releaseTouch();
            expect(selections.get()).toHaveLength(1);
            expect(selections.get()).toContain(gate);

            input.tap(V(-2, 0));
            expect(selections.get()).toHaveLength(0);

            expect(history.getActions()).toHaveLength(2);
        });

        test("Click to Toggle Switch", () => {
            const [obj] = Place(new Switch());

            input.click(V(0, 0));
            expect(selections.get()).toHaveLength(0);
            expect(obj.isOn()).toBe(true);

            input.click(V(0, 0));
            expect(selections.get()).toHaveLength(0);
            expect(obj.isOn()).toBe(false);

            expect(history.getActions()).toHaveLength(0);
        });

        test("Click to Select Wire", () => {
            const [obj1, obj2] = Place(new Switch(), new BUFGate());
            obj2.setPos(V(4, 0));

            const wire = Connect(obj1, obj2)[0].getWire();

            input.click(V(2, 0));
            expect(selections.get()).toHaveLength(1);
            expect(selections.get()).toContain(wire);

            expect(history.getActions()).toHaveLength(1);
        });

        test("Click to Select Straight Horizontal Wire", () => {
            const [obj1, obj2] = Place(new Switch(), new BUFGate());

            // Move obj1 s.t. the Port is on the origin
            obj1.setPos(V(-IO_PORT_LENGTH - obj1.getSize().x/2, 0));
            expect(obj1.getOutputPortPos(0)).toApproximatelyEqual(V(0, 0));

            obj2.setPos(V(4, 0));

            Connect(obj1, obj2)[0].getWire().setIsStraight(true);

            input.click(V(0.4, 0));
            expect(selections.get()).toHaveLength(1);

            expect(history.getActions()).toHaveLength(1);
        });

        test("Click to Select Straight Vertical Wire", () => {
            const [obj1, obj2] = Place(new Switch(), new BUFGate());

            // Move obj1 s.t. the Port is on the origin
            obj1.setPos(V(-IO_PORT_LENGTH - obj1.getSize().x/2, 0));
            expect(obj1.getOutputPortPos(0)).toApproximatelyEqual(V(0, 0));

            // Move obj2 s.t. the Port is on the origin + 4 vertically
            obj2.setPos(V(IO_PORT_LENGTH + obj2.getSize().x/2, 4));
            expect(obj2.getInputPortPos(0)).toApproximatelyEqual(V(0, 4));

            Connect(obj1, obj2)[0].getWire().setIsStraight(true);

            input.click(V(0, 0.4));
            expect(selections.get()).toHaveLength(1);

            expect(history.getActions()).toHaveLength(1);
        });

        test("Select then Delete ANDGate", () => {
            Place(new ANDGate());

            input.drag(V(-2, 2),
                       V(2, -2))
                    .pressKey("Delete");
            expect(selections.get()).toHaveLength(0);
            expect(designer.getObjects()).toHaveLength(0);

            expect(history.getActions()).toHaveLength(2);
        });

        test("Select then Delete ANDGate w/ Backspace", () => {
            Place(new ANDGate());

            input.drag(V(-2, 2),
                       V(2, -2))
                    .pressKey("Backspace");
            expect(selections.get()).toHaveLength(0);
            expect(designer.getObjects()).toHaveLength(0);

            expect(history.getActions()).toHaveLength(2);
        });

        test("Select then Delete Wire", () => {
            const [obj1, obj2] = Place(new Switch(), new BUFGate());
            obj2.setPos(V(4, 0));

            const wire = Connect(obj1, obj2)[0].getWire();
            expect(designer.getWires()).toHaveLength(1);

            expect(selections.get()).toHaveLength(0);

            input.click(V(2, 0));
            expect(selections.get()).toHaveLength(1);
            expect(selections.get()).toContain(wire);
            expect(history.getActions()).toHaveLength(1);

            input.pressKey("Backspace");
            expect(history.getActions()).toHaveLength(2);

            expect(selections.get()).toHaveLength(0);
            expect(designer.getWires()).toHaveLength(0);
        });
    });

    describe("Multiple Objects", () => {
        afterEach(reset);

        test("Click with Shift to Select Objects then Deselect", () => {
            const [obj1, obj2] = Place(new ANDGate(), new Multiplexer());
            obj1.setPos(V(2, 0));

            input.click(V(0, 0));
            input.pressKey("Shift");
            input.click(obj1.getPos());
            input.releaseKey("Shift");

            expect(selections.get()).toHaveLength(2);
            expect(selections.get()).toContain(obj1);
            expect(selections.get()).toContain(obj2);

            input.move(V(0, -2), 10)
                    .click();
            expect(selections.get()).toHaveLength(0);

            expect(history.getActions()).toHaveLength(3);
        });

        test("Select All Test", () => {
            input.pressKey("Meta")
                .pressKey("a")
                .releaseKey("a")
                .releaseKey("Meta");

            // When no objects, there should be no action made
            expect(history.getActions()).toHaveLength(0);

            // Create objects and select all
            const [obj1, obj2] = Place(new ANDGate(), new Multiplexer());

            input.pressKey("Meta")
                .pressKey("a")
                .releaseKey("a")
                .releaseKey("Meta");

            expect(selections.get()).toHaveLength(2);
            expect(selections.get()).toContain(obj1);
            expect(selections.get()).toContain(obj2);

            expect(history.getActions()).toHaveLength(1);

            // When everything is already selected, selecting-all again shouldn't create another action
            input.pressKey("Meta")
                .pressKey("a")
                .releaseKey("a")
                .releaseKey("Meta");

            expect(history.getActions()).toHaveLength(1);
        });

        test("Click with Shift to Select Objects then Delete", () => {
            const [obj1, obj2] = Place(new ANDGate(), new BUFGate());
            obj2.setPos(V(4, 0));
            obj1.setPos(V(0, 0));

            const wire = Connect(obj1, obj2)[0].getWire();
            expect(designer.getWires()).toHaveLength(1);

            expect(selections.get()).toHaveLength(0);

            // Select all objects with shift and click
            input.pressKey("Shift");
            input.click(obj1.getPos());
            expect(selections.get()).toHaveLength(1);

            input.click(obj2.getPos());
            expect(selections.get()).toHaveLength(2);

            input.click(V(2, 0));
            input.releaseKey("Shift");
            expect(selections.get()).toHaveLength(3);
            expect(selections.get()).toContain(wire);

            // When everything is deleted, no objects should be selected
            input.pressKey("Backspace");
            expect(selections.get()).toHaveLength(0);
            expect(designer.getWires()).toHaveLength(0);
        });

        test("Select All then Delete", () => {
            const [obj1, obj2] = Place(new ANDGate(), new Multiplexer());
            obj1.setPos(V(2, 0));

            const wire = Connect(obj1, obj2)[0].getWire();
            expect(designer.getWires()).toHaveLength(1);

            expect(selections.get()).toHaveLength(0);

            // Select all objects (wire does not get selected)
            input.pressKey("Meta")
                .pressKey("a")
                .releaseKey("a")
                .releaseKey("Meta");

            expect(selections.get()).toHaveLength(2);
            expect(selections.get()).not.toContain(wire);

            // When everything is deleted, no objects should be selected
            input.pressKey("Backspace");
            expect(selections.get()).toHaveLength(0);
            expect(designer.getWires()).toHaveLength(0);
        });
    });

    describe("Snip WirePorts Handler", () => {
        afterEach(() => {
            // Clear previous circuit
            designer.reset();
            history.reset();
        });

        test("Snip Single Port", () => {
            const [sw, led] = Place(new Switch(), new LED());
            sw.setPos(V(-1.2, 0));
            led.setPos(V(8, -2));

            // Connect Switch -> LED
            input.drag(sw.getOutputPort(0).getWorldTargetPos(),
                       led.getInputPort(0).getWorldTargetPos());

            const wire = sw.getOutputs()[0];
            input.press(wire.getShape().getPos(0.5))
                    .move(V(0.4, 0))
                    .release();

            expect(designer.getObjects()).toHaveLength(3);

            expect(selections.amount()).toBe(1);
            expect(selections.get()[0]).toBeInstanceOf(DigitalNode);
            expect(sw).not.toBeConnectedTo(led, { depth: 1 });
            expect(sw).toBeConnectedTo(led, { depth: 2 });

            input.pressKey("x")
                .releaseKey("x");

            expect(designer.getObjects()).toHaveLength(2);
            expect(selections.amount()).toBe(0);
            expect(sw).toBeConnectedTo(led, { depth: 1 });
        });

        test("Snip 2 Single Ports", () => {
            const [sw, led] = Place(new Switch(), new LED());
            sw.setPos(V(-1.2, 0));
            led.setPos(V(8, -2));

            // Connect Switch -> LED
            input.drag(sw.getOutputPort(0).getWorldTargetPos(),
                       led.getInputPort(0).getWorldTargetPos());

            const wire = sw.getOutputs()[0];
            input.press(wire.getShape().getPos(0.25))
                    .move(V(0.4, 0))
                    .release()
                    .press(wire.getShape().getPos(0.75))
                    .move(V(-0.4, 0))
                    .release();

            expect(designer.getObjects()).toHaveLength(4);

            expect(selections.amount()).toBe(1);
            expect(selections.get()[0]).toBeInstanceOf(DigitalNode);
            expect(sw).not.toBeConnectedTo(led, { depth: 2 });
            expect(sw).toBeConnectedTo(led, { depth: 3 });

            input.pressKey("x")
                .releaseKey("x");

            expect(designer.getObjects()).toHaveLength(3);
            expect(selections.amount()).toBe(0);
            expect(sw).not.toBeConnectedTo(led, { depth: 1 });
            expect(sw).toBeConnectedTo(led, { depth: 2 });

            input.click(designer.getObjects()[2].getPos());

            expect(selections.amount()).toBe(1);
            expect(selections.get()[0]).toBeInstanceOf(DigitalNode);

            input.pressKey("x")
                .releaseKey("x");

            expect(designer.getObjects()).toHaveLength(2);
            expect(selections.amount()).toBe(0);
            expect(sw).toBeConnectedTo(led, { depth: 1 });
        });

        test("Snip Multiple Ports (x2)", () => {
            const [sw, led] = Place(new Switch(), new LED());
            sw.setPos(V(-1.2, 0));
            led.setPos(V(8, -2));

            // Connect Switch -> LED
            input.drag(sw.getOutputPort(0).getWorldTargetPos(),
                       led.getInputPort(0).getWorldTargetPos());

            const wire = sw.getOutputs()[0];
            input.press(wire.getShape().getPos(0.25))
                    .move(V(0.4, 0))
                    .release()
                    .press(wire.getShape().getPos(0.75))
                    .move(V(-0.4, 0))
                    .release()
                    .pressKey("Shift")
                    .click(designer.getObjects()[2].getPos())
                    .releaseKey("Shift");

            expect(designer.getObjects()).toHaveLength(4);
            expect(selections.amount()).toBe(2);
            expect(selections.get()[0]).toBeInstanceOf(DigitalNode);
            expect(selections.get()[1]).toBeInstanceOf(DigitalNode);

            input.pressKey("x")
                .releaseKey("x");

            expect(designer.getObjects()).toHaveLength(2);
            expect(selections.amount()).toBe(0);
            expect(sw).toBeConnectedTo(led, { depth: 1 });

            expect(designer.getObjects()).toHaveLength(2);
            expect(selections.amount()).toBe(0);
            expect(sw).toBeConnectedTo(led, { depth: 1 });
        });
    });
});
