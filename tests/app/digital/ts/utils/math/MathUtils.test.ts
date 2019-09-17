import "jest";

import {V} from "Vector";
import {Clamp, TransformContains,
        RectContains, CircleContains} from "math/MathUtils";
import {Transform} from "math/Transform";

describe("Clamp", () => {
    it("less than minimum", () => {
        const x   = 1;
        const min = 2;
        const max = 3;
        const c = Clamp(x, min, max);
        expect(c).toEqual(2);
    });
    it("in between", () => {
        const x   = 2;
        const min = 1;
        const max = 3;
        const c = Clamp(x, min, max);
        expect(c).toEqual(2);
    });
    it("more than maximum", () => {
        const x   = 7;
        const min = 2;
        const max = 3;
        const c = Clamp(x, min, max);
        expect(c).toEqual(3);
    });
    it("all equal", () => {
        const x   = 5;
        const min = 5;
        const max = 5;
        const c = Clamp(x, min, max);
        expect(c).toEqual(5);
    });
});

describe("TransformContains", () => {
    it("identical", () => {
        const t1 = new Transform(V(1,-1), V(1,1), 0);
        const t2 = new Transform(V(1,-1), V(1,1), 0);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("t1 inside t2", () => {
        const t1 = new Transform(V(0,-2), V(1,1), 0);
        const t2 = new Transform(V(0,-2), V(2,4), 270);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("opposing quadrants", () => {
        const t1 = new Transform(V(-1,1), V(1,1), 0);
        const t2 = new Transform(V(1,-1), V(1,1), 0);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(false);
    });
    it("intersects on t1 left", () => {
        const t1 = new Transform(V(0,0),  V(1,1), 0);
        const t2 = new Transform(V(-1,0), V(3,2), 0);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("intersects on t1 left", () => {
        const t1 = new Transform(V(0,0),  V(3,2), 0);
        const t2 = new Transform(V(-1,0), V(3,2), 0);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("intersects on t1 right", () => {
        const t1 = new Transform(V(-1,0), V(3,2), 0);
        const t2 = new Transform(V(0,0),  V(3,2), 0);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("intersects on t1 top", () => {
        const t1 = new Transform(V(0,0),  V(4,2), 0);
        const t2 = new Transform(V(0,-1), V(4,2), 0);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("intersects on t1 bottom", () => {
        const t1 = new Transform(V(0,0),  V(4,2), 0);
        const t2 = new Transform(V(0,-1), V(4,2), 0);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("t1 rotated, intersecting", () => {
        const t1 = new Transform(V(-1,1), V(4,2), 180);
        const t2 = new Transform(V(1,-1), V(4,2), 0);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("t1 rotated, not intersecting", () => {
        const t1 = new Transform(V(-1,1), V(1,1), 0);
        const t2 = new Transform(V(1,-1), V(1,1), 0);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(false);
    });
    it("t2 rotated, intersecting on t1 left", () => {
        const t1 = new Transform(V(0,0), V(2,2), 0);
        const t2 = new Transform(V(3,0), V(1,4), 90);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("t2 rotated, intersecting on t1 top", () => {
        const t1 = new Transform(V(0,0), V(2,2), 0);
        const t2 = new Transform(V(0,3), V(4,1), 90);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("t2 rotated, intersecting on t1 right", () => {
        const t1 = new Transform(V(0,0), V(2,2), 0);
        const t2 = new Transform(V(-3,0), V(1,4), 90);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("t2 rotated, intersecting on t1 bottom", () => {
        const t1 = new Transform(V(0,0), V(2,2), 0);
        const t2 = new Transform(V(0,-3), V(4,1), 90);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("t2 rotated, not intersecting", () => {
        const t1 = new Transform(V(-1,1), V(2,2), 0);
        const t2 = new Transform(V(2,0), V(4,2), 90);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(false);
    });
    it("both rotated, not intersecting", () => {
        const t1 = new Transform(V(-1,1), V(1,1), 0);
        const t2 = new Transform(V(1,-1), V(1,1), 0);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(false);
    });
    it("both rotated, intersecting on t1 left", () => {
        const t1 = new Transform(V(-1,0), V(2,4), 90);
        const t2 = new Transform(V(0.5,0), V(4,1), 270);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("both rotated, intersecting on t1 top", () => {
        const t1 = new Transform(V(-1,0), V(2,4), 90);
        const t2 = new Transform(V(-1,1), V(1,2), 270);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("both rotated, intersecting on t1 right", () => {
        const t1 = new Transform(V(-1,0), V(2,4), 90);
        const t2 = new Transform(V(-3,1), V(1,2), 270);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("both rotated, intersecting on t1 bottom", () => {
        const t1 = new Transform(V(-1,0), V(2,4), 90);
        const t2 = new Transform(V(-1,-1), V(1,2), 270);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("odd rotation, intersecting", () => {
        const t1 = new Transform(V(-1,0), V(6,1), 44);
        const t2 = new Transform(V(1,0), V(6,1), 136);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("odd rotation, intersecting", () => {
        const t1 = new Transform(V(-1,0), V(6,1), 45);
        const t2 = new Transform(V(1,0), V(6,1), 135);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(true);
    });
    it("odd rotation, not intersecting", () => {
        const t1 = new Transform(V(-5,0), V(2,1), 45);
        const t2 = new Transform(V(5,0), V(2,1), 135);
        const b  = TransformContains(t1, t2);
        expect(b).toEqual(false);
    });
});

describe("RectContains", () => {
    it("intersects at center", () => {
        const t = new Transform(V(0,0), V(3,2), 0);
        const b  = RectContains(t, V(0,0));
        expect(b).toEqual(true);
    });
    it("intersects at top right corner", () => {
        const t = new Transform(V(0,0), V(4,4), 0);
        const b  = RectContains(t, V(1.5,1.5));
        expect(b).toEqual(true);
    });
    it("intersects at top left corner", () => {
        const t = new Transform(V(0,0), V(4,4), 0);
        const b  = RectContains(t, V(-1.5,1.5));
        expect(b).toEqual(true);
    });
    it("intersects at bottom left corner", () => {
        const t = new Transform(V(0,0), V(4,4), 0);
        const b  = RectContains(t, V(-1.5,-1.5));
        expect(b).toEqual(true);
    });
    it("intersects at bottom right corner", () => {
        const t = new Transform(V(0,0), V(4,4), 0);
        const b  = RectContains(t, V(1.5,-1.5));
        expect(b).toEqual(true);
    });
    it("not intersecting", () => {
        const t = new Transform(V(0,0), V(2,2), 0);
        const b  = RectContains(t, V(3,3));
        expect(b).toEqual(false);
    });
    it("on the bound/edge of rectangle", () => {
        const t = new Transform(V(0,0), V(2,2), 0);
        const b  = RectContains(t, V(2,2));
        expect(b).toEqual(false);
    });
});

describe("CircleContains", () => {
    it("same points", () => {
        const c  = CircleContains(V(0,0), 2, V(0,0));
        expect(c).toEqual(true);
    });
    it("on the edge", () => {
        const c  = CircleContains(V(0,0), 2, V(0,2));
        expect(c).toEqual(true);
    });
    it("on the cusp", () => {
        const c  = CircleContains(V(1,5), -3, V(3.1,7.14242));
        expect(c).toEqual(true);
    });
    it("outside", () => {
        const c  = CircleContains(V(0,0), 2, V(5,5));
        expect(c).toEqual(false);
    });
    it("negative radius, inside", () => {
        const c  = CircleContains(V(0,0), -2, V(0,2));
        expect(c).toEqual(true);
    });
    it("negative radius, outside", () => {
        const c  = CircleContains(V(1,5), -3, V(10,10));
        expect(c).toEqual(false);
    });
    it("decimal numbers", () => {
        const c  = CircleContains(V(-4.6,5.2), 7.7, V(-1.3,8.6));
        expect(c).toEqual(true);
    });
});
