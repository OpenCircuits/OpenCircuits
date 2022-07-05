import {Vector} from "Vector";


describe("Vector", () => {
    describe("Constructor", () => {
        test("No parameters", () => {
            const v = new Vector();
            expect(v.x).toBe(0);
            expect(v.y).toBe(0);
        });
        test("One (number) parameter", () => {
            const v = new Vector(5);
            expect(v.x).toBe(5);
            expect(v.y).toBe(5);
        });
        test("Two (number) parameters", () => {
            const v = new Vector(5, 5);
            expect(v.x).toBe(5);
            expect(v.y).toBe(5);
        });
        test("One (vector) parameter", () => {
            const v1 = new Vector(5, 5);
            const v2 = new Vector(v1);
            expect(v2.x).toBe(5);
            expect(v2.y).toBe(5);
        });
    });

    describe("Operators", () => {
        test("Add (numbers)", () => {
            const v1 = new Vector(1, 1);
            const v2 = v1.add(5, 5);
            expect(v1.x).toBe(1);
            expect(v1.y).toBe(1);
            expect(v2.x).toBe(6);
            expect(v2.y).toBe(6);
        });
        test("Add (vector)", () => {
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
        test("Sub (numbers)", () => {
            const v1 = new Vector(6, 6);
            const v2 = v1.sub(5, 5);
            expect(v1.x).toBe(6);
            expect(v1.y).toBe(6);
            expect(v2.x).toBe(1);
            expect(v2.y).toBe(1);
        });
        test("Sub (vector)", () => {
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
        test("Scale (number)", () => {
            const v1 = new Vector(1, 2);
            const v2 = v1.scale(5);
            expect(v1.x).toBe(1);
            expect(v1.y).toBe(2);
            expect(v2.x).toBe(5);
            expect(v2.y).toBe(10);
        });
        test("Scale (vector)", () => {
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
        test("Copy", () => {
            const v1 = new Vector(2, 3);
            const v2 = v1.copy();
            expect(v1).not.toBe(v2);
            expect(v1.x).toBe(v2.x);
            expect(v1.y).toBe(v2.y);
        });
    });

    describe("Math", () => {
        test("Normalize", () => {
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
        test("Len", () => {
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
                expect(l).toBeCloseTo(582.193_266_879_7, 1e-3);
            }
        });
        test("Len2", () => {
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
                expect(l).toBe(338_949);
            }
        });
        test("DistanceTo", () => {
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
        test("Dot", () => {
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
        test("Project", () => {
            {
                const v1 = new Vector(8, 4);
                const v2 = new Vector(1, 0);
                const p1 = v1.project(v2);
                const p2 = v2.project(v1);
                expect(v1.x).toBe(8);
                expect(v1.y).toBe(4);
                expect(v2.x).toBe(1);
                expect(v2.y).toBe(0);
                expect(p1.x).toBeCloseTo(8, 1e-3);
                expect(p1.y).toBeCloseTo(0, 1e-3);
                expect(p2.x).toBeCloseTo(0.8, 1e-3);
                expect(p2.y).toBeCloseTo(0.4, 1e-3);
                const v3 = new Vector(2,2);
                const v4 = new Vector(-20,-5);
                const p3 = v3.project(v4);
                const p4 = v4.project(v3);
                expect(v3.x).toBe(2);
                expect(v3.y).toBe(2);
                expect(v4.x).toBe(-20);
                expect(v4.y).toBe(-5);
                expect(p3.x).toBeCloseTo(2.352_941, 1e-3);
                expect(p3.y).toBeCloseTo(0.588_235, 1e-3);
                expect(p4.x).toBeCloseTo(-12.5, 1e-3);
                expect(p4.y).toBeCloseTo(-12.5, 1e-3);
            }
        });
    });

    describe("Utility", () => {
        test("Min", () => {
            {
                const v1 = new Vector(5, 5);
                const v2 = new Vector(-5, 10);
                const min = Vector.Min(v1, v2);
                expect(min.x).toBe(-5);
                expect(min.y).toBe(5);
            }
        });
        test("Max", () => {
            {
                const v1 = new Vector(5, 5);
                const v2 = new Vector(-5, 10);
                const max = Vector.Max(v1, v2);
                expect(max.x).toBe(5);
                expect(max.y).toBe(10);
            }
        });
    });
});
