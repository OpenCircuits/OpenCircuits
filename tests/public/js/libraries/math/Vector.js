describe("Vector", () => {
    describe("Constructor", () => {
        it("No parameters", () => {
            var v = new Vector();
            assert.equal(v.x, 0);
            assert.equal(v.y, 0);
        });
        it("One (number) parameter", () => {
            var v = new Vector(5);
            assert.equal(v.x, 5);
            assert.equal(v.y, 0);
        });
        it("Two (number) parameters", () => {
            var v = new Vector(5, 5);
            assert.equal(v.x, 5);
            assert.equal(v.y, 5);
        });
        it("One (vector) parameter", () => {
            var v1 = new Vector(5, 5);
            var v2 = new Vector(v1);
            assert.equal(v1.x, 5);
            assert.equal(v1.y, 5);
        });
    });
    describe("Modifiers", () => {
        it("Translate (numbers)", () => {
            var v = new Vector(1, 1);
            v.translate(5, 5);
            assert.equal(v.x, 6);
            assert.equal(v.y, 6);
        });
        it("Translate (vector)", () => {
            var v1 = new Vector(1, 1);
            var v2 = new Vector(5, 5);
            v1.translate(v2);
            assert.equal(v2.x, 5, "Don't change parameter!");
            assert.equal(v2.y, 5, "Don't change parameter!");
            assert.equal(v1.x, 6);
            assert.equal(v1.y, 6);
        });
    });
    describe("Operators", () => {
        it("Add (numbers)", () => {
            var v1 = new Vector(1, 1);
            var v2 = v1.add(5, 5);
            assert.equal(v1.x, 1, "Don't change parameter!");
            assert.equal(v1.y, 1, "Don't change parameter!");
            assert.equal(v2.x, 6);
            assert.equal(v2.y, 6);
        });
        it("Add (vector)", () => {
            var v1 = new Vector(1, 1);
            var v2 = new Vector(5, 5);
            var v3 = v1.add(v2);
            assert.equal(v1.x, 1, "Don't change original!");
            assert.equal(v1.y, 1, "Don't change original!");
            assert.equal(v2.x, 5, "Don't change parameter!");
            assert.equal(v2.y, 5, "Don't change parameter!");
            assert.equal(v3.x, 6);
            assert.equal(v3.y, 6);
        });
        it("Sub (numbers)", () => {
            var v1 = new Vector(6, 6);
            var v2 = v1.sub(5, 5);
            assert.equal(v1.x, 6, "Don't change original!");
            assert.equal(v1.y, 6, "Don't change original!");
            assert.equal(v2.x, 1);
            assert.equal(v2.y, 1);
        });
        it("Sub (vector)", () => {
            var v1 = new Vector(6, 6);
            var v2 = new Vector(5, 5);
            var v3 = v1.sub(v2);
            assert.equal(v1.x, 6, "Don't change original!");
            assert.equal(v1.y, 6, "Don't change original!");
            assert.equal(v2.x, 5, "Don't change parameter!");
            assert.equal(v2.y, 5, "Don't change parameter!");
            assert.equal(v3.x, 1);
            assert.equal(v3.y, 1);
        });
        it("Scale (number)", () => {
            var v1 = new Vector(1, 2);
            var v2 = v1.scale(5);
            assert.equal(v1.x, 1, "Don't change original!");
            assert.equal(v1.y, 2, "Don't change original!");
            assert.equal(v2.x, 5);
            assert.equal(v2.y, 10);
        });
        it("Scale (vector)", () => {
            var v1 = new Vector(2, 3);
            var v2 = new Vector(5, 10);
            var v3 = v1.scale(v2);
            assert.equal(v1.x, 2, "Don't change original!");
            assert.equal(v1.y, 3, "Don't change original!");
            assert.equal(v2.x, 5, "Don't change parameter!");
            assert.equal(v2.y, 10, "Don't change parameter!");
            assert.equal(v3.x, 10);
            assert.equal(v3.y, 30);
        });
        it("Copy", () => {
            var v1 = new Vector(2, 3);
            var v2 = v1.copy();
            assert.notEqual(v1, v2);
            assert.equal(v1.x, v2.x);
            assert.equal(v1.y, v2.y);
        });
    });
    describe("Math", () => {
        it("Normalize", () => {
            {
                var v = new Vector(5, 0);
                var n = v.normalize();
                assert.equal(v.x, 5, "Don't change original!");
                assert.equal(v.y, 0, "Don't change original!");
                assert.equal(n.x, 1);
                assert.equal(n.y, 0);
            }
            {
                var v = new Vector(0, 0);
                var n = v.normalize();
                assert.equal(v.x, 0, "Don't change original!");
                assert.equal(v.y, 0, "Don't change original!");
                assert.equal(n.x, 0);
                assert.equal(n.y, 0);
            }
            {
                var v = new Vector(1, 1);
                var n = v.normalize();
                assert.equal(v.x, 1, "Don't change original!");
                assert.equal(v.y, 1, "Don't change original!");
                assert(Math.abs(n.x - Math.sqrt(2)/2) < 1e-8);
                assert(Math.abs(n.y - Math.sqrt(2)/2) < 1e-8);
            }
        });
        it("Len", () => {
            {
                var v = new Vector(0, 0);
                var l = v.len();
                assert.equal(v.x, 0, "Don't change original!");
                assert.equal(v.y, 0, "Don't change original!");
                assert(Math.abs(l - 0) < 1e-8);
            }
            {
                var v = new Vector(5, 0);
                var l = v.len();
                assert.equal(v.x, 5, "Don't change original!");
                assert.equal(v.y, 0, "Don't change original!");
                assert(Math.abs(l - 5) < 1e-8);
            }
            {
                var v = new Vector(3, 4);
                var l = v.len();
                assert.equal(v.x, 3, "Don't change original!");
                assert.equal(v.y, 4, "Don't change original!");
                assert(Math.abs(l - 5) < 1e-8);
            }
            {
                var v = new Vector(543, 210);
                var l = v.len();
                assert.equal(v.x, 543, "Don't change original!");
                assert.equal(v.y, 210, "Don't change original!");
                assert(Math.abs(l - 582.1932668797) < 1e-8);
            }
        });
        it("Len2", () => {
            {
                var v = new Vector(0, 0);
                var l = v.len2();
                assert.equal(v.x, 0, "Don't change original!");
                assert.equal(v.y, 0, "Don't change original!");
                assert.equal(l, 0);
            }
            {
                var v = new Vector(5, 0);
                var l = v.len2();
                assert.equal(v.x, 5, "Don't change original!");
                assert.equal(v.y, 0, "Don't change original!");
                assert.equal(l, 25);
            }
            {
                var v = new Vector(3, 4);
                var l = v.len2();
                assert.equal(v.x, 3, "Don't change original!");
                assert.equal(v.y, 4, "Don't change original!");
                assert.equal(l, 25);
            }
            {
                var v = new Vector(543, 210);
                var l = v.len2();
                assert.equal(v.x, 543, "Don't change original!");
                assert.equal(v.y, 210, "Don't change original!");
                assert.equal(l, 338949);
            }
        });
        it("DistanceTo", () => {
            {
                var v1 = new Vector(1, 2);
                var v2 = new Vector(4, 6);
                var d = v1.distanceTo(v2);
                assert.equal(v1.x, 1);
                assert.equal(v1.y, 2);
                assert.equal(v2.x, 4);
                assert.equal(v2.y, 6);
                assert(Math.abs(d - 5) < 1e-8);
            }
        });
        it("Dot", () => {
            {
                var v1 = new Vector(1, 2);
                var v2 = new Vector(4, 6);
                var d = v1.dot(v2);
                assert.equal(v1.x, 1);
                assert.equal(v1.y, 2);
                assert.equal(v2.x, 4);
                assert.equal(v2.y, 6);
                assert.equal(d, 16);
            }
        });
        it("Project", () => {
            {
                var v1 = new Vector(8, 4);
                var v2 = new Vector(1, 0);
                var p = v1.project(v2);
                assert.equal(v1.x, 8);
                assert.equal(v1.y, 4);
                assert.equal(v2.x, 1);
                assert.equal(v2.y, 0);
                assert(Math.abs(p.x - 0.8) < 1e-8);
                assert(Math.abs(p.y - 0.4) < 1e-8);
            }
        });
    });
});