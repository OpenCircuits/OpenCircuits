// @flow

var Vector = require("../../../../../refactor/public/js/utils/math/Vector");
var V = Vector.V;
var Transform = require("../../../../../refactor/public/js/utils/math/Transform");

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
        it("Update Matrix", () => {
            var t = new Transform(V(0,0), V(0,0), 0);
            // stuff
            t.updateMatrix();
            // tests
        });
        it("Update Size", () => {
            var t = new Transform(V(0,0), V(0,0), 0);
            // stuff
            t.updateSize();
            // tests
        });
        it("Update Corners", () => {
            var t = new Transform(V(0,0), V(0,0), 0);
            // stuff
            t.updateCorners();
            // tests
        });
        it("Set Parent", () => {
            var t1 = new Transform(V(0,0), V(0,0), 0);
            var t2 = new Transform(V(0,0), V(0,0), 0);
            t2.updateCorners();
            expect(t2.getParent()).toBe(undefined);

            t2.setParent(t1);
            expect(t2.getParent()).toBe(t1);
        });
        it("Set Pos", () => {
            var t = new Transform(V(0,0), V(0,0), 0);
            var v = new Vector(5, 5);
            t.updateCorners();
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
            t.updateCorners();
            expect(t.getAngle()).toBe(0);

            t.setAngle(53);
            expect(t.getAngle()).toBe(53);
        });
        it("Set Size", () => {
            var t = new Transform(V(0,0), V(0,0), 0);
            var v = new Vector(5, 5);
            expect(t.getSize().x).toBe(0);
            expect(t.getSize().y).toBe(0);

            t.setSize(v);
            expect(t.getSize().x).toBe(5);
            expect(t.getSize().y).toBe(5);
            expect(v.x).toBe(5);
            expect(v.y).toBe(5);
        });
        it("Set Width", () => {
            var t = new Transform(V(0,0), V(0,0), 0);
            expect(t.getSize().x).toBe(0);
            expect(t.getSize().y).toBe(0);

            t.setWidth(5);
            expect(t.getSize().x).toBe(5);
            expect(t.getSize().y).toBe(0);
        });
        it("Set Height", () => {
            var t = new Transform(V(0,0), V(0,0), 0);
            expect(t.getSize().x).toBe(0);
            expect(t.getSize().y).toBe(0);

            t.setHeight(5);
            expect(t.getSize().x).toBe(0);
            expect(t.getSize().y).toBe(5);
        });
    });
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
    });
});
