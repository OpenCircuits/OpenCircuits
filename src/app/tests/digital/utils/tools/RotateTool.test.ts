import {ROTATION_CIRCLE_RADIUS} from "core/utils/Constants";

import {V} from "Vector";

import "test/helpers/Extensions";
import {GetHelpers} from "test/helpers/Helpers";
import {Setup}      from "test/helpers/Setup";

import {ANDGate, ORGate} from "digital/models/ioobjects";

import {Component} from "core/models";

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
            expect(obj.getAngle()).toBeCloseTo(-Math.PI/4);
        });

        test("Rotate ANDGate 45° CW from top while holding Z", () => {
            input.click(V(0, 0)); // Select object
            expect(selections.get().length).toBe(1);
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
            designer.addObjects([obj1, obj2]);
        });

        beforeEach(() => {
            // Reset objects
            obj1.setPos(V(-20, 20));
            obj1.setAngle(0);
            obj2.setPos(V(20, 0));
            obj2.setAngle(0);
        });

        test("Rotate Objects 45° CW", () => {
            input.drag(V(-40, -40),
                       V(40, 40)); // Select objects
            expect(selections.get()).toHaveLength(2);
            expect(selections.get()).toContain(obj1);
            expect(selections.get()).toContain(obj2);

            const midpoint = obj1.getPos().add(obj2.getPos()).scale(0.5);
            input.moveTo(midpoint) // Move to midpoint of objects
                    .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                    .press()
                    .move(V(0, +ROTATION_CIRCLE_RADIUS))
                    .release();
            expect(obj1.getAngle()).toBeCloseTo(-Math.PI/4);
            expect(obj2.getAngle()).toBeCloseTo(-Math.PI/4);
        });

        test("Rotate Objects 100 times around", () => {
            input.drag(V(-40, -40),
                       V(40, 40)); // Select objects

            expect(selections.get()).toHaveLength(2);
            expect(selections.get()).toContain(obj1);
            expect(selections.get()).toContain(obj2);

            const midpoint = obj1.getPos().add(obj2.getPos()).scale(0.5);
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
            expect(obj1.getAngle()).toBeCloseTo(0);
            expect(obj2.getAngle()).toBeCloseTo(0);
        });

        test("Rotate Objects 45° CW while holding Z", () => {
            input.drag(V(-40, -40),
                       V(40, 40)); // Select objects
            expect(selections.get().length).toBe(2);
            expect(selections.get()).toContain(obj1);
            expect(selections.get()).toContain(obj2);

            const initial_midpoints = (selections.get() as Component[]).map(o => o.getPos());

            input.pressKey("z");
            expect(input.isKeyDown("z")).toBe(true);

            const midpoint = obj1.getPos().add(obj2.getPos()).scale(0.5);
            input.moveTo(midpoint) // Move to midpoint of objects
                    .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                    .press()
                    .move(V(0, +ROTATION_CIRCLE_RADIUS))
                    .release();
            input.releaseKey("z");

            const newMidpoint = obj1.getPos().add(obj2.getPos()).scale(0.5);
            const final_midpoints = (selections.get() as Component[]).map(o => o.getPos());

            expect(obj1.getAngle()).toBeCloseTo(-Math.PI/4);
            expect(obj2.getAngle()).toBeCloseTo(-Math.PI/4);
            expect(newMidpoint).toStrictEqual(midpoint);
            initial_midpoints.forEach((c, i) => expect(initial_midpoints[i]).toStrictEqual(final_midpoints[i]));
        });

        test("Rotate Objects 45° CW then undo", () => {
            input.drag(V(-40, -40),
                       V(40, 40)); // Select objects
            expect(selections.get().length).toBe(2);
            expect(selections.get()).toContain(obj1);
            expect(selections.get()).toContain(obj2);

            const midpoint = obj1.getPos().add(obj2.getPos()).scale(0.5);
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

            const newMidpoint = obj1.getPos().add(obj2.getPos()).scale(0.5);
            expect(newMidpoint).toApproximatelyEqual(midpoint); // Make sure midpoint stayed in the same place
            expect(obj1.getAngle()).toBeCloseTo(0);
            expect(obj2.getAngle()).toBeCloseTo(0);
        });

        test("Rotate Objects 45° CW while pressing Z then undo/redo", () => {
            input.drag(V(-40, -40),
                       V(40, 40)); // Select objects
            expect(selections.get().length).toBe(2);
            expect(selections.get()).toContain(obj1);
            expect(selections.get()).toContain(obj2);

            input.pressKey("z");
            expect(input.isKeyDown("z")).toBe(true);

            const midpoint = obj1.getPos().add(obj2.getPos()).scale(0.5);
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
            
            const newMidpoint = obj1.getPos().add(obj2.getPos()).scale(0.5);
            expect(newMidpoint).toStrictEqual(midpoint); // Make sure midpoint stayed in the same place
            expect(obj1.getAngle()).toBeCloseTo(0);
            expect(obj2.getAngle()).toBeCloseTo(0);
            
            // redo
            input.pressKey("Control");
            input.pressKey("y");
            input.releaseKey("Control");
            input.releaseKey("y");

            expect(obj1.getAngle()).toBeCloseTo(-Math.PI/4);
            expect(obj2.getAngle()).toBeCloseTo(-Math.PI/4);          
        });

        test("Rotate Objects 45° CW while toggling Z", () => {
            input.drag(V(-40, -40),
                       V(40, 40)); // Select objects
            expect(selections.get().length).toBe(2);
            expect(selections.get()).toContain(obj1);
            expect(selections.get()).toContain(obj2);

            input.pressKey("z");
            expect(input.isKeyDown("z")).toBe(true);

            let midpoint = obj1.getPos().add(obj2.getPos()).scale(0.5);
            const initial_midpoints = (selections.get() as Component[]).map(o => o.getPos());

            // rotation #1
            input.moveTo(midpoint) // Move to midpoint of objects
                    .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                    .press()
                    .move(V(0, +ROTATION_CIRCLE_RADIUS/2));
            input.releaseKey("z");  // release z partway through rotation
            input.move(V(0, +ROTATION_CIRCLE_RADIUS/2))
                    .release();

            const newMidpoint = obj1.getPos().add(obj2.getPos()).scale(0.5);
            const final_midpoints = (selections.get() as Component[]).map(o => o.getPos());

            expect(obj1.getAngle()).toBeCloseTo(-Math.PI/4);
            expect(obj2.getAngle()).toBeCloseTo(-Math.PI/4);
            expect(newMidpoint).toStrictEqual(midpoint);
            initial_midpoints.forEach((c, i) => expect(initial_midpoints[i]).toStrictEqual(final_midpoints[i]));

            // rotation #2
            input.moveTo(newMidpoint) // Move to midpoint of objects
                    .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                    .press()
                    .move(V(0, +ROTATION_CIRCLE_RADIUS/2));
            input.pressKey("z");    // press z partway through rotation
            input.move(V(0, +ROTATION_CIRCLE_RADIUS/2))
                    .release();
            input.releaseKey("z");

            midpoint = obj1.getPos().add(obj2.getPos()).scale(0.5);

            expect(obj1.getAngle()).toBeCloseTo(-Math.PI/2);
            expect(obj2.getAngle()).toBeCloseTo(-Math.PI/2);
            expect(newMidpoint).toApproximatelyEqual(midpoint);
        });

    });
});
