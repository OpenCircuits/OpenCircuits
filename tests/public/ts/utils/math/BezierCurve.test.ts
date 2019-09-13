import "jest";

import {V} from "Vector";
import {BezierCurve} from "math/BezierCurve";


describe("BezierCurve", () => {
    it("getP1 constructor", () => {
        const curve = new BezierCurve(V(0,0), V(6,6), V(0,2), V(4,0));
        const c = curve.getP1();
        expect(c).toEqual(V(0,0));
    });
    it("getP2 constructor", () => {
        const curve = new BezierCurve(V(0,0), V(6,6), V(0,2), V(4,0));
        const c = curve.getP2();
        expect(c).toEqual(V(6,6));
    });
    it("getC1 constructor", () => {
        const curve = new BezierCurve(V(0,0), V(6,6), V(0,2), V(4,0));
        const c = curve.getC1();
        expect(c).toEqual(V(0,2));
    });
    it("getC2 constructor", () => {
        const curve = new BezierCurve(V(0,0), V(6,6), V(0,2), V(4,0));
        const c = curve.getC2();
        expect(c).toEqual(V(4,0));
    });
    it("setP1", () => {
        const curve = new BezierCurve(V(0,0), V(6,6), V(0,2), V(4,0));
        curve.setP1(V(1,1));
        const c = curve.getP1();
        expect(c).toEqual(V(1,1));
    });
    it("setP2", () => {
        const curve = new BezierCurve(V(0,0), V(6,6), V(0,2), V(4,0));
        curve.setP2(V(5,5));
        const c = curve.getP2();
        expect(c).toEqual(V(5,5));
    });
    it("setC1", () => {
        const curve = new BezierCurve(V(0,0), V(6,6), V(0,2), V(4,0));
        curve.setC1(V(1,2));
        const c = curve.getC1();
        expect(c).toEqual(V(1,2));
    });
    it("setC2", () => {
        const curve = new BezierCurve(V(0,0), V(6,6), V(0,2), V(4,0));
        curve.setC2(V(4,4));
        const c = curve.getC2();
        expect(c).toEqual(V(4,4));
    });
    it("getX", () => {
        const curve = new BezierCurve(V(0,0), V(-2,5), V(1,2), V(2,0));
        const c = curve.getX(0.5);
        expect(c).toEqual(0.875);
    });
    it("getY", () => {
        const curve = new BezierCurve(V(0,0), V(-2,5), V(1,2), V(2,0));
        const c = curve.getY(0.5);
        expect(c).toEqual(1.375);
    });
    it("getPos", () => {
        const curve = new BezierCurve(V(0,0), V(-2,5), V(1,2), V(2,0));
        const c = curve.getPos(0.5);
        expect(c).toEqual(V(0.875,1.375));
    });
    it("basic getBoundingBox", () => {
        const curve = new BezierCurve(V(0,0), V(-2,5), V(0,4), V(2,0));
        const c = curve.getBoundingBox();
        const arr = c.getCorners();
        const expected = [V(-2,5), V(0.5,5), V(0.5,0), V(-2,0)];
        arr.forEach((v, i) => {
            expect(arr[i].x).toBeCloseTo(expected[i].x, 1e-3);
            expect(arr[i].y).toBeCloseTo(expected[i].y, 1e-3);
        });
    });
    it("irrational bound getBoundingBox", () => {
        const curve = new BezierCurve(V(6,6), V(-2,6), V(6,0), V(-0.5,6));
        const c = curve.getBoundingBox();
        const arr = c.getCorners();
        const expected = [V(-2,6), V(6,6), V(6,3.3333), V(-2,3.3333)];
        arr.forEach((v, i) => {
            expect(arr[i].x).toBeCloseTo(expected[i].x, 1e-3);
            expect(arr[i].y).toBeCloseTo(expected[i].y, 1e-3);
        });
    });
    it("spiral curve getBoundingBox", () => {
        const curve = new BezierCurve(V(1,2.5), V(0,1), V(6,0), V(-0.5,6));
        const c = curve.getBoundingBox();
        const arr = c.getCorners();
        const expected = [V(-0.02769,3.06), V(2.90132,3.06), V(2.90132,1), V(-0.02769,1)];
        arr.forEach((v, i) => {
            expect(arr[i].x).toBeCloseTo(expected[i].x, 1e-3);
            expect(arr[i].y).toBeCloseTo(expected[i].y, 1e-3);
        });
    });
    it("crossing curve getBoundingBox", () => {
        const curve = new BezierCurve(V(1,2), V(4,1), V(6,0), V(2,3));
        const c = curve.getBoundingBox();
        const arr = c.getCorners();
        const expected = [V(1,2), V(4,2), V(4,1), V(1,1)];
        arr.forEach((v, i) => {
            expect(arr[i].x).toBeCloseTo(expected[i].x, 1e-3);
            expect(arr[i].y).toBeCloseTo(expected[i].y, 1e-3);
        });
    });
    it("crazy crossing curve getBoundingBox", () => {
        const curve = new BezierCurve(V(1,2), V(4,1), V(6,0), V(-2,3));
        const c = curve.getBoundingBox();
        const arr = c.getCorners();
        const expected = [V(1,2), V(4,2), V(4,1), V(1,1)];
        arr.forEach((v, i) => {
            expect(arr[i].x).toBeCloseTo(expected[i].x, 1e-3);
            expect(arr[i].y).toBeCloseTo(expected[i].y, 1e-3);
        });
    });

});
