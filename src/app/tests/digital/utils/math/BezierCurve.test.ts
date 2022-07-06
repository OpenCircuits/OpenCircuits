import {V} from "Vector";

import {BezierCurve} from "math/BezierCurve";


describe("BezierCurve", () => {
    test("getP1 constructor", () => {
        const curve = new BezierCurve(V(0,0), V(6,6), V(0,2), V(4,0));
        const c = curve.getP1();
        expect(c).toEqual(V(0,0));
    });
    test("getP2 constructor", () => {
        const curve = new BezierCurve(V(0,0), V(6,6), V(0,2), V(4,0));
        const c = curve.getP2();
        expect(c).toEqual(V(6,6));
    });
    test("getC1 constructor", () => {
        const curve = new BezierCurve(V(0,0), V(6,6), V(0,2), V(4,0));
        const c = curve.getC1();
        expect(c).toEqual(V(0,2));
    });
    test("getC2 constructor", () => {
        const curve = new BezierCurve(V(0,0), V(6,6), V(0,2), V(4,0));
        const c = curve.getC2();
        expect(c).toEqual(V(4,0));
    });
    test("setP1", () => {
        const curve = new BezierCurve(V(0,0), V(6,6), V(0,2), V(4,0));
        curve.setP1(V(1,1));
        const c = curve.getP1();
        expect(c).toEqual(V(1,1));
    });
    test("setP2", () => {
        const curve = new BezierCurve(V(0,0), V(6,6), V(0,2), V(4,0));
        curve.setP2(V(5,5));
        const c = curve.getP2();
        expect(c).toEqual(V(5,5));
    });
    test("setC1", () => {
        const curve = new BezierCurve(V(0,0), V(6,6), V(0,2), V(4,0));
        curve.setC1(V(1,2));
        const c = curve.getC1();
        expect(c).toEqual(V(1,2));
    });
    test("setC2", () => {
        const curve = new BezierCurve(V(0,0), V(6,6), V(0,2), V(4,0));
        curve.setC2(V(4,4));
        const c = curve.getC2();
        expect(c).toEqual(V(4,4));
    });
    test("getX", () => {
        const curve = new BezierCurve(V(0,0), V(-2,5), V(1,2), V(2,0));
        const c = curve.getX(0.5);
        expect(c).toBe(0.875);
    });
    test("getY", () => {
        const curve = new BezierCurve(V(0,0), V(-2,5), V(1,2), V(2,0));
        const c = curve.getY(0.5);
        expect(c).toBe(1.375);
    });
    test("getPos", () => {
        const curve = new BezierCurve(V(0,0), V(-2,5), V(1,2), V(2,0));
        const c = curve.getPos(0.5);
        expect(c).toEqual(V(0.875,1.375));
    });
    test("basic getBoundingBox", () => {
        const curve = new BezierCurve(V(0,0), V(-2,5), V(0,4), V(2,0));
        const c = curve.getBoundingBox();
        const arr = c.getCorners();
        const expected = [V(-2,5), V(0.5,5), V(0.5,0), V(-2,0)];
        arr.forEach((_, i) => {
            expect(arr[i].x).toBeCloseTo(expected[i].x, 1e-3);
            expect(arr[i].y).toBeCloseTo(expected[i].y, 1e-3);
        });
    });
    test("irrational bound getBoundingBox", () => {
        const curve = new BezierCurve(V(6,6), V(-2,6), V(6,0), V(-0.5,6));
        const c = curve.getBoundingBox();
        const arr = c.getCorners();
        const expected = [V(-2,6), V(6,6), V(6,3.3333), V(-2,3.3333)];
        arr.forEach((_, i) => {
            expect(arr[i].x).toBeCloseTo(expected[i].x, 1e-3);
            expect(arr[i].y).toBeCloseTo(expected[i].y, 1e-3);
        });
    });
    test("spiral curve getBoundingBox", () => {
        const curve = new BezierCurve(V(1,2.5), V(0,1), V(6,0), V(-0.5,6));
        const c = curve.getBoundingBox();
        const arr = c.getCorners();
        const expected = [V(-0.027_69,3.06), V(2.901_32,3.06), V(2.901_32,1), V(-0.027_69,1)];
        arr.forEach((_, i) => {
            expect(arr[i].x).toBeCloseTo(expected[i].x, 1e-3);
            expect(arr[i].y).toBeCloseTo(expected[i].y, 1e-3);
        });
    });
    test("crossing curve getBoundingBox", () => {
        const curve = new BezierCurve(V(1,2), V(4,1), V(6,0), V(2,3));
        const c = curve.getBoundingBox();
        const arr = c.getCorners();
        const expected = [V(1,2), V(4,2), V(4,1), V(1,1)];
        arr.forEach((_, i) => {
            expect(arr[i].x).toBeCloseTo(expected[i].x, 1e-3);
            expect(arr[i].y).toBeCloseTo(expected[i].y, 1e-3);
        });
    });
    test("crazy crossing curve getBoundingBox", () => {
        const curve = new BezierCurve(V(1,2), V(4,1), V(6,0), V(-2,3));
        const c = curve.getBoundingBox();
        const arr = c.getCorners();
        const expected = [V(1,2), V(4,2), V(4,1), V(1,1)];
        arr.forEach((_, i) => {
            expect(arr[i].x).toBeCloseTo(expected[i].x, 1e-3);
            expect(arr[i].y).toBeCloseTo(expected[i].y, 1e-3);
        });
    });

});
