/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "shared/api/circuit/tests/helpers/Extensions";

import {V} from "Vector";

import {ROTATION_CIRCLE_RADIUS} from "shared/api/circuitdesigner/tools/RotateTool";

import {CreateTestCircuitDesigner} from "tests/helpers/CreateTestCircuitDesigner";


describe("RotateTool", () => {
    describe("Single Object", () => {
        test("Rotate Component 45° CCW from side", () => {
            const [{ circuit }, input, _] = CreateTestCircuitDesigner();
            const obj = circuit.placeComponentAt("TestComp", V(0, 0));

            input.click(V(0, 0)); // Select object

            input.move(V(-ROTATION_CIRCLE_RADIUS, 0))
                    .press()
                    .move(V(0, +ROTATION_CIRCLE_RADIUS))
                    .release();
            expect(obj.angle).toBeCloseTo(-Math.PI/4);
        });

        test("Rotate Component 45° CW from top", () => {
            const [{ circuit }, input, _] = CreateTestCircuitDesigner();
            const obj = circuit.placeComponentAt("TestComp", V(0, 0));

            input.click(V(0, 0)); // Select object

            input.move(V(0, +ROTATION_CIRCLE_RADIUS))
                    .press()
                    .move(V(+ROTATION_CIRCLE_RADIUS, 0))
                    .release();
            expect(obj.angle).toApproximatelyEqual(-Math.PI/4);
        });

        test("Rotate Component 45° CW from top while holding Z", () => {
            const [{ circuit }, input, _] = CreateTestCircuitDesigner();
            const obj = circuit.placeComponentAt("TestComp", V(0, 0));

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
            const [{ circuit }, input, _] = CreateTestCircuitDesigner();
            const obj = circuit.placeComponentAt("TestComp", V(0, 0));

            input.click(V(0, 0)); // Select object

            input.move(V(ROTATION_CIRCLE_RADIUS, 0))
                    .press();

            for (let i = 0; i < 100; i++) {
                for (let j = 0; j <= 2*Math.PI; j += 2*Math.PI/10) {
                    const pos = V(ROTATION_CIRCLE_RADIUS*Math.cos(j), ROTATION_CIRCLE_RADIUS*Math.sin(j));
                    input.moveTo(pos, 1);
                    // Need to account for float->int conversion when going to screen-coords, hence the
                    // large-ish epsilon
                    expect(obj.angle).toBeCloseToAngle(j, 0.02);
                }
            }
            input.release();

            expect(obj.angle).toBeCloseTo(0);
        });
    });

    describe("Multiple Objects", () => {
        test("Rotate Objects 45° CW", () => {
            const [{ circuit }, input, _] = CreateTestCircuitDesigner();
            const obj1 = circuit.placeComponentAt("TestComp", V(-2, 2));
            const obj2 = circuit.placeComponentAt("TestComp", V(2, 0));

            input.drag(V(-4, -4),
                       V(+4, +4)); // Select objects
            expect(circuit.selections).toHaveLength(2);

            const obj1Pos = obj1.pos, obj2Pos = obj2.pos;
            const midpoint = circuit.selections.midpoint;

            input.moveTo(midpoint)
                .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                .press()
                .move(V(0, +ROTATION_CIRCLE_RADIUS))
                .release();

            expect(obj1.angle).toBeCloseTo(-Math.PI/4);
            expect(obj2.angle).toBeCloseTo(-Math.PI/4);
            expect(obj1.pos).toApproximatelyEqual(obj1Pos.rotate(-Math.PI/4, midpoint));
            expect(obj2.pos).toApproximatelyEqual(obj2Pos.rotate(-Math.PI/4, midpoint));
            expect(circuit.selections.midpoint).toApproximatelyEqual(midpoint);
        });

        test("Rotate Objects 100 times around", () => {
            const [{ circuit }, input, _, { PlaceAt }] = CreateTestCircuitDesigner();
            const [obj1, obj2, obj3] = PlaceAt(V(-2, -2), V(2, 0), V(0, 2));

            input.drag(V(-4, -4),
                       V(+4, +4)); // Select objects
            expect(circuit.selections).toHaveLength(3);

            const obj1Pos = obj1.pos, obj2Pos = obj2.pos, obj3Pos = obj3.pos;
            const midpoint = circuit.selections.midpoint;
            input.moveTo(midpoint)
                .move(V(ROTATION_CIRCLE_RADIUS, 0))
                .press();

            for (let i = 0; i < 100; i++) {
                for (let j = 0; j <= 2*Math.PI; j += 2*Math.PI/10) {
                    const pos = V(ROTATION_CIRCLE_RADIUS*Math.cos(j), ROTATION_CIRCLE_RADIUS*Math.sin(j));
                    input.moveTo(midpoint.add(pos), 1);
                    expect(obj1.angle).toBeCloseToAngle(j, 0.02);
                    expect(obj2.angle).toBeCloseToAngle(j, 0.02);
                    expect(obj1.pos).toApproximatelyEqual(obj1Pos.rotate(j, midpoint), 0.05);
                    expect(obj2.pos).toApproximatelyEqual(obj2Pos.rotate(j, midpoint), 0.05);
                    expect(obj3.pos).toApproximatelyEqual(obj3Pos.rotate(j, midpoint), 0.05);
                    // Make sure midpoint is stable
                    expect(circuit.selections.midpoint).toApproximatelyEqual(midpoint);
                }
            }
            input.release();

            expect(obj1.angle).toBeCloseTo(0);
            expect(obj2.angle).toBeCloseTo(0);
            // Make sure midpoint stayed in the same place
            expect(circuit.selections.midpoint).toApproximatelyEqual(midpoint);
        });

        test("Rotate Objects 45° CW while holding Z", () => {
            const [{ circuit }, input, _] = CreateTestCircuitDesigner();
            const obj1 = circuit.placeComponentAt("TestComp", V(-2, 2));
            const obj2 = circuit.placeComponentAt("TestComp", V(2, 0));

            input.drag(V(-4, -4),
                       V(+4, +4)); // Select objects
            expect(circuit.selections).toHaveLength(2);

            const initialMidpoints = circuit.selections.components.map((o) => o.pos);
            const midpoint = circuit.selections.midpoint;

            input.pressKey("z")
                .moveTo(midpoint)
                .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                .press()
                .move(V(0, +ROTATION_CIRCLE_RADIUS))
                .release()
                .releaseKey("z");

            const newMidpoint = circuit.selections.midpoint;
            const finalMidpoints = circuit.selections.components.map((o) => o.pos);

            expect(obj1.angle).toBeCloseTo(-Math.PI/4);
            expect(obj2.angle).toBeCloseTo(-Math.PI/4);
            expect(newMidpoint).toStrictEqual(midpoint);
            initialMidpoints.forEach((c, i) => expect(initialMidpoints[i]).toStrictEqual(finalMidpoints[i]));
        });

        test("Rotate Objects 45° CW then undo", () => {
            const [{ circuit }, input, _] = CreateTestCircuitDesigner();
            const obj1 = circuit.placeComponentAt("TestComp", V(-2, 2));
            const obj2 = circuit.placeComponentAt("TestComp", V(2, 0));

            input.drag(V(-4, -4),
                       V(+4, +4)); // Select objects

            const initialMidpoints = circuit.selections.components.map((o) => o.pos);
            const midpoint = circuit.selections.midpoint;

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
            const [{ circuit }, input, _] = CreateTestCircuitDesigner();
            const obj1 = circuit.placeComponentAt("TestComp", V(-2, 2));
            const obj2 = circuit.placeComponentAt("TestComp", V(2, 0));

            input.drag(V(-4, -4),
                       V(+4, +4)); // Select objects

            const initialMidpoints = circuit.selections.components.map((o) => o.pos);
            const midpoint = circuit.selections.midpoint;

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
            const [{ circuit }, input, _] = CreateTestCircuitDesigner();
            const obj1 = circuit.placeComponentAt("TestComp", V(-2, 2));
            const obj2 = circuit.placeComponentAt("TestComp", V(2, 0));

            input.drag(V(-4, -4),
                       V(+4, +4)); // Select objects

            const midpoint = circuit.selections.midpoint;

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
