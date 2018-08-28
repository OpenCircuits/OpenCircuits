describe("Matrix2x3", () => {
    describe("Constructor", () => {
        it("No parameters", () => {
            var m = new Matrix2x3();
                                    // [1 0 0]
                                    // [0 1 0]
            assert.deepEqual(m.mat, [1, 0, 0, 1, 0, 0]);
        });
        it("One (matrix) parameter", () => {
            var m1 = new Matrix2x3();
            m1.mat = [6, 5, 4, 3, 2, 1];
            var m2 = new Matrix2x3(m1);
                                    // [6 4 2]
                                    // [5 3 1]
            assert.deepEqual(m1.mat, [6, 5, 4, 3, 2, 1], "Don't change parameter!");
            assert.notEqual(m1.mat, m2.mat);
                                    // [6 4 2]
                                    // [5 3 1]
            assert.deepEqual(m2.mat, [6, 5, 4, 3, 2, 1]);
        });
    });
    describe("Modifiers", () => {
        it("Zero", () => {
            var m = new Matrix2x3();
            m.zero();
            assert.deepEqual(m.mat, [0, 0, 0, 0, 0, 0]);
        });
        it("Identity", () => {
            var m = new Matrix2x3();
            m.mat = [0, 0, 0, 0, 0, 0];
            m.identity();
                                    // [1 0 0]
                                    // [0 1 0]
            assert.deepEqual(m.mat, [1, 0, 0, 1, 0, 0]);
        });
        it("Translate", () => {
            {
                var m = new Matrix2x3();
                var v = new Vector(5, -2);
                m.translate(v);
                assert.equal(v.x, 5, "Don't change parameter!");
                assert.equal(v.y, -2, "Don't change parameter!");
                                        // [1 0  5]
                                        // [0 1 -2]
                assert.deepEqual(m.mat, [1, 0, 0, 1, 5, -2]);
            }
            {
                var m = new Matrix2x3();
                m.mat = [1, 2, 3, 4, 0, 0];
                var v = new Vector(5, -2);
                m.translate(v);
                assert.equal(v.x, 5, "Don't change parameter!");
                assert.equal(v.y, -2, "Don't change parameter!");
                                        // [1 3 -1]
                                        // [2 4  2]
                assert.deepEqual(m.mat, [1, 2, 3, 4, -1, 2]);
            }
        });
        it("Rotate", () => {
            {
                var m = new Matrix2x3();
                m.rotate(Math.PI / 2);
                                        // [0 -1 0]
                                        // [1  0 0]
                assert(Math.abs(m.mat[0] -  0) < 1e-8);
                assert(Math.abs(m.mat[1] -  1) < 1e-8);
                assert(Math.abs(m.mat[2] - -1) < 1e-8);
                assert(Math.abs(m.mat[3] -  0) < 1e-8);
                assert.equal(m.mat[4], 0);
                assert.equal(m.mat[5], 0);
            }
            {
                var m = new Matrix2x3();
                m.rotate(Math.PI / 4);
                                        // [0.707 -0.707 0]
                                        // [0.707  0.707 0]
                assert(Math.abs(m.mat[0] -  Math.sqrt(2)/2) < 1e-8);
                assert(Math.abs(m.mat[1] -  Math.sqrt(2)/2) < 1e-8);
                assert(Math.abs(m.mat[2] - -Math.sqrt(2)/2) < 1e-8);
                assert(Math.abs(m.mat[3] -  Math.sqrt(2)/2) < 1e-8);
                assert.equal(m.mat[4], 0);
                assert.equal(m.mat[5], 0);
            }
        });
        it("Scale", () => {
            {
                var m = new Matrix2x3();
                var v = new Vector(5, -2);
                m.scale(v);
                assert.equal(v.x, 5, "Don't change parameter!");
                assert.equal(v.y, -2, "Don't change parameter!");
                                        // [5  0 0]
                                        // [0 -2 0]
                assert.deepEqual(m.mat, [5, 0, 0, -2, 0, 0]);
            }
            {
                var m = new Matrix2x3();
                m.mat = [1, 2, 3, 4, 0, 0];
                var v = new Vector(5, -2);
                m.scale(v);
                assert.equal(v.x, 5, "Don't change parameter!");
                assert.equal(v.y, -2, "Don't change parameter!");
                                        // [5  -6 0]
                                        // [10 -8 0]
                assert.deepEqual(m.mat, [5, 10, -6, -8, 0, 0]);
            }
        });
    });
    describe("Operators", () => {
        it("Mul", () => {
            var m = new Matrix2x3();
            m.mat = [1, 2, 3, 4, 5, 6];
            var v1 = new Vector(-1, -2);
            var v2 = m.mul(v1);
            assert.equal(v1.x, -1, "Don't change parameter!");
            assert.equal(v1.y, -2, "Don't change parameter!");
            assert.equal(v2.x, -2);
            assert.equal(v2.y, -4);
        });
        it("Mult", () => {
            var m1 = new Matrix2x3();
            m1.mat = [1, 2, 3, 4, 5, 6];
            var m2 = new Matrix2x3();
            m2.mat = [6, 5, 4, 3, 2, 1];
            var m3 = m1.mult(m2);
                                    // [1 3 5]
                                    // [2 4 6]
            assert.deepEqual(m1.mat, [1, 2, 3, 4, 5, 6], "Don't change parameter!");
                                    // [6 4 2]
                                    // [5 3 1]
            assert.deepEqual(m2.mat, [6, 5, 4, 3, 2, 1], "Don't change parameter!");
                                    // [21 13 10]
                                    // [32 20 14]
            assert.deepEqual(m3.mat, [21, 32, 13, 20, 10, 14]);
        });
        it("Inverse", () => {
            {
                var m = new Matrix2x3();
                var i = m.inverse();
                                        // [1 0 0]
                                        // [0 1 0]
                assert.deepEqual(m.mat, [1, 0, 0, 1, 0, 0], "Don't change parameter!");
                                        // [1 0 0]
                                        // [0 1 0]
                assert.deepEqual(i.mat, [1, 0, 0, 1, 0, 0]);
            }
            {
                var m = new Matrix2x3();
                m.mat = [1, 2, 3, 4, 5, 6];
                var i = m.inverse();
                                        // [1 3 5]
                                        // [2 4 6]
                assert.deepEqual(m.mat, [1, 2, 3, 4, 5, 6], "Don't change parameter!");
                                        // [-2  1.5  1]
                                        // [ 1 -0.5 -2]
                assert.deepEqual(i.mat, [-2, 1, 1.5, -0.5, 1, -2]);
            }
        });
    });
});