import "jest";

import {Clamp, TransformContains, RectContains} from "../../../../../site/public/ts/utils/math/MathUtils";
import {Vector, V} from "../../../../../site/public/ts/utils/math/Vector";
import {Transform} from "../../../../../site/public/ts/utils/math/Transform";

describe("Clamp", () => {
    it("less than minimum", () => {
        var x   = 1;
        var min = 2;
        var max = 3;
        var c = Clamp(x, min, max);
        expect(c).toEqual(2);
    });
    it("in between", () => {
        var x   = 2;
        var min = 1;
        var max = 3;
        var c = Clamp(x, min, max);
        expect(c).toEqual(2);
    });
    it("more than maximum", () => {
        var x   = 7;
        var min = 2;
        var max = 3;
        var c = Clamp(x, min, max);
        expect(c).toEqual(3);
    });
    it("all equal", () => {
        var x   = 5;
        var min = 5;
        var max = 5;
        var c = Clamp(x, min, max);
        expect(c).toEqual(5);
    });
});

describe("TransformContains", () => {
    it("identical", () => {
        var t1 = new Transform(V(1,-1), V(1,1), 0);
        var t2 = new Transform(V(1,-1), V(1,1), 0);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("t1 inside t2", () => {
        var t1 = new Transform(V(0,-2), V(1,1), 0);
        var t2 = new Transform(V(0,-2), V(2,4), 270);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("opposing quadrants", () => {
        var t1 = new Transform(V(-1,1), V(1,1), 0);
        var t2 = new Transform(V(1,-1), V(1,1), 0);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(false);
    });
    it("intersects on t1 left", () => {
        var t1 = new Transform(V(0,0),  V(1,1), 0);
        var t2 = new Transform(V(-1,0), V(3,2), 0);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("intersects on t1 left", () => {
        var t1 = new Transform(V(0,0),  V(3,2), 0);
        var t2 = new Transform(V(-1,0), V(3,2), 0);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("intersects on t1 right", () => {
        var t1 = new Transform(V(-1,0), V(3,2), 0);
        var t2 = new Transform(V(0,0),  V(3,2), 0);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("intersects on t1 top", () => {
        var t1 = new Transform(V(0,0),  V(4,2), 0);
        var t2 = new Transform(V(0,-1), V(4,2), 0);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("intersects on t1 bottom", () => {
        var t1 = new Transform(V(0,0),  V(4,2), 0);
        var t2 = new Transform(V(0,-1), V(4,2), 0);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("t1 rotated, intersecting", () => {
        var t1 = new Transform(V(-1,1), V(4,2), 180);
        var t2 = new Transform(V(1,-1), V(4,2), 0);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("t1 rotated, not intersecting", () => {
        var t1 = new Transform(V(-1,1), V(1,1), 0);
        var t2 = new Transform(V(1,-1), V(1,1), 0);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(false);
    });
    it("t2 rotated, intersecting on t1 left", () => {
        var t1 = new Transform(V(0,0), V(2,2), 0);
        var t2 = new Transform(V(3,0), V(1,4), 90);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("t2 rotated, intersecting on t1 top", () => {
        var t1 = new Transform(V(0,0), V(2,2), 0);
        var t2 = new Transform(V(0,3), V(4,1), 90);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("t2 rotated, intersecting on t1 right", () => {
        var t1 = new Transform(V(0,0), V(2,2), 0);
        var t2 = new Transform(V(-3,0), V(1,4), 90);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("t2 rotated, intersecting on t1 bottom", () => {
        var t1 = new Transform(V(0,0), V(2,2), 0);
        var t2 = new Transform(V(0,-3), V(4,1), 90);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("t2 rotated, not intersecting", () => {
        var t1 = new Transform(V(-1,1), V(2,2), 0);
        var t2 = new Transform(V(2,0), V(4,2), 90);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(false);
    });
    it("both rotated, not intersecting", () => {
        var t1 = new Transform(V(-1,1), V(1,1), 0);
        var t2 = new Transform(V(1,-1), V(1,1), 0);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(false);
    });
    it("both rotated, intersecting on t1 left", () => {
        var t1 = new Transform(V(-1,0), V(2,4), 90);
        var t2 = new Transform(V(0.5,0), V(4,1), 270);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("both rotated, intersecting on t1 top", () => {
        var t1 = new Transform(V(-1,0), V(2,4), 90);
        var t2 = new Transform(V(-1,1), V(1,2), 270);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("both rotated, intersecting on t1 right", () => {
        var t1 = new Transform(V(-1,0), V(2,4), 90);
        var t2 = new Transform(V(-3,1), V(1,2), 270);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("both rotated, intersecting on t1 bottom", () => {
        var t1 = new Transform(V(-1,0), V(2,4), 90);
        var t2 = new Transform(V(-1,-1), V(1,2), 270);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("odd rotation, intersecting", () => {
        var t1 = new Transform(V(-1,0), V(6,1), 44);
        var t2 = new Transform(V(1,0), V(6,1), 136);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("odd rotation, intersecting", () => {
        var t1 = new Transform(V(-1,0), V(6,1), 45);
        var t2 = new Transform(V(1,0), V(6,1), 135);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("odd rotation, not intersecting", () => {
        var t1 = new Transform(V(-5,0), V(2,1), 45);
        var t2 = new Transform(V(5,0), V(2,1), 135);
        var b  = TransformContains(t1, t2);
        expect(b).toEqual(false);
    });
});

describe("RectContains", () => {
    it("intersects at center", () => {
        var t = new Transform(V(0,0), V(3,2), 0);
        var b  = RectContains(t, V(0,0));
        expect(b).toEqual(true);
    });
    it("intersects at top right corner", () => {
        var t = new Transform(V(0,0), V(4,4), 0);
        var b  = RectContains(t, V(1.5,1.5));
        expect(b).toEqual(true);
    });
    it("intersects at top left corner", () => {
        var t = new Transform(V(0,0), V(4,4), 0);
        var b  = RectContains(t, V(-1.5,1.5));
        expect(b).toEqual(true);
    });
    it("intersects at bottom left corner", () => {
        var t = new Transform(V(0,0), V(4,4), 0);
        var b  = RectContains(t, V(-1.5,-1.5));
        expect(b).toEqual(true);
    });
    it("intersects at bottom right corner", () => {
        var t = new Transform(V(0,0), V(4,4), 0);
        var b  = RectContains(t, V(1.5,-1.5));
        expect(b).toEqual(true);
    });
    it("not intersecting", () => {
        var t = new Transform(V(0,0), V(2,2), 0);
        var b  = RectContains(t, V(3,3));
        expect(b).toEqual(false);
    });
    it("on the bound/edge of rectangle", () => {
        var t = new Transform(V(0,0), V(2,2), 0);
        var b  = RectContains(t, V(2,2));
        expect(b).toEqual(false);
    });
});
