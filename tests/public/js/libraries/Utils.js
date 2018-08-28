describe("Utils", () => {
    it("rectContains", () => {
        
    });
    it("circleContains", () => {
        
    });
    it("transformContains", () => {
        
    });
    it("getNearestPointOnRect", () => {
        
    });
    it("getAllThingsBetween", () => {
        
    });
    it("rectContains", () => {
        
    });
    it("getAllWires", () => {
        
    });
    it("findIC", () => {
        
    });
    it("findByUID", () => {
        
    });
    it("getNearestT", () => {
        
    });
    it("findRoots", () => {
        
    });
    it("separateGroup", () => {
        var group = [new Switch(), new Switch(), new LED(), new BUFGate(), new ANDGate(), new LED()];
        var separate = separateGroup(group);
        assert.deepEqual(separate.inputs, [group[0], group[1]]);
        assert.deepEqual(separate.components, [group[3], group[4]]);
        assert.deepEqual(separate.outputs, [group[2], group[5]]);
    });
    it("clamp", () => {
        {
            var x = -5;
            var min = 0;
            var max = 5;
            assert.equal(clamp(x, min, max), 0);
        }
        {
            var x = 10;
            var min = 0;
            var max = 5;
            assert.equal(clamp(x, min, max), 5);
        }
        {
            var x = 3;
            var min = 0;
            var max = 5;
            assert.equal(clamp(x, min, max), 3);
        }
    });
});