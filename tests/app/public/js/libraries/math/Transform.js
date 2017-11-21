describe("Transform", () => {
    describe("Constructor", () => {
        it("No parameters", () => {
            var t = new Transform(V(0,0), V(0,0), 0);
            // tests
        });
        it("All parameters", () => {
            var cam = new Camera({renderer: {canvas: {width: 100, height: 100}}});
            var t = new Transform(V(5, 5), V(10, 10), 0, cam);
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
        it("Transform Ctx", () => {
            var cam = new Camera({renderer: {canvas: {width: 100, height: 100}}});
            var ctx = {mat: [], setTransform: function(a, b, c, d, e, f) { this.mat = [a,b,c,d,e,f]; }}
            var t = new Transform(V(0,0), V(0,0), 0, cam);
            // stuff
            t.transformCtx(ctx);
            // tests
        });
        it("Set Parent", () => {
            var t1 = new Transform(V(0,0), V(0,0), 0);
            var t2 = new Transform(V(0,0), V(0,0), 0);
            t2.updateCorners();
            assert(t2.parent === undefined);
            assert(!t2.dirty);
            assert(!t2.dirtyCorners);
            
            t2.setParent(t1);
            assert(t2.parent === t1);
            assert(t2.dirty);
            assert(t2.dirtyCorners);
        });
        it("Set Pos", () => {
            var t = new Transform(V(0,0), V(0,0), 0);
            var v = new Vector(5, 5);
            t.updateCorners();
            assert(!t.dirty);
            assert(!t.dirtyCorners);
            assert.equal(t.pos.x, 0);
            assert.equal(t.pos.y, 0);
            
            t.setPos(v);
            assert(t.dirty);
            assert(t.dirtyCorners);
            assert.equal(t.pos.x, 5);
            assert.equal(t.pos.y, 5);
            assert.equal(v.x, 5, "Don't change parameter!");
            assert.equal(v.y, 5, "Don't change parameter!");
        });
        it("Set Angle", () => {
            var t = new Transform(V(0,0), V(0,0), 0);
            t.updateCorners();
            assert(!t.dirty);
            assert(!t.dirtyCorners);
            assert.equal(t.angle, 0);
            
            t.setAngle(53);
            assert(t.dirty);
            assert(t.dirtyCorners);
            assert.equal(t.angle, 53);
        });
        it("Set Size", () => {
            var t = new Transform(V(0,0), V(0,0), 0);
            var v = new Vector(5, 5);
            t.updateSize();
            t.updateCorners();
            assert(!t.dirtySize);
            assert(!t.dirtyCorners);
            assert.equal(t.size.x, 0);
            assert.equal(t.size.y, 0);
            
            t.setSize(v);
            assert(t.dirtySize);
            assert(t.dirtyCorners);
            assert.equal(t.size.x, 5);
            assert.equal(t.size.y, 5);
            assert.equal(v.x, 5, "Don't change parameter!");
            assert.equal(v.y, 5, "Don't change parameter!");
        });
        it("Set Width", () => {
            var t = new Transform(V(0,0), V(0,0), 0);
            t.updateSize();
            t.updateCorners();
            assert(!t.dirtySize);
            assert(!t.dirtyCorners);
            assert.equal(t.size.x, 0);
            assert.equal(t.size.y, 0);
            
            t.setWidth(5);
            assert(t.dirtySize);
            assert(t.dirtyCorners);
            assert.equal(t.size.x, 5);
            assert.equal(t.size.y, 0);
        });
        it("Set Height", () => {
            var t = new Transform(V(0,0), V(0,0), 0);
            t.updateSize();
            t.updateCorners();
            assert(!t.dirtySize);
            assert(!t.dirtyCorners);
            assert.equal(t.size.x, 0);
            assert.equal(t.size.y, 0);
            
            t.setHeight(5);
            assert(t.dirtySize);
            assert(t.dirtyCorners);
            assert.equal(t.size.x, 0);
            assert.equal(t.size.y, 5);
        });
    });
    describe("Getters", () => {
        it("To Local Space", () => {
            var cam = new Camera({renderer: {canvas: {width: 100, height: 100}}});
            var v = new Vector();
            var t = new Transform(V(0,0), V(0,0), 0, cam);
            // stuff
            var v2 = t.toLocalSpace(v);
            // tests
        });
        it("To World Space", () => {
            var cam = new Camera({renderer: {canvas: {width: 100, height: 100}}});
            var v = new Vector();
            var t = new Transform(V(0,0), V(0,0), 0, cam);
            // stuff
            var v2 = t.toWorldSpace(v);
            // tests
        });
    });
});