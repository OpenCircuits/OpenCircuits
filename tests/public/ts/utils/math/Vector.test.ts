import "jest";

import {Vector} from "../../../../../site/public/ts/utils/math/Vector";

describe("Vector", () => {
    describe("Constructor", () => {
        it("No parameters", () => {
            var v = new Vector();
            expect(v.x).toBe(0);
            expect(v.y).toBe(0);
        });
        it("One (number) parameter", () => {
            var v = new Vector(5);
            expect(v.x).toBe(5);
            expect(v.y).toBe(0);
        });
        it("Two (number) parameters", () => {
            var v = new Vector(5, 5);
            expect(v.x).toBe(5);
            expect(v.y).toBe(5);
        });
        it("One (vector) parameter", () => {
            var v1 = new Vector(5, 5);
            var v2 = new Vector(v1);
            expect(v1.x).toBe(5);
            expect(v1.y).toBe(5);
        });
    });
    describe("Modifiers", () => {
        it("Translate (numbers)", () => {
            var v = new Vector(1, 1);
            v.translate(5, 5);
            expect(v.x).toBe(6);
            expect(v.y).toBe(6);
        });
        it("Translate (vector)", () => {
            var v1 = new Vector(1, 1);
            var v2 = new Vector(5, 5);
            v1.translate(v2);
            expect(v2.x).toBe(5);
            expect(v2.y).toBe(5);
            expect(v1.x).toBe(6);
            expect(v1.y).toBe(6);
        });
    });
    describe("Operators", () => {
        it("Add (numbers)", () => {
            var v1 = new Vector(1, 1);
            var v2 = v1.add(5, 5);
            expect(v1.x).toBe(1);
            expect(v1.y).toBe(1);
            expect(v2.x).toBe(6);
            expect(v2.y).toBe(6);
        });
        it("Add (vector)", () => {
            var v1 = new Vector(1, 1);
            var v2 = new Vector(5, 5);
            var v3 = v1.add(v2);
            expect(v1.x).toBe(1);
            expect(v1.y).toBe(1);
            expect(v2.x).toBe(5);
            expect(v2.y).toBe(5);
            expect(v3.x).toBe(6);
            expect(v3.y).toBe(6);
        });
        it("Sub (numbers)", () => {
            var v1 = new Vector(6, 6);
            var v2 = v1.sub(5, 5);
            expect(v1.x).toBe(6);
            expect(v1.y).toBe(6);
            expect(v2.x).toBe(1);
            expect(v2.y).toBe(1);
        });
        it("Sub (vector)", () => {
            var v1 = new Vector(6, 6);
            var v2 = new Vector(5, 5);
            var v3 = v1.sub(v2);
            expect(v1.x).toBe(6);
            expect(v1.y).toBe(6);
            expect(v2.x).toBe(5);
            expect(v2.y).toBe(5);
            expect(v3.x).toBe(1);
            expect(v3.y).toBe(1);
        });
        it("Scale (number)", () => {
            var v1 = new Vector(1, 2);
            var v2 = v1.scale(5);
            expect(v1.x).toBe(1);
            expect(v1.y).toBe(2);
            expect(v2.x).toBe(5);
            expect(v2.y).toBe(10);
        });
        it("Scale (vector)", () => {
            var v1 = new Vector(2, 3);
            var v2 = new Vector(5, 10);
            var v3 = v1.scale(v2);
            expect(v1.x).toBe(2);
            expect(v1.y).toBe(3);
            expect(v2.x).toBe(5);
            expect(v2.y).toBe(10);
            expect(v3.x).toBe(10);
            expect(v3.y).toBe(30);
        });
        it("Copy", () => {
            var v1 = new Vector(2, 3);
            var v2 = v1.copy();
            expect(v1).not.toBe(v2);
            expect(v1.x).toBe(v2.x);
            expect(v1.y).toBe(v2.y);
        });
    });
    describe("Math", () => {
        it("Normalize", () => {
            {
                var v = new Vector(5, 0);
                var n = v.normalize();
                expect(v.x).toBe(5);
                expect(v.y).toBe(0);
                expect(n.x).toBe(1);
                expect(n.y).toBe(0);
            }
            {
                var v = new Vector(0, 0);
                var n = v.normalize();
                expect(v.x).toBe(0);
                expect(v.y).toBe(0);
                expect(n.x).toBe(0);
                expect(n.y).toBe(0);
            }
            {
                var v = new Vector(1, 1);
                var n = v.normalize();
                expect(v.x).toBe(1);
                expect(v.y).toBe(1);
                expect(n.x).toBeCloseTo(Math.sqrt(2)/2, 1e-3);
                expect(n.y).toBeCloseTo(Math.sqrt(2)/2, 1e-3);
            }
        });
        it("Len", () => {
            {
                var v = new Vector(0, 0);
                var l = v.len();
                expect(v.x).toBe(0);
                expect(v.y).toBe(0);
                expect(l).toBeCloseTo(0, 1e-3);
            }
            {
                var v = new Vector(5, 0);
                var l = v.len();
                expect(v.x).toBe(5);
                expect(v.y).toBe(0);
                expect(l).toBeCloseTo(5, 1e-3);
            }
            {
                var v = new Vector(3, 4);
                var l = v.len();
                expect(v.x).toBe(3);
                expect(v.y).toBe(4);
                expect(l).toBeCloseTo(5, 1e-3);
            }
            {
                var v = new Vector(543, 210);
                var l = v.len();
                expect(v.x).toBe(543);
                expect(v.y).toBe(210);
                expect(l).toBeCloseTo(582.1932668797, 1e-3);
            }
        });
        it("Len2", () => {
            {
                var v = new Vector(0, 0);
                var l = v.len2();
                expect(v.x).toBe(0);
                expect(v.y).toBe(0);
                expect(l).toBe(0);
            }
            {
                var v = new Vector(5, 0);
                var l = v.len2();
                expect(v.x).toBe(5);
                expect(v.y).toBe(0);
                expect(l).toBe(25);
            }
            {
                var v = new Vector(3, 4);
                var l = v.len2();
                expect(v.x).toBe(3);
                expect(v.y).toBe(4);
                expect(l).toBe(25);
            }
            {
                var v = new Vector(543, 210);
                var l = v.len2();
                expect(v.x).toBe(543);
                expect(v.y).toBe(210);
                expect(l).toBe(338949);
            }
        });
        it("DistanceTo", () => {
            {
                var v1 = new Vector(1, 2);
                var v2 = new Vector(4, 6);
                var d = v1.distanceTo(v2);
                expect(v1.x).toBe(1);
                expect(v1.y).toBe(2);
                expect(v2.x).toBe(4);
                expect(v2.y).toBe(6);
                expect(d).toBeCloseTo(5, 1e-3);
            }
        });
        it("Dot", () => {
            {
                var v1 = new Vector(1, 2);
                var v2 = new Vector(4, 6);
                var d = v1.dot(v2);
                expect(v1.x).toBe(1);
                expect(v1.y).toBe(2);
                expect(v2.x).toBe(4);
                expect(v2.y).toBe(6);
                expect(d).toBe(16);
            }
        });
        it("Project", () => {
            {
                var v1 = new Vector(8, 4);
                var v2 = new Vector(1, 0);
                var p = v1.project(v2);
                expect(v1.x).toBe(8);
                expect(v1.y).toBe(4);
                expect(v2.x).toBe(1);
                expect(v2.y).toBe(0);
                expect(p.x).toBeCloseTo(0.8, 1e-3);
                expect(p.y).toBeCloseTo(0.4, 1e-3);
            }
        });
    });
});
