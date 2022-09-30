import {Vector} from "Vector";

import {Matrix2x3} from "math/Matrix";


describe("Matrix2x3", () => {
    describe("Constructor", () => {
        test("No parameters", () => {
            const m = new Matrix2x3();
                                    // [1 0 0]
                                    // [0 1 0]
            expect(m["mat"]).toEqual([1, 0, 0, 1, 0, 0]);
        });
        test("One (matrix) parameter", () => {
            const m1 = new Matrix2x3();
            m1["mat"] = [6, 5, 4, 3, 2, 1];
            const m2 = new Matrix2x3(m1);
                                    // [6 4 2]
                                    // [5 3 1]
            expect(m1["mat"]).toEqual([6, 5, 4, 3, 2, 1]);
            expect(m1["mat"]).not.toBe(m2["mat"]);
                                    // [6 4 2]
                                    // [5 3 1]
            expect(m2["mat"]).toEqual([6, 5, 4, 3, 2, 1]);
        });
    });

    describe("Modifiers", () => {
        test("Zero", () => {
            const m = new Matrix2x3();
            m.zero();
            expect(m["mat"]).toEqual([0, 0, 0, 0, 0, 0]);
        });
        test("Identity", () => {
            const m = new Matrix2x3();
            m["mat"] = [0, 0, 0, 0, 0, 0];
            m.identity();
                                    // [1 0 0]
                                    // [0 1 0]
            expect(m["mat"]).toEqual([1, 0, 0, 1, 0, 0]);
        });
        test("Translate", () => {
            {
                const m = new Matrix2x3();
                const v = new Vector(5, -2);
                m.translate(v);
                expect(v.x).toBe(5);
                expect(v.y).toBe(-2);
                                        // [1 0  5]
                                        // [0 1 -2]
                expect(m["mat"]).toEqual([1, 0, 0, 1, 5, -2]);
            }
            {
                const m = new Matrix2x3();
                m["mat"] = [1, 2, 3, 4, 0, 0];
                const v = new Vector(5, -2);
                m.translate(v);
                expect(v.x).toBe(5);
                expect(v.y).toBe(-2);
                                        // [1 3 -1]
                                        // [2 4  2]
                expect(m["mat"]).toEqual([1, 2, 3, 4, -1, 2]);
            }
        });
        test("Rotate", () => {
            {
                const m = new Matrix2x3();
                m.rotate(Math.PI / 2);
                                        // [0 -1 0]
                                        // [1  0 0]
                /* eslint-disable space-in-parens */
                expect(m["mat"][0]).toBeCloseTo( 0, 1e-3);
                expect(m["mat"][1]).toBeCloseTo( 1, 1e-3);
                expect(m["mat"][2]).toBeCloseTo(-1, 1e-3);
                expect(m["mat"][3]).toBeCloseTo( 0, 1e-3);
                /* eslint-enable space-in-parens */
                expect(m["mat"][4]).toBe(0);
                expect(m["mat"][5]).toBe(0);
            }
            {
                const m = new Matrix2x3();
                m.rotate(Math.PI / 4);
                                        // [0.707 -0.707 0]
                                        // [0.707  0.707 0]
                /* eslint-disable space-in-parens */
                expect(m["mat"][0]).toBeCloseTo( Math.sqrt(2)/2, 1e-3);
                expect(m["mat"][1]).toBeCloseTo( Math.sqrt(2)/2, 1e-3);
                expect(m["mat"][2]).toBeCloseTo(-Math.sqrt(2)/2, 1e-3);
                expect(m["mat"][3]).toBeCloseTo( Math.sqrt(2)/2, 1e-3);
                /* eslint-enable space-in-parens */
                expect(m["mat"][4]).toBe(0);
                expect(m["mat"][5]).toBe(0);
            }
        });
        test("Scale", () => {
            {
                const m = new Matrix2x3();
                const v = new Vector(5, -2);
                m.scale(v);
                expect(v.x).toBe(5);
                expect(v.y).toBe(-2);
                                        // [5  0 -0]
                                        // [0 -2  0]
                expect(m["mat"]).toEqual([5, 0, -0, -2, 0, 0]);
            }
            {
                const m = new Matrix2x3();
                m["mat"] = [1, 2, 3, 4, 0, 0];
                const v = new Vector(5, -2);
                m.scale(v);
                expect(v.x).toBe(5);
                expect(v.y).toBe(-2);
                                        // [5  -6 0]
                                        // [10 -8 0]
                expect(m["mat"]).toEqual([5, 10, -6, -8, 0, 0]);
            }
        });
    });

    describe("Operators", () => {
        test("Mul", () => {
            const m = new Matrix2x3();
            m["mat"] = [1, 2, 3, 4, 5, 6];
            const v1 = new Vector(-1, -2);
            const v2 = m.mul(v1);
            expect(v1.x).toBe(-1);
            expect(v1.y).toBe(-2);
            expect(v2.x).toBe(-2);
            expect(v2.y).toBe(-4);
        });
        test("Mult", () => {
            const m1 = new Matrix2x3();
            m1["mat"] = [1, 2, 3, 4, 5, 6];
            const m2 = new Matrix2x3();
            m2["mat"] = [6, 5, 4, 3, 2, 1];
            const m3 = m1.mult(m2);
                                    // [1 3 5]
                                    // [2 4 6]
            expect(m1["mat"]).toEqual([1, 2, 3, 4, 5, 6]);
                                    // [6 4 2]
                                    // [5 3 1]
            expect(m2["mat"]).toEqual([6, 5, 4, 3, 2, 1]);
                                    // [21 13 10]
                                    // [32 20 14]
            expect(m3["mat"]).toEqual([21, 32, 13, 20, 10, 14]);
        });
        test("Inverse", () => {
            {
                const m = new Matrix2x3();
                const i = m.inverse();
                                        // [1 0 0]
                                        // [0 1 0]
                expect(m["mat"]).toEqual([1, 0, 0, 1, 0, 0]);
                                        // [1 -0 -0]
                                        // [0  1  0]
                expect(i["mat"]).toEqual([1, -0, -0, 1, 0, 0]);
            }
            {
                const m = new Matrix2x3();
                m["mat"] = [1, 2, 3, 4, 5, 6];
                const i = m.inverse();
                                        // [1 3 5]
                                        // [2 4 6]
                expect(m["mat"]).toEqual([1, 2, 3, 4, 5, 6]);
                                        // [-2  1.5  1]
                                        // [ 1 -0.5 -2]
                expect(i["mat"]).toEqual([-2, 1, 1.5, -0.5, 1, -2]);
            }
        });
    });
});
