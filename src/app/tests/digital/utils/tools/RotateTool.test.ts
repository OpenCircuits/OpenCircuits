import {ROTATION_CIRCLE_RADIUS} from "core/utils/Constants";

import {V} from "Vector";

import "test/helpers/Extensions";
import {GetHelpers} from "test/helpers/Helpers";
import {Setup}      from "test/helpers/Setup";

import {Component} from "core/models";

import {ANDGate, ORGate} from "digital/models/ioobjects";


describe("Rotate Tool", () => {
    const { input, designer, selections } = Setup();
    const { Place } = GetHelpers(designer);

    describe("Single Object", () => {
        const obj = new ANDGate();

        beforeAll(() => {
            // Add object
            Place(obj);
        });

        beforeEach(() => {
            // Reset gate rotation for each test
            obj.setAngle(0);
        });

        test("Rotate ANDGate 45° CCW from side", () => {
            input.click(V(0, 0)); // Select object
            expect(selections.get()).toHaveLength(1);
            expect(selections.get()).toContain(obj);

            input.move(V(-ROTATION_CIRCLE_RADIUS, 0))
                    .press()
                    .move(V(0, +ROTATION_CIRCLE_RADIUS))
                    .release();
            expect(obj.getAngle()).toBeCloseTo(-Math.PI/4);
        });

        test("Rotate ANDGate 45° CW from top", () => {
            input.click(V(0, 0)); // Select object
            expect(selections.get()).toHaveLength(1);
            expect(selections.get()).toContain(obj);

            input.move(V(0, +ROTATION_CIRCLE_RADIUS))
                    .press()
                    .move(V(+ROTATION_CIRCLE_RADIUS, 0))
                    .release();
            expect(obj.getAngle()).toApproximatelyEqual(-Math.PI/4);
        });

        test("Rotate ANDGate 45° CW from top while holding Z", () => {
            input.click(V(0, 0)); // Select object
            expect(selections.get()).toHaveLength(1);
            expect(selections.get()).toContain(obj);

            input.pressKey("z");
            expect(input.isKeyDown("z")).toBe(true);

            input.move(V(0, +ROTATION_CIRCLE_RADIUS))
                    .press()
                    .move(V(+ROTATION_CIRCLE_RADIUS, 0))
                    .release();
            input.releaseKey("z");
            expect(obj.getAngle()).toBeCloseTo(-Math.PI/4);
        });
    });

    describe("Multiple Objects", () => {
        const obj1 = new ANDGate();
        const obj2 = new ORGate();

        beforeAll(() => {
            // Clear previous circuit
            designer.reset();

            // Add objects
            Place(obj1, obj2);
        });

        beforeEach(() => {
            // Reset objects
            obj1.setPos(V(-2, 2));
            obj1.setAngle(0);
            obj2.setPos(V(2, 0));
            obj2.setAngle(0);
        });

        test("Rotate Objects 45° CW", () => {
            input.drag(V(-4, -4),
                       V(4, 4)); // Select objects
            expect(selections.get()).toHaveLength(2);
            expect(selections.get()).toContain(obj1);
            expect(selections.get()).toContain(obj2);

            input.moveTo(selections.midpoint())
                    .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                    .press()
                    .move(V(0, +ROTATION_CIRCLE_RADIUS))
                    .release();
            expect(obj1.getAngle()).toBeCloseTo(-Math.PI/4);
            expect(obj2.getAngle()).toBeCloseTo(-Math.PI/4);
        });

        test("Rotate Objects 100 times around", () => {
            input.drag(V(-4, -4),
                       V(4, 4)); // Select objects

            expect(selections.get()).toHaveLength(2);
            expect(selections.get()).toContain(obj1);
            expect(selections.get()).toContain(obj2);

            const midpoint = obj1.getPos().add(obj2.getPos()).scale(0.5);
            expect(midpoint).toApproximatelyEqual(selections.midpoint());

            input.moveTo(midpoint) // Move to midpoint of objects
                    .move(V(ROTATION_CIRCLE_RADIUS, 0))
                    .press();

            for (let i = 0; i < 100; i++) {
                for (let j = 0; j <= 2*Math.PI; j += 2*Math.PI/10) {
                    const pos = V(ROTATION_CIRCLE_RADIUS*Math.cos(j), ROTATION_CIRCLE_RADIUS*Math.sin(j));
                    input.moveTo(midpoint.add(pos));
                    expect(obj1.getAngle()).toBeCloseToAngle(j);
                    expect(obj2.getAngle()).toBeCloseToAngle(j);
                }
            }
            input.release();

            const newMidpoint = obj1.getPos().add(obj2.getPos()).scale(0.5);

            expect(newMidpoint).toApproximatelyEqual(midpoint); // Make sure midpoint stayed in the same place
            expect(newMidpoint).toApproximatelyEqual(selections.midpoint());
            expect(obj1.getAngle()).toBeCloseTo(0);
            expect(obj2.getAngle()).toBeCloseTo(0);
        });

        test("Rotate Objects 45° CW while holding Z", () => {
            input.drag(V(-4, -4),
                       V(4, 4)); // Select objects
            expect(selections.get()).toHaveLength(2);
            expect(selections.get()).toContain(obj1);
            expect(selections.get()).toContain(obj2);

            const initialMidpoints = (selections.get() as Component[]).map((o) => o.getPos());

            input.pressKey("z");
            expect(input.isKeyDown("z")).toBe(true);

            const midpoint = selections.midpoint();
            input.moveTo(midpoint)
                    .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                    .press()
                    .move(V(0, +ROTATION_CIRCLE_RADIUS))
                    .release();
            input.releaseKey("z");

            const newMidpoint = selections.midpoint();
            const finalMidpoints = (selections.get() as Component[]).map((o) => o.getPos());

            expect(obj1.getAngle()).toBeCloseTo(-Math.PI/4);
            expect(obj2.getAngle()).toBeCloseTo(-Math.PI/4);
            expect(newMidpoint).toStrictEqual(midpoint);
            initialMidpoints.forEach((c, i) => expect(initialMidpoints[i]).toStrictEqual(finalMidpoints[i]));
        });

        test("Rotate Objects 45° CW then undo", () => {
            input.drag(V(-4, -4),
                       V(4, 4)); // Select objects
            expect(selections.get()).toHaveLength(2);
            expect(selections.get()).toContain(obj1);
            expect(selections.get()).toContain(obj2);

            const midpoint = selections.midpoint();
            const initialMidpoints = (selections.get() as Component[]).map((o) => o.getPos());
            input.moveTo(midpoint) // Move to midpoint of objects
                    .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                    .press()
                    .move(V(0, +ROTATION_CIRCLE_RADIUS))
                    .release();

            expect(obj1.getAngle()).toBeCloseTo(-Math.PI/4);
            expect(obj2.getAngle()).toBeCloseTo(-Math.PI/4);

            input.pressKey("Control");
            input.pressKey("z");
            input.releaseKey("Control");
            input.releaseKey("z");

            const newMidpoints = (selections.get() as Component[]).map((o) => o.getPos());
            initialMidpoints.forEach((c, i) => expect(initialMidpoints[i]).toApproximatelyEqual(newMidpoints[i]));  // Make sure midpoints stayed in the same place
            expect(obj1.getAngle()).toBeCloseTo(0);
            expect(obj2.getAngle()).toBeCloseTo(0);
        });

        test("Rotate Objects 45° CW while pressing Z then undo/redo", () => {
            input.drag(V(-4, -4),
                       V(4, 4)); // Select objects
            expect(selections.get()).toHaveLength(2);
            expect(selections.get()).toContain(obj1);
            expect(selections.get()).toContain(obj2);

            input.pressKey("z");
            expect(input.isKeyDown("z")).toBe(true);

            const midpoint = selections.midpoint();
            const initialMidpoints = (selections.get() as Component[]).map((o) => o.getPos());
            input.moveTo(midpoint) // Move to midpoint of objects
                    .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                    .press()
                    .move(V(0, +ROTATION_CIRCLE_RADIUS))
                    .release();
            input.releaseKey("z");

            expect(obj1.getAngle()).toBeCloseTo(-Math.PI/4);
            expect(obj2.getAngle()).toBeCloseTo(-Math.PI/4);

            // undo
            input.pressKey("Control");
            input.pressKey("z");
            input.releaseKey("Control");
            input.releaseKey("z");

            let newMidpoints = (selections.get() as Component[]).map((o) => o.getPos());
            initialMidpoints.forEach((c, i) => expect(initialMidpoints[i]).toStrictEqual(newMidpoints[i]));  // Make sure midpoints stayed in the same place
            expect(obj1.getAngle()).toBeCloseTo(0);
            expect(obj2.getAngle()).toBeCloseTo(0);

            // redo
            input.pressKey("Control");
            input.pressKey("y");
            input.releaseKey("Control");
            input.releaseKey("y");

            newMidpoints = (selections.get() as Component[]).map((o) => o.getPos());
            initialMidpoints.forEach((c, i) => expect(initialMidpoints[i]).toStrictEqual(newMidpoints[i]));  // Make sure midpoints stayed in the same place
            expect(obj1.getAngle()).toBeCloseTo(-Math.PI/4);
            expect(obj2.getAngle()).toBeCloseTo(-Math.PI/4);
        });

        test("Rotate Objects 180° CW while toggling Z halfway through", () => {
            input.drag(V(-4, -4),
                       V(4, 4)); // Select objects
            expect(selections.get()).toHaveLength(2);
            expect(selections.get()).toContain(obj1);
            expect(selections.get()).toContain(obj2);

            input.pressKey("z");
            expect(input.isKeyDown("z")).toBe(true);

            const midpoint = selections.midpoint();

            // rotation #1
            input.moveTo(midpoint) // Move to midpoint of objects
                    .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                    .press()
                    .move(V(ROTATION_CIRCLE_RADIUS, ROTATION_CIRCLE_RADIUS));

            // Make sure it rotated 90 degrees for each component
            expect(obj1.getAngle()).toBeCloseToAngle(-Math.PI/2);
            expect(obj2.getAngle()).toBeCloseToAngle(-Math.PI/2);

            // Rotate the rest of the 180
            input.releaseKey("z") // release z partway through
                .move(V(ROTATION_CIRCLE_RADIUS, -ROTATION_CIRCLE_RADIUS))
                .release();

            expect(obj1.getAngle()).toBeCloseToAngle(-Math.PI);
            expect(obj2.getAngle()).toBeCloseToAngle(-Math.PI);

            expect(obj1.getPos()).toApproximatelyEqual(V(+1, +3));
            expect(obj2.getPos()).toApproximatelyEqual(V(-1, -1));
        });

    });
});
