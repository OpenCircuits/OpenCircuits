/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "shared/api/circuit/tests/helpers/Extensions";

import {V} from "Vector";

import {ROTATION_CIRCLE_RADIUS} from "shared/api/circuitdesigner/tools/RotateTool";

import {CreateTestCircuitDesigner} from "tests/helpers/CreateTestCircuitDesigner";


describe("RotateTool", () => {
    describe("Single Object", () => {
        const [designer, input, _] = CreateTestCircuitDesigner();
        const camera = designer.viewport.camera, circuit = designer.circuit;

        const obj = circuit.placeComponentAt("TestComp", V(0, 0));

        beforeEach(() => {
            // Reset gate rotation for each test
            obj.angle = 0;
            obj.deselect();
        });

        test("Rotate Component 45° CCW from side", () => {
            input.click(V(0, 0)); // Select object

            input.move(V(-ROTATION_CIRCLE_RADIUS, 0))
                    .press()
                    .move(V(0, +ROTATION_CIRCLE_RADIUS))
                    .release();
            expect(obj.angle).toBeCloseTo(-Math.PI/4);
        });

        test("Rotate Component 45° CW from top", () => {
            input.click(V(0, 0)); // Select object

            input.move(V(0, +ROTATION_CIRCLE_RADIUS))
                    .press()
                    .move(V(+ROTATION_CIRCLE_RADIUS, 0))
                    .release();
            expect(obj.angle).toApproximatelyEqual(-Math.PI/4);
        });

        test("Rotate Component 45° CW from top while holding Z", () => {
            input.click(V(0, 0)); // Select object

            input.pressKey("z")
                .move(V(0, +ROTATION_CIRCLE_RADIUS))
                .press()
                .move(V(+ROTATION_CIRCLE_RADIUS, 0))
                .release()
                .releaseKey("z");
            expect(obj.angle).toBeCloseTo(-Math.PI/4);
        });

        test("Rotate Object 100 times around", () => {
            input.click(V(0, 0)); // Select object

            input.move(V(ROTATION_CIRCLE_RADIUS, 0))
                    .press();

            for (let i = 0; i < 100; i++) {
                for (let j = 0; j <= 2*Math.PI; j += 2*Math.PI/10) {
                    const pos = V(ROTATION_CIRCLE_RADIUS*Math.cos(j), ROTATION_CIRCLE_RADIUS*Math.sin(j));
                    input.moveTo(pos);
                    // I DONT KNOW WHY THE EPSILON NEEDS TO BE SO LARGE
                    expect(obj.angle).toBeCloseToAngle(j, 0.02);
                }
            }
            input.release();

            expect(obj.angle).toBeCloseTo(0);
        });
    });

    describe("Multiple Objects", () => {
        const [designer, input, _] = CreateTestCircuitDesigner();
        const camera = designer.viewport.camera, circuit = designer.circuit;

        const obj1 = circuit.placeComponentAt("TestComp", V(0, 0));
        const obj2 = circuit.placeComponentAt("TestComp", V(0, 0));

        beforeEach(() => {
            // Reset objects
            obj1.pos = V(-2, 2);
            obj1.angle = 0;
            obj2.pos = V(2, 0);
            obj2.angle = 0;
        });

        test("Rotate Objects 45° CW", () => {
            input.drag(V(-4, -4),
                       V(+4, +4)); // Select objects
            expect(circuit.selections).toHaveLength(2);

            input.moveTo(circuit.selections.midpoint())
                .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                .press()
                .move(V(0, +ROTATION_CIRCLE_RADIUS))
                .release();
            expect(obj1.angle).toBeCloseTo(-Math.PI/4);
            expect(obj2.angle).toBeCloseTo(-Math.PI/4);
        });

        test("Rotate Objects 100 times around", () => {
            input.drag(V(-4, -4),
                       V(+4, +4)); // Select objects
            expect(circuit.selections).toHaveLength(2);

            const midpoint = obj1.pos.add(obj2.pos).scale(0.5);
            expect(midpoint).toApproximatelyEqual(circuit.selections.midpoint());

            input.moveTo(midpoint) // Move to midpoint of objects
                .move(V(ROTATION_CIRCLE_RADIUS, 0))
                .press();

            for (let i = 0; i < 100; i++) {
                for (let j = 0; j <= 2*Math.PI; j += 2*Math.PI/10) {
                    const pos = V(ROTATION_CIRCLE_RADIUS*Math.cos(j), ROTATION_CIRCLE_RADIUS*Math.sin(j));
                    input.moveTo(midpoint.add(pos), 1);
                    expect(obj1.angle).toBeCloseToAngle(j, 0.02);
                    expect(obj2.angle).toBeCloseToAngle(j, 0.02);
                }
            }
            input.release();

            const newMidpoint = obj1.pos.add(obj2.pos).scale(0.5);

            expect(newMidpoint).toApproximatelyEqual(midpoint); // Make sure midpoint stayed in the same place
            expect(newMidpoint).toApproximatelyEqual(circuit.selections.midpoint());
            expect(obj1.angle).toBeCloseTo(0);
            expect(obj2.angle).toBeCloseTo(0);
        });

        test("Rotate Objects 45° CW while holding Z", () => {
            input.drag(V(-4, -4),
                       V(+4, +4)); // Select objects
            expect(circuit.selections).toHaveLength(2);

            const initialMidpoints = circuit.selections.components.map((o) => o.pos);
            const midpoint = circuit.selections.midpoint();

            input.pressKey("z")
                .moveTo(midpoint)
                .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                .press()
                .move(V(0, +ROTATION_CIRCLE_RADIUS))
                .release()
                .releaseKey("z");

            const newMidpoint = circuit.selections.midpoint();
            const finalMidpoints = circuit.selections.components.map((o) => o.pos);

            expect(obj1.angle).toBeCloseTo(-Math.PI/4);
            expect(obj2.angle).toBeCloseTo(-Math.PI/4);
            expect(newMidpoint).toStrictEqual(midpoint);
            initialMidpoints.forEach((c, i) => expect(initialMidpoints[i]).toStrictEqual(finalMidpoints[i]));
        });

        test("Rotate Objects 45° CW then undo", () => {
            input.drag(V(-4, -4),
                       V(+4, +4)); // Select objects

            const initialMidpoints = circuit.selections.components.map((o) => o.pos);
            const midpoint = circuit.selections.midpoint();

            input.moveTo(midpoint) // Move to midpoint of objects
                .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                .press()
                .move(V(0, +ROTATION_CIRCLE_RADIUS))
                .release();

            expect(obj1.angle).toBeCloseTo(-Math.PI/4);
            expect(obj2.angle).toBeCloseTo(-Math.PI/4);

            input.pressKey("Control")
                .pressKey("z")
                .releaseKey("Control")
                .releaseKey("z");

            const newMidpoints = circuit.selections.components.map((o) => o.pos);
            initialMidpoints.forEach((c, i) => expect(initialMidpoints[i]).toApproximatelyEqual(newMidpoints[i]));  // Make sure midpoints stayed in the same place
            expect(obj1.angle).toBeCloseTo(0);
            expect(obj2.angle).toBeCloseTo(0);
        });

        test("Rotate Objects 45° CW while pressing Z then undo/redo", () => {
            input.drag(V(-4, -4),
                       V(+4, +4)); // Select objects

            const initialMidpoints = circuit.selections.components.map((o) => o.pos);
            const midpoint = circuit.selections.midpoint();

            input.pressKey("z")
                .moveTo(midpoint) // Move to midpoint of objects
                .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                .press()
                .move(V(0, +ROTATION_CIRCLE_RADIUS))
                .release()
                .releaseKey("z");

            expect(obj1.angle).toBeCloseTo(-Math.PI/4);
            expect(obj2.angle).toBeCloseTo(-Math.PI/4);

            // undo
            input.pressKey("Control")
                .pressKey("z")
                .releaseKey("Control")
                .releaseKey("z");

            let newMidpoints = circuit.selections.components.map((o) => o.pos);
            initialMidpoints.forEach((c, i) => expect(initialMidpoints[i]).toStrictEqual(newMidpoints[i]));  // Make sure midpoints stayed in the same place
            expect(obj1.angle).toBeCloseTo(0);
            expect(obj2.angle).toBeCloseTo(0);

            // redo
            input.pressKey("Control")
                .pressKey("y")
                .releaseKey("Control")
                .releaseKey("y");

            newMidpoints = circuit.selections.components.map((o) => o.pos);
            initialMidpoints.forEach((c, i) => expect(initialMidpoints[i]).toStrictEqual(newMidpoints[i]));  // Make sure midpoints stayed in the same place
            expect(obj1.angle).toBeCloseTo(-Math.PI/4);
            expect(obj2.angle).toBeCloseTo(-Math.PI/4);
        });

        test("Rotate Objects 180° CW while toggling Z halfway through", () => {
            input.drag(V(-4, -4),
                       V(+4, +4)); // Select objects

            const midpoint = circuit.selections.midpoint();

            // rotation #1
            input.pressKey("z")
                .moveTo(midpoint) // Move to midpoint of objects
                .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                .press()
                .move(V(ROTATION_CIRCLE_RADIUS, ROTATION_CIRCLE_RADIUS));

            // Make sure it rotated 90 degrees for each component
            expect(obj1.angle).toBeCloseToAngle(-Math.PI/2);
            expect(obj2.angle).toBeCloseToAngle(-Math.PI/2);

            // Rotate the rest of the 180
            input.releaseKey("z") // release z partway through
                .move(V(ROTATION_CIRCLE_RADIUS, -ROTATION_CIRCLE_RADIUS))
                .release();

            expect(obj1.angle).toBeCloseToAngle(-Math.PI);
            expect(obj2.angle).toBeCloseToAngle(-Math.PI);

            expect(obj1.pos).toApproximatelyEqual(V(+1, +3));
            expect(obj2.pos).toApproximatelyEqual(V(-1, -1));
        });
    });
});
