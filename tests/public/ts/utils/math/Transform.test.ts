import "jest";

import {Vector,V}  from "../../../../../site/public/ts/utils/math/Vector";
import {Transform} from "../../../../../site/public/ts/utils/math/Transform";

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
        it("No parameters", () => {
            var t = new Transform(V(0,0), V(0,0), 0);
            // tests
        });
        it("All parameters", () => {
            var t = new Transform(V(5, 5), V(10, 10), 0);
            // tests
        });
    });
    describe("Modifiers", () => {
        it("Rotate About", () => {
            {
                var t = new Transform(V(0,0), V(0,0), 0);
                t.rotateAbout(Math.PI/2, V(0,0));
                expect(t.getAngle()).toBeCloseTo(Math.PI/2, 1e-3);
                expect(t.getPos().x).toBeCloseTo(0, 1e-3);
                expect(t.getPos().y).toBeCloseTo(0, 1e-3);
            }
            {
                var t = new Transform(V(5,0), V(0,0), 0);
                t.rotateAbout(Math.PI/2, V(0,0));
                expect(t.getAngle()).toBeCloseTo(Math.PI/2, 1e-3);
                expect(t.getPos().x).toBeCloseTo(0, 1e-3);
                expect(t.getPos().y).toBeCloseTo(5, 1e-3);
            }
            {
                var t = new Transform(V(5,0), V(0,0), 0);
                t.rotateAbout(3*Math.PI/4, V(0,0));
                expect(t.getAngle()).toBeCloseTo(3*Math.PI/4, 1e-3);
                expect(t.getPos().x).toBeCloseTo(-5*Math.sqrt(2)/2, 1e-3);
                expect(t.getPos().y).toBeCloseTo(5*Math.sqrt(2)/2, 1e-3);
            }
            {
                var t = new Transform(V(0,5), V(0,0), 0);
                t.rotateAbout(3*Math.PI/4, V(-5,0));
                expect(t.getAngle()).toBeCloseTo(3*Math.PI/4, 1e-3);
                expect(t.getPos().x).toBeCloseTo(-5 - Math.sqrt(5*5 + 5*5), 1e-3);
                expect(t.getPos().y).toBeCloseTo(0, 1e-3);
            }
            {
                var t = new Transform(V(0,5), V(0,0), Math.PI/4);
                t.rotateAbout(3*Math.PI/4, V(-5,0));
                expect(t.getAngle()).toBeCloseTo(Math.PI, 1e-3);
                expect(t.getPos().x).toBeCloseTo(-5 - Math.sqrt(5*5 + 5*5), 1e-3);
                expect(t.getPos().y).toBeCloseTo(0, 1e-3);
            }
        });
        it("Set Parent", () => {
            var t1 = new Transform(V(0,0), V(0,0), 0);
            var t2 = new Transform(V(0,0), V(0,0), 0);
            expect(t2.getParent()).toBe(undefined);

            t2.setParent(t1);
            expect(t2.getParent()).toBe(t1);
        });
        it("Set Pos", () => {
            var t = new Transform(V(0,0), V(0,0), 0);
            var v = new Vector(5, 5);
            expect(t.getPos().x).toBe(0);
            expect(t.getPos().y).toBe(0);

            t.setPos(v);
            expect(t.getPos().x).toBe(5);
            expect(t.getPos().y).toBe(5);
            expect(v.x).toBe(5);
            expect(v.y).toBe(5);
        });
        it("Set Angle", () => {
            var t = new Transform(V(0,0), V(0,0), 0);
            expect(t.getAngle()).toBe(0);

            t.setAngle(53);
            expect(t.getAngle()).toBe(53);
        });
        it("Set Scale", () => {
            var t = new Transform(V(0,0), V(0,0), 0);
            var v = new Vector(5, 5);
            expect(t.getScale().x).toBe(1);
            expect(t.getScale().y).toBe(1);

            t.setScale(v);
            expect(t.getScale().x).toBe(5);
            expect(t.getScale().y).toBe(5);
            expect(v.x).toBe(5);
            expect(v.y).toBe(5);
        });
        it("Set Size", () => {
            var t = new Transform(V(0,0), V(0,0), 0);
            var v = new Vector(5, 5);
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
        it("Set Width", () => {
            var t = new Transform(V(0,0), V(0,0), 0);
            expect(t.getSize().x).toBe(0);
            expect(t.getSize().y).toBe(0);
            expect(t.getRadius()).toBe(0);

            t.setWidth(5);
            expect(t.getSize().x).toBe(5);
            expect(t.getSize().y).toBe(0);
            expect(t.getRadius()).toBeCloseTo(2.5, 1e-3);
        });
        it("Set Height", () => {
            var t = new Transform(V(0,0), V(0,0), 0);
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
        it("To Local Space", () => {
            var v = new Vector();
            var t = new Transform(V(0,0), V(0,0), 0);
            // stuff
            var v2 = t.toLocalSpace(v);
            // tests
        });
        it("To World Space", () => {
            var v = new Vector();
            var t = new Transform(V(0,0), V(0,0), 0);
            // stuff
            var v2 = t.toWorldSpace(v);
            // tests
        });
        it("Corners", () => {
            {
                var t = new Transform(V(0,0), V(5,5), 0);
                expect(t.getCorners().length).toBe(4);

                expect(t.getBottomLeft().x).toBeCloseTo(-2.5, 1e-3);
                expect(t.getBottomLeft().y).toBeCloseTo(2.5, 1e-3);

                expect(t.getBottomRight().x).toBeCloseTo(2.5, 1e-3);
                expect(t.getBottomRight().y).toBeCloseTo(2.5, 1e-3);

                expect(t.getTopRight().x).toBeCloseTo(2.5, 1e-3);
                expect(t.getTopRight().y).toBeCloseTo(-2.5, 1e-3);

                expect(t.getTopLeft().x).toBeCloseTo(-2.5, 1e-3);
                expect(t.getTopLeft().y).toBeCloseTo(-2.5, 1e-3);
            }
        });
        it("Copy", () => {
            var t1 = new Transform(V(4,3), V(7,5), 12);
            var t2 = t1.copy();

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
