/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "shared/api/circuit/tests/helpers/Extensions";

import {V} from "Vector";

import {CreateTestCircuitDesigner} from "tests/helpers/CreateTestCircuitDesigner";


describe("TranslateTool", () => {
     describe("Single Object", () => {
        test("Move mouse without dragging", () => {
            const [designer, input, _, { PlaceAt }] = CreateTestCircuitDesigner();
            const [obj] = PlaceAt(V(0, 0));

            input.moveTo(V(0, 0))
                .move(V(20, 0));

            expect(obj.pos).toEqual(V(0, 0));
        });

        test("Click and Move mouse not on Component", () => {
            const [designer, input, _, { PlaceAt }] = CreateTestCircuitDesigner();
            const [obj] = PlaceAt(V(0, 0));

            input.moveTo(V(0, 50))
                    .press()
                    .move(V(0, -100))
                    .release();

            expect(obj.pos).toEqual(V(0, 0));
        });

        test("Move Component", () => {
            const [designer, input, _, { PlaceAt }] = CreateTestCircuitDesigner();
            const [obj] = PlaceAt(V(0, 0));

            input.drag(V(0, 0), V(100, 0));

            expect(obj.pos).toEqual(V(100, 0));
        });
        // TODO: Test with holding shift key
    });

    describe("Multiple Objects", () => {
        test("Move 2 Components", () => {
            const [designer, input, _, { PlaceAt }] = CreateTestCircuitDesigner();
            const [obj1, obj2] = PlaceAt(V(0, 0), V(2, 0));

            // Select objects
            input.drag(V(-4, -4), V(4, 4));

            // Drag the objects
            input.drag(V(0, 0), V(2, 0));

            expect(obj1.pos).toEqual(V(2, 0));
            expect(obj2.pos).toEqual(V(4, 0));
        });

        test("Move 1 Component while Other is Selected", () => {
            const [designer, input, _, { PlaceAt }] = CreateTestCircuitDesigner();
            const [obj1, obj2] = PlaceAt(V(0, 0), V(2, 0));

            // Select ANDGate
            input.click(obj2.pos);

            // Drag the Switch
            input.drag(V(0, 0), V(-2, 0));

            expect(obj1.pos).toEqual(V(-2, 0));
            expect(obj2.pos).toEqual(V(2, 0));
        });

        // TODO: Test with holding shift key
    });

    // describe("Cloning", () => {
    //     test("Clone Switch -> LED with Snapped WirePort", () => {
    //         const [sw, led, port] = Place(new Switch(), new LED(), new DigitalNode());

    //         // Set port to vertically align with Switch and horizontally with LED
    //         port.setPos(V(sw.getOutputPortPos(0).x, led.getInputPortPos(0).y));
    //         sw.setPos(V(0, 0));
    //         led.setPos(V(100, 0));

    //         // Connect to Port and set as straight
    //         Connect(sw,   port)[0].getWire().setIsStraight(true);
    //         Connect(port,  led)[0].getWire().setIsStraight(true);

    //         // Select all
    //         input.drag(V(-200, -200), V(200, 200));

    //         // Start Translating then Clone
    //         input.press(V(0, 0))
    //                 .moveTo(V(-100, 0))
    //                 .pressKey(" ")
    //                 .releaseKey(" ")
    //                 .moveTo(V(100, 0))
    //                 .release();

    //         // Expect initial objects to stay relatively the same
    //         expect(sw.getPos()).toEqual(V(100, 0));
    //         expect(led.getPos()).toEqual(V(200, 0));
    //         expect(port.getPos()).toEqual(V(sw.getOutputPortPos(0).x, led.getInputPortPos(0).y));
    //         expect(port.getInputs()[0].isStraight()).toBe(true);
    //         expect(port.getOutputs()[0].isStraight()).toBe(true);

    //         // Find duplicated objects
    //         const objs = designer.getObjects();
    //         expect(objs).toHaveLength(6);

    //         objs.splice(objs.indexOf(sw), 1);
    //         objs.splice(objs.indexOf(led), 1);
    //         objs.splice(objs.indexOf(port), 1);
    //         expect(objs).toHaveLength(3);

    //         const sw2   = objs.find((o) => o instanceof Switch) as Switch;
    //         const led2  = objs.find((o) => o instanceof LED) as LED;
    //         const port2 = objs.find((o) => o instanceof DigitalNode) as DigitalNode;

    //         // Expect duplicated objects to be the same
    //         expect(sw2.getPos()).toEqual(V(-100, 0));
    //         expect(led2.getPos()).toEqual(V(0, 0));
    //         expect(port2.getPos()).toEqual(V(sw2.getOutputPortPos(0).x, led2.getInputPortPos(0).y));
    //         expect(port2.getInputs()[0].isStraight()).toBe(true);
    //         expect(port2.getOutputs()[0].isStraight()).toBe(true);
    //     });

    //     // TODO: More cloning tests
    // });
});
