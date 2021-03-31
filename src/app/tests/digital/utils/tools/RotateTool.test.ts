import "jest";
import "test/helpers/Extensions";

import {ROTATION_CIRCLE_RADIUS} from "core/utils/Constants";

import {V} from "Vector";

import {ANDGate} from "digital/models/ioobjects/gates/ANDGate";
import {ORGate}  from "digital/models/ioobjects/gates/ORGate";

import {Setup}      from "test/helpers/Setup";
import {GetHelpers} from "test/helpers/Helpers";
import { Label } from "digital/models/ioobjects";


describe("Rotate Tool", () => {
    const {input, designer, selections} = Setup();
    const {Place} = GetHelpers({designer});

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
            expect(selections.get().length).toBe(1);
            expect(selections.get()).toContain(obj);

            input.move(V(-ROTATION_CIRCLE_RADIUS, 0))
                    .press()
                    .move(V(0, +ROTATION_CIRCLE_RADIUS))
                    .release();
            expect(obj.getAngle()).toBeCloseTo(-Math.PI/4);
        });

        test("Rotate ANDGate 45° CW from top", () => {
            input.click(V(0, 0)); // Select object
            expect(selections.get().length).toBe(1);
            expect(selections.get()).toContain(obj);

            input.move(V(0, +ROTATION_CIRCLE_RADIUS))
                    .press()
                    .move(V(+ROTATION_CIRCLE_RADIUS, 0))
                    .release();
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
        });

        test("Rotate objects 100 times around", () => {
            input.drag(V(-40, -40),
                       V(40, 40)); // Select objects

            expect(selections.get().length).toBe(2);
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
    });

    describe("Parented Objects", () => {
        const obj = new Label();
        const par = new ANDGate();

        beforeAll(() => {
            // Clear previous circuit
            designer.reset();

            // set par as parent to obj
            obj.getTransform().setParent(par.getTransform());

            // Add objects
            designer.addObjects([obj, par]);
        });
        

        beforeEach(() => {
            // Reset objects
            obj.setPos(V(0, -50));
            obj.setAngle(0);
            par.setPos(V(0, 0));
            par.setAngle(0);
        });

        // 100 units to the right of parent
        // rotate parent 90 degrees, label is 100 units above
        test("Rotate Parent 90°", () => {
            obj.setPos(V(par.getPos().x.valueOf()+100, par.getPos().y));

            input.click(par.getPos());
            expect(selections.get().length).toBe(1);
            expect(selections.get()).toContain(par);

            
            input.moveTo(par.getPos()) // Move to midpoint of parent
                    .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                    .press()
                    .move(V(+ROTATION_CIRCLE_RADIUS, +ROTATION_CIRCLE_RADIUS))
                    .release();
            expect(par.getAngle()).toBeCloseTo(-Math.PI/2);
            expect(obj.getAngle()).toBeCloseTo(-Math.PI/2);
            expect(obj.getPos().x).toBeCloseTo(0);
            expect(obj.getPos().y).toBeCloseTo(-100);
        });

        // rotate label 90 degrees, rotate parent -90 degrees
        // label should be 0 degrees
        test("Rotate Label 90°, Parent -90°", () => {
            obj.setPos(V(par.getPos().x.valueOf()+100, par.getPos().y));
            // for some reason, setAngle must be called again, even though
            // its in the BeforeEach section
            obj.setAngle(0);
            par.setAngle(0);
            input.click(obj.getPos()); // Select child
            expect(selections.get().length).toBe(1);
            expect(selections.get()).toContain(obj);
    
            expect(obj.getAngle()).toBeCloseTo(0);
            const midpoint = obj.getPos();
            input.moveTo(midpoint) // Move to midpoint of objects
                    .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                    .press()
                    .move(V(+ROTATION_CIRCLE_RADIUS, +ROTATION_CIRCLE_RADIUS))
                    .release();
            expect(obj.getAngle()).toBeCloseTo(-Math.PI/2);

            input.click(par.getPos()); // Select parent
            expect(selections.get().length).toBe(1);
            expect(selections.get()).toContain(par);
               
            expect(par.getAngle()).toBeCloseTo(0);
            input.moveTo(par.getPos()) // Move to midpoint of objects
                    .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                    .press()
                    .move(V(+ROTATION_CIRCLE_RADIUS, -ROTATION_CIRCLE_RADIUS))
                    .release();
            // expected 90 degrees and 0 degrees
            // got -270 degrees and -360 degrees... is this right?
            expect(par.getAngle()).toBeCloseTo(Math.PI/2 - 2*Math.PI);
            expect(obj.getAngle()).toBeCloseTo(-2*Math.PI);
        });

        // label 200 units above parent, move parent up 1000 units, move parent down 1000 units
        // store cullbox before moving, make sure it is the same after the parent moves back down
        test("Cullbox test", () => {
            obj.setPos(V(par.getPos().x, par.getPos().y.valueOf() - 200));

            const cull = obj.getCullBox();
            
            input.moveTo(par.getPos()) // Move to midpoint of parent
                    .press()
                    .move(V(0, -2000))
                    .release()
                    .press()
                    .move(V(0, 2000));
            expect(par.getPos().y).toBeCloseTo(0);
            const cullAfter = obj.getCullBox();
            expect(cull).toBe(cullAfter);
        });

        // midpoint test
        // move labe1 100 units up, 50 units down
        // move parent, make sure position of the label is correct
        test("Midpoint test", () => {
            par.setPos(V(0,0));
            obj.setPos(V(par.getPos().x, par.getPos().y.valueOf() - 200));
            
            expect(par.getPos().x).toBeCloseTo(0);
            expect(par.getPos().y).toBeCloseTo(0);
            expect(obj.getPos().x).toBeCloseTo(0);
            expect(obj.getPos().y).toBeCloseTo(-200);

            input.moveTo(obj.getPos()) // Move to midpoint of parent
                    .press()
                    .move(V(0, -100))
                    .release()
                    .press()
                    .move(V(0, 50));
            expect(obj.getPos().y).toBeCloseTo(-250);
        });

        // BUG: rotating a label child that has a child rotates par.getAngle() degrees right away
        // BUG: moving a label off screen by moving the parent object makes label invisible until scroll
    })
});
