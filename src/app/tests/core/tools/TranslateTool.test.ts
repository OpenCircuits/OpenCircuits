import {V} from "Vector";

import {GetHelpers} from "test/helpers/Helpers";
import {Setup}      from "test/helpers/Setup";

import {ANDGate, Button, DigitalNode, LED, Switch} from "digital/models/ioobjects";


describe("Translate Tool", () => {
    const { designer, input } = Setup();
    const { Place, Connect } = GetHelpers(designer);

    describe("Single Object", () => {
        afterEach(() => {
            // Clear previous circuit
            designer.reset();
        });

        test("Move mouse without dragging", () => {
            const [obj] = Place(new Switch());

            input.moveTo(V(0, 0))
                    .move(V(20, 0));

            expect(obj.getPos()).toEqual(V(0, 0));
        });

        test("Click and Move mouse not on Switch", () => {
            const [obj] = Place(new Switch());

            input.moveTo(V(0, 50))
                    .press()
                    .move(V(0, -100))
                    .release();

            expect(obj.getPos()).toEqual(V(0, 0));
        });

        test("Move Switch", () => {
            const [obj] = Place(new Switch());

            input.drag(V(0, 0), V(100, 0));

            expect(obj.getPos()).toEqual(V(100, 0));
        });

        test("Move Button", () => {
            const [obj] = Place(new Button());

            input.moveTo(V(0, 0))
                    .press()
                    .move(V(-100, 0))
                    .release();

            expect(obj.getPos()).toEqual(V(-100, 0));
        });

        test("Move ANDGate", () => {
            const [obj] = Place(new ANDGate());

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
            const [obj1, obj2] = Place(new Switch(), new ANDGate());
            obj1.setPos(V(100, 0));

            // Select objects
            input.drag(V(-200, -200), V(200, 200));

            // Drag the objects
            input.drag(V(0, 0), V(100, 0));

            expect(obj1.getPos()).toEqual(V(200, 0));
            expect(obj2.getPos()).toEqual(V(100, 0));
        });

        test("Move Switch while ANDGate is Selected", () => {
            const [sw, gate] = Place(new Switch(), new ANDGate());
            gate.setPos(V(100, 0));

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
            const [sw, led, port] = Place(new Switch(), new LED(), new DigitalNode());

            // Set port to vertically align with Switch and horizontally with LED
            port.setPos(V(sw.getOutputPortPos(0).x, led.getInputPortPos(0).y));
            sw.setPos(V(0, 0));
            led.setPos(V(100, 0));

            // Connect to Port and set as straight
            Connect(sw,   port)[0].getWire().setIsStraight(true);
            Connect(port,  led)[0].getWire().setIsStraight(true);

            // Select all
            input.drag(V(-200, -200), V(200, 200));

            // Start Translating then Clone
            input.press(V(0, 0))
                    .moveTo(V(-100, 0))
                    .pressKey(" ")
                    .releaseKey(" ")
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
            expect(objs).toHaveLength(6);

            objs.splice(objs.indexOf(sw), 1);
            objs.splice(objs.indexOf(led), 1);
            objs.splice(objs.indexOf(port), 1);
            expect(objs).toHaveLength(3);

            const sw2   = objs.find((o) => o instanceof Switch) as Switch;
            const led2  = objs.find((o) => o instanceof LED) as LED;
            const port2 = objs.find((o) => o instanceof DigitalNode) as DigitalNode;

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
