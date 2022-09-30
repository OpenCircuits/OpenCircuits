/* eslint-disable space-in-parens */
import {V, Vector} from "Vector";

import {Transform} from "math/Transform";

import "test/helpers/Extensions";

/*
    constructor(pos: Vector, size: Vector, angle: number = 0);

    updateMatrix(): void;
    updateSize(): void;
    updateCorners(): void;

    rotateAbout(a: number, c: Vector): void;

    setParent(t: Transform): void;
    setPos(p: Vector): void;
    setAngle(a: number): void;
    setScale(s: Vector): void;
    setSize(s: Vector): void;
    setWidth(w: number): void;
    setHeight(h: number): void;

    toLocalSpace(v: Vector): Vector;
    toWorldSpace(v: Vector): Vector;

    getParent(): ?Transform;
    getPos(): Vector;
    getAngle(): number;
    getScale(): Vector;
    getSize(): Vector;
    getRadius(): number;
    getMatrix(): Matrix2x3;
    getInverseMatrix(): Matrix2x3;
    getBottomLeft(): Vector;
    getBottomRight(): Vector;
    getTopRight(): Vector;
    getTopLeft(): Vector;
    getCorners(): Array<Vector>;
    getLocalCorners(): Array<Vector>;

    equals(other: Transform): boolean;
    print(): void;
    copy(): Transform;
*/


describe("Transform", () => {
    describe("Constructor", () => {
        test("No parameters", () => {
            expect(new Transform()).toEqual(new Transform(V(0, 0), V(1, 1), 0));
        });
        test("All parameters", () => {
            const transform = new Transform(V(5, 5), V(10, 10), 1);
            expect(transform.getPos()).toStrictEqual(V(5, 5));
            expect(transform.getSize()).toStrictEqual(V(10, 10));
            expect(transform.getAngle()).toBe(1);
        });
    });

    describe("Modifiers", () => {
        test("Rotate About", () => {
            {
                const t = new Transform(V(0,0), V(0,0), 0);
                const [pos, angle] = t.calcRotationAbout(Math.PI/2, V(0,0));
                expect(angle).toBeCloseTo(Math.PI/2, 1e-3);
                expect(pos.x).toBeCloseTo(0, 1e-3);
                expect(pos.y).toBeCloseTo(0, 1e-3);
            }
            {
                const t = new Transform(V(5,0), V(0,0), 0);
                const [pos, angle] = t.calcRotationAbout(Math.PI/2, V(0,0));
                expect(angle).toBeCloseTo(Math.PI/2, 1e-3);
                expect(pos.x).toBeCloseTo(0, 1e-3);
                expect(pos.y).toBeCloseTo(5, 1e-3);
            }
            {
                const t = new Transform(V(5,0), V(0,0), 0);
                const [pos, angle] = t.calcRotationAbout(3*Math.PI/4, V(0,0));
                expect(angle).toBeCloseTo(3*Math.PI/4, 1e-3);
                expect(pos.x).toBeCloseTo(-5*Math.sqrt(2)/2, 1e-3);
                expect(pos.y).toBeCloseTo(5*Math.sqrt(2)/2, 1e-3);
            }
            {
                const t = new Transform(V(0,5), V(0,0), 0);
                const [pos, angle] = t.calcRotationAbout(3*Math.PI/4, V(-5,0));
                expect(angle).toBeCloseTo(3*Math.PI/4, 1e-3);
                expect(pos.x).toBeCloseTo(-5 - Math.sqrt(5*5 + 5*5), 1e-3);
                expect(pos.y).toBeCloseTo(0, 1e-3);
            }
            {
                const t = new Transform(V(0,5), V(0,0), Math.PI/4);
                const [pos, angle] = t.calcRotationAbout(3*Math.PI/4, V(-5,0));
                expect(angle).toBeCloseTo(Math.PI, 1e-3);
                expect(pos.x).toBeCloseTo(-5 - Math.sqrt(5*5 + 5*5), 1e-3);
                expect(pos.y).toBeCloseTo(0, 1e-3);
            }
        });
        test("Set Parent", () => {
            const t1 = new Transform(V(0,0), V(0,0), 0);
            const t2 = new Transform(V(0,0), V(0,0), 0);
            expect(t2.getParent()).toBeUndefined();

            t2.setParent(t1);
            expect(t2.getParent()).toBe(t1);
        });
        test("Set Pos", () => {
            const t = new Transform(V(0,0), V(0,0), 0);
            const v = new Vector(5, 5);
            expect(t.getPos().x).toBe(0);
            expect(t.getPos().y).toBe(0);

            t.setPos(v);
            expect(t.getPos().x).toBe(5);
            expect(t.getPos().y).toBe(5);
            expect(v.x).toBe(5);
            expect(v.y).toBe(5);
        });
        test("Set Angle", () => {
            const t = new Transform(V(0,0), V(0,0), 0);
            expect(t.getAngle()).toBe(0);

            t.setAngle(53);
            expect(t.getAngle()).toBe(53);
        });
        test("Set Scale", () => {
            const t = new Transform(V(0,0), V(0,0), 0);
            const v = new Vector(5, 5);
            expect(t.getScale().x).toBe(1);
            expect(t.getScale().y).toBe(1);

            t.setScale(v);
            expect(t.getScale().x).toBe(5);
            expect(t.getScale().y).toBe(5);
            expect(v.x).toBe(5);
            expect(v.y).toBe(5);
        });
        test("Set Size", () => {
            const t = new Transform(V(0,0), V(0,0), 0);
            const v = new Vector(5, 5);
            expect(t.getSize().x).toBe(0);
            expect(t.getSize().y).toBe(0);
            expect(t.getRadius()).toBe(0);

            t.setSize(v);
            expect(t.getSize().x).toBe(5);
            expect(t.getSize().y).toBe(5);
            expect(t.getRadius()).toBeCloseTo(3.5355, 1e-3);
            expect(v.x).toBe(5);
            expect(v.y).toBe(5);
        });
        test("Set Width", () => {
            const t = new Transform(V(0,0), V(0,0), 0);
            expect(t.getSize().x).toBe(0);
            expect(t.getSize().y).toBe(0);
            expect(t.getRadius()).toBe(0);

            t.setWidth(5);
            expect(t.getSize().x).toBe(5);
            expect(t.getSize().y).toBe(0);
            expect(t.getRadius()).toBeCloseTo(2.5, 1e-3);
        });
        test("Set Height", () => {
            const t = new Transform(V(0,0), V(0,0), 0);
            expect(t.getSize().x).toBe(0);
            expect(t.getSize().y).toBe(0);
            expect(t.getRadius()).toBe(0);

            t.setHeight(5);
            expect(t.getSize().x).toBe(0);
            expect(t.getSize().y).toBe(5);
            expect(t.getRadius()).toBeCloseTo(2.5, 1e-3);
        });
    });

    // getBottomLeft(): Vector;
    // getBottomRight(): Vector;
    // getTopRight(): Vector;
    // getTopLeft(): Vector;
    // getCorners(): Array<Vector>;
    // getLocalCorners(): Array<Vector>;
    //
    // equals(other: Transform): boolean;
    // print(): void;
    // copy(): Transform;
    describe("Getters", () => {
        test("To Local Space", () => {
            { // Unit
                const t = new Transform(V(0, 0), V(1, 1), 0);
                expect(t.toLocalSpace(V(0,  0))).toApproximatelyEqual(V(0,  0));
                expect(t.toLocalSpace(V(5, -5))).toApproximatelyEqual(V(5, -5));
            }
            { // Translated
                const t = new Transform(V(5, -5), V(1, 1), 0);
                expect(t.toLocalSpace(V(0,  0))).toApproximatelyEqual(V(-5, 5));
                expect(t.toLocalSpace(V(5, -5))).toApproximatelyEqual(V( 0, 0));
            }
            { // Rotated
                const t = new Transform(V(0, 0), V(1, 1), Math.PI/2);
                expect(t.toLocalSpace(V(0,  0))).toApproximatelyEqual(V( 0,  0));
                expect(t.toLocalSpace(V(5, -5))).toApproximatelyEqual(V(-5, -5));
            }
            { // Translated and Rotated
                const t = new Transform(V(5, -5), V(1, 1), Math.PI/2);
                expect(t.toLocalSpace(V(0,  0))).toApproximatelyEqual(V( 5, 5));
                expect(t.toLocalSpace(V(5, -5))).toApproximatelyEqual(V( 0, 0));
                expect(t.toLocalSpace(V(5,  5))).toApproximatelyEqual(V(10, 0));
            }
        });
        test("To World Space", () => {
            { // Unit
                const t = new Transform(V(0, 0), V(1, 1), 0);
                expect(t.toWorldSpace(V(0,  0))).toApproximatelyEqual(V(0,  0));
                expect(t.toWorldSpace(V(5, -5))).toApproximatelyEqual(V(5, -5));
            }
            { // Translated
                const t = new Transform(V(5, -5), V(1, 1), 0);
                expect(t.toWorldSpace(V(0,  0))).toApproximatelyEqual(V( 5,  -5));
                expect(t.toWorldSpace(V(5, -5))).toApproximatelyEqual(V(10, -10));
            }
            { // Rotated
                const t = new Transform(V(0, 0), V(1, 1), Math.PI/2);
                expect(t.toWorldSpace(V(0,  0))).toApproximatelyEqual(V(0, 0));
                expect(t.toWorldSpace(V(5, -5))).toApproximatelyEqual(V(5, 5));
            }
            { // Translated and Rotated
                const t = new Transform(V(5, -5), V(1, 1), Math.PI/2);
                expect(t.toWorldSpace(V(0,  0))).toApproximatelyEqual(V( 5, -5));
                expect(t.toWorldSpace(V(5, -5))).toApproximatelyEqual(V(10,  0));
                expect(t.toWorldSpace(V(5,  5))).toApproximatelyEqual(V( 0,  0));
            }
        });
        test("Corners", () => {
            {
                const t = new Transform(V(0,0), V(5,5), 0);
                expect(t.getCorners()).toHaveLength(4);

                expect(t.getBottomLeft().x).toBeCloseTo(-2.5, 1e-3);
                expect(t.getBottomLeft().y).toBeCloseTo(-2.5, 1e-3);

                expect(t.getBottomRight().x).toBeCloseTo(2.5, 1e-3);
                expect(t.getBottomRight().y).toBeCloseTo(-2.5, 1e-3);

                expect(t.getTopRight().x).toBeCloseTo(2.5, 1e-3);
                expect(t.getTopRight().y).toBeCloseTo(2.5, 1e-3);

                expect(t.getTopLeft().x).toBeCloseTo(-2.5, 1e-3);
                expect(t.getTopLeft().y).toBeCloseTo(2.5, 1e-3);
            }
        });
        test("Copy", () => {
            const t1 = new Transform(V(4,3), V(7,5), 12);
            const t2 = t1.copy();

            expect(t1).not.toBe(t2);

            expect(t1.getPos().x).toBe(t2.getPos().x);
            expect(t1.getPos().y).toBe(t2.getPos().y);

            expect(t1.getSize().x).toBe(t2.getSize().x);
            expect(t1.getSize().y).toBe(t2.getSize().y);

            expect(t1.getScale().x).toBe(t2.getScale().x);
            expect(t1.getScale().y).toBe(t2.getScale().y);

            expect(t1.getAngle()).toBe(t2.getAngle());
        });
    });
});
