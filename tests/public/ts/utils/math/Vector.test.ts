import "jest";

import {Vector} from "../../../../../site/public/ts/utils/math/Vector";

describe("Vector", () => {
    describe("Constructor", () => {
        it("No parameters", () => {
            const v = new Vector();
            expect(v.x).toBe(0);
            expect(v.y).toBe(0);
        });
        it("One (number) parameter", () => {
            const v = new Vector(5);
            expect(v.x).toBe(5);
            expect(v.y).toBe(5);
        });
        it("Two (number) parameters", () => {
            const v = new Vector(5, 5);
            expect(v.x).toBe(5);
            expect(v.y).toBe(5);
        });
        it("One (vector) parameter", () => {
            const v1 = new Vector(5, 5);
            const v2 = new Vector(v1);
            expect(v2.x).toBe(5);
            expect(v2.y).toBe(5);
        });
    });
    describe("Operators", () => {
        it("Add (numbers)", () => {
            const v1 = new Vector(1, 1);
            const v2 = v1.add(5, 5);
            expect(v1.x).toBe(1);
            expect(v1.y).toBe(1);
            expect(v2.x).toBe(6);
            expect(v2.y).toBe(6);
        });
        it("Add (vector)", () => {
            const v1 = new Vector(1, 1);
            const v2 = new Vector(5, 5);
            const v3 = v1.add(v2);
            expect(v1.x).toBe(1);
            expect(v1.y).toBe(1);
            expect(v2.x).toBe(5);
            expect(v2.y).toBe(5);
            expect(v3.x).toBe(6);
            expect(v3.y).toBe(6);
        });
        it("Sub (numbers)", () => {
            const v1 = new Vector(6, 6);
            const v2 = v1.sub(5, 5);
            expect(v1.x).toBe(6);
            expect(v1.y).toBe(6);
            expect(v2.x).toBe(1);
            expect(v2.y).toBe(1);
        });
        it("Sub (vector)", () => {
            const v1 = new Vector(6, 6);
            const v2 = new Vector(5, 5);
            const v3 = v1.sub(v2);
            expect(v1.x).toBe(6);
            expect(v1.y).toBe(6);
            expect(v2.x).toBe(5);
            expect(v2.y).toBe(5);
            expect(v3.x).toBe(1);
            expect(v3.y).toBe(1);
        });
        it("Scale (number)", () => {
            const v1 = new Vector(1, 2);
            const v2 = v1.scale(5);
            expect(v1.x).toBe(1);
            expect(v1.y).toBe(2);
            expect(v2.x).toBe(5);
            expect(v2.y).toBe(10);
        });
        it("Scale (vector)", () => {
            const v1 = new Vector(2, 3);
            const v2 = new Vector(5, 10);
            const v3 = v1.scale(v2);
            expect(v1.x).toBe(2);
            expect(v1.y).toBe(3);
            expect(v2.x).toBe(5);
            expect(v2.y).toBe(10);
            expect(v3.x).toBe(10);
            expect(v3.y).toBe(30);
        });
        it("Copy", () => {
            const v1 = new Vector(2, 3);
            const v2 = v1.copy();
            expect(v1).not.toBe(v2);
            expect(v1.x).toBe(v2.x);
            expect(v1.y).toBe(v2.y);
        });
    });
    describe("Math", () => {
        it("Normalize", () => {
            {
                const v = new Vector(5, 0);
                const n = v.normalize();
                expect(v.x).toBe(5);
                expect(v.y).toBe(0);
                expect(n.x).toBe(1);
                expect(n.y).toBe(0);
            }
            {
                const v = new Vector(0, 0);
                const n = v.normalize();
                expect(v.x).toBe(0);
                expect(v.y).toBe(0);
                expect(n.x).toBe(0);
                expect(n.y).toBe(0);
            }
            {
                const v = new Vector(1, 1);
                const n = v.normalize();
                expect(v.x).toBe(1);
                expect(v.y).toBe(1);
                expect(n.x).toBeCloseTo(Math.sqrt(2)/2, 1e-3);
                expect(n.y).toBeCloseTo(Math.sqrt(2)/2, 1e-3);
            }
        });
        it("Len", () => {
            {
                const v = new Vector(0, 0);
                const l = v.len();
                expect(v.x).toBe(0);
                expect(v.y).toBe(0);
                expect(l).toBeCloseTo(0, 1e-3);
            }
            {
                const v = new Vector(5, 0);
                const l = v.len();
                expect(v.x).toBe(5);
                expect(v.y).toBe(0);
                expect(l).toBeCloseTo(5, 1e-3);
            }
            {
                const v = new Vector(3, 4);
                const l = v.len();
                expect(v.x).toBe(3);
                expect(v.y).toBe(4);
                expect(l).toBeCloseTo(5, 1e-3);
            }
            {
                const v = new Vector(543, 210);
                const l = v.len();
                expect(v.x).toBe(543);
                expect(v.y).toBe(210);
                expect(l).toBeCloseTo(582.1932668797, 1e-3);
            }
        });
        it("Len2", () => {
            {
                const v = new Vector(0, 0);
                const l = v.len2();
                expect(v.x).toBe(0);
                expect(v.y).toBe(0);
                expect(l).toBe(0);
            }
            {
                const v = new Vector(5, 0);
                const l = v.len2();
                expect(v.x).toBe(5);
                expect(v.y).toBe(0);
                expect(l).toBe(25);
            }
            {
                const v = new Vector(3, 4);
                const l = v.len2();
                expect(v.x).toBe(3);
                expect(v.y).toBe(4);
                expect(l).toBe(25);
            }
            {
                const v = new Vector(543, 210);
                const l = v.len2();
                expect(v.x).toBe(543);
                expect(v.y).toBe(210);
                expect(l).toBe(338949);
            }
        });
        it("DistanceTo", () => {
            {
                const v1 = new Vector(1, 2);
                const v2 = new Vector(4, 6);
                const d = v1.distanceTo(v2);
                expect(v1.x).toBe(1);
                expect(v1.y).toBe(2);
                expect(v2.x).toBe(4);
                expect(v2.y).toBe(6);
                expect(d).toBeCloseTo(5, 1e-3);
            }
        });
        it("Dot", () => {
            {
                const v1 = new Vector(1, 2);
                const v2 = new Vector(4, 6);
                const d = v1.dot(v2);
                expect(v1.x).toBe(1);
                expect(v1.y).toBe(2);
                expect(v2.x).toBe(4);
                expect(v2.y).toBe(6);
                expect(d).toBe(16);
            }
        });
        it("Project", () => {
            {
                const v1 = new Vector(8, 4);
                const v2 = new Vector(1, 0);
                const p = v1.project(v2);
                expect(v1.x).toBe(8);
                expect(v1.y).toBe(4);
                expect(v2.x).toBe(1);
                expect(v2.y).toBe(0);
                expect(p.x).toBeCloseTo(0.8, 1e-3);
                expect(p.y).toBeCloseTo(0.4, 1e-3);
            }
        });
    });
    describe("Utility", () => {
        it("Min", () => {
            {
                const v1 = new Vector(5, 5);
                const v2 = new Vector(-5, 10);
                const min = Vector.min(v1, v2);
                expect(min.x).toBe(-5);
                expect(min.y).toBe(5);
            }
        });
        it("Max", () => {
            {
                const v1 = new Vector(5, 5);
                const v2 = new Vector(-5, 10);
                const max = Vector.max(v1, v2);
                expect(max.x).toBe(5);
                expect(max.y).toBe(10);
            }
        });
    });
});
