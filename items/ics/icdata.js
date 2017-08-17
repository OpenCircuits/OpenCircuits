class ICData {
    constructor(inputs, outputs, components) {
        this.transform = new Transform(V(0,0),V(0,0),0);
        this.inputs = inputs;
        this.outputs = outputs;
        this.components = components;
        this.wires = getAllWires(this.getObjects());

        this.uidmanager = new UIDManager(this);

        // Give everything a uid
        var objects = this.getObjects();
        for (var i = 0; i < objects.length; i++)
            this.uidmanager.giveUIDTo(objects[i]);
        for (var i = 0; i < this.wires.length; i++)
            this.uidmanager.giveUIDTo(this.wires[i]);

        // Set start size based on length of names and amount of ports
        var longestName = 0;
        for (var i = 0; i < this.inputs.length; i++)
            longestName = Math.max(this.inputs[i].getName().length, longestName);
        for (var i = 0; i < this.outputs.length; i++)
            longestName = Math.max(this.outputs[i].getName().length, longestName);
        var w = DEFAULT_SIZE + 20*longestName;
        var h = DEFAULT_SIZE/2*(Math.max(this.inputs.length, this.outputs.length));
        this.transform.setSize(V(w, h));

        // Create and position ioports
        this.iports = [];
        this.oports = [];
        for (var i = 0; i < this.inputs.length; i++) {
            this.iports[i] = new IPort();

            var l = -DEFAULT_SIZE/2*(i - (this.inputs.length)/2 + 0.5);
            if (i === 0) l -= 1;
            if (i === this.inputs.length-1) l += 1;

            this.iports[i].setOrigin(V(0, l));
            this.iports[i].setTarget(V(-IO_PORT_LENGTH-(w/2-DEFAULT_SIZE/2), l));
        }
        for (var i = 0; i < this.outputs.length; i++) {
            this.oports[i] = new OPort();

            var l = -DEFAULT_SIZE/2*(i - (this.outputs.length)/2 + 0.5);
            if (i === 0) l -= 1;
            if (i === this.outputs.length-1) l += 1;

            this.oports[i].setOrigin(V(0, l));
            this.oports[i].setTarget(V(IO_PORT_LENGTH+(w/2-DEFAULT_SIZE/2), l));
        }

        this.recalculatePorts();
    }
    recalculatePorts() {
        var size = this.transform.size;

        var inputs = this.iports;
        for (var i = 0; i < inputs.length; i++) {
            var inp = inputs[i];
            // Scale by large number to make sure that the target pos is not in the IC
            var targ = this.transform.getMatrix().mul(inp.target);
            var orig = this.transform.getMatrix().mul(inp.origin);
            var pos = targ.add(targ.sub(orig).normalize().scale(10000));
            var p = getNearestPointOnRect(V(-size.x/2, -size.y/2), V(size.x/2, size.y/2), pos);
            var v1 = p.sub(pos).normalize().scale(size.scale(0.5)).add(p);
            var v2 = p.sub(pos).normalize().scale(size.scale(0.5).sub(V(IO_PORT_LENGTH+size.x/2-25, IO_PORT_LENGTH+size.y/2-25))).add(p);
            inp.setOrigin(v1);
            inp.setTarget(v2);
        }
        var outputs = this.oports;
        for (var i = 0; i < outputs.length; i++) {
            var out = outputs[i];
            // Scale by large number to make sure that the target pos is not in the IC
            var targ = this.transform.getMatrix().mul(out.target);
            var orig = this.transform.getMatrix().mul(out.origin);
            var pos = targ.add(targ.sub(orig).normalize().scale(10000));
            var p = getNearestPointOnRect(V(-size.x/2, -size.y/2), V(size.x/2, size.y/2), pos);
            var v1 = p.sub(pos).normalize().scale(size.scale(0.5)).add(p);
            var v2 = p.sub(pos).normalize().scale(size.scale(0.5).sub(V(IO_PORT_LENGTH+size.x/2-25, IO_PORT_LENGTH+size.y/2-25))).add(p);
            out.setOrigin(v1);
            out.setTarget(v2);
        }
    }
    getInputAmount() {
        return this.inputs.length;
    }
    getOutputAmount() {
        return this.outputs.length;
    }
    copy() {
        return separateGroup(copyGroup(this.getObjects()).objects);
    }
    getUID() {
        return this.icuid;
    }
    getObjects() {
        return this.inputs.concat(this.components, this.outputs);
    }
    getWires() {
        return this.wires;
    }
    getWidth() {
        return this.transform.getSize().x;
    }
    getHeight() {
        return this.transform.getSize().y;
    }
}
ICData.create = function(objects) {
    objects = copyGroup(objects).objects;
    var separate = separateGroup(objects);
    for (var i = 0; i < separate.inputs.length; i++) {
        var input = separate.inputs[i];
        if (input instanceof Clock && input.getName() === input.getDisplayName())
            input.setName(">");
    }
    return new ICData(separate.inputs, separate.outputs, separate.components);
}
ICData.add = function(data) {
    data.icuid = ICData.ICs.length;
    ICData.ICs.push(data);
}
ICData.redistributeUIDs = function() {
    var ics = [];
    for (var i = 0; i < ICData.ICs.length; i++)
        ics[i] = ICData.ICs[i];
    ICData.ICs = [];
    for (var i = 0; i < ics.length; i++) {
        ics[i].icuid = i;
        ICData.ICs[i] = ics[i];
    }
}
ICData.ICs = [];
