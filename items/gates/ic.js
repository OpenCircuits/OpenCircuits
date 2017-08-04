class IC extends IOObject {
    constructor(context, x, y, inputs, outputs, components, icuid) {
        super(context, x, y, 50, 50, undefined, false, 999, 999);
        this.icuid = icuid;
        this.setup(inputs, outputs, components);
    }
    setup(inputs, outputs, components) {
        inputs = (inputs ? inputs : []);
        outputs = (outputs ? outputs : []);
        this.inputObjects = inputs;
        this.outputObjects = outputs;
        this.components = components;
        this.noChange = true;

        this.maxInputs = inputs.length;
        this.maxOutputs = outputs.length;
        this.setInputAmount(inputs.length);
        this.setOutputAmount(outputs.length);

        var longestName = 0;
        for (var i = 0; i < this.inputs.length; i++)
            longestName = Math.max(this.inputObjects[i].getName().length, longestName);
        for (var i = 0; i < this.outputs.length; i++)
            longestName = Math.max(this.outputObjects[i].getName().length, longestName);
        this.transform.setWidth(DEFAULT_SIZE + 20*longestName);
        this.recalculatePorts();

        this.activate();
    }
    activate() {
        for (var i = 0; i < this.inputs.length; i++) {
            this.inputObjects[i].activate(this.inputs[i].isOn);
        }
    }
    draw() {
        var renderer = this.context.getRenderer();

        super.draw();

        this.localSpace();

        var size = this.transform.size;
        renderer.rect(0, 0, size.x, size.y, this.getCol(), '#000000', 1);

        for (var i = 0; i < this.inputs.length; i++) {
            var name = this.inputObjects[i].getName();
            var pos1 = this.transform.toLocalSpace(this.inputs[i].getPos());
            var align = "center";
            var padding = 8;
            var ww = renderer.getTextWidth(name)/2;
            var pos = getNearestPointOnRect(V(-size.x/2, -size.y/2), V(size.x/2, size.y/2), pos1);
            pos = pos.sub(pos1).normalize().scale(padding).add(pos);
            pos.x = clamp(pos.x, -size.x/2+padding+ww, size.x/2-padding-ww);
            pos.y = clamp(pos.y, -size.y/2+14, size.y/2-14);
            renderer.text(name, pos.x, pos.y, 0, 0, align);
        }
        for (var i = 0; i < this.outputs.length; i++) {
            var name = this.outputObjects[i].getName();
            var pos1 = this.transform.toLocalSpace(this.outputs[i].getPos());
            var align = "center";
            var padding = 8;
            var ww = renderer.getTextWidth(name)/2;
            var pos = getNearestPointOnRect(V(-size.x/2, -size.y/2), V(size.x/2, size.y/2), pos1);
            pos = pos.sub(pos1).normalize().scale(padding).add(pos);
            pos.x = clamp(pos.x, -size.x/2+padding+ww, size.x/2-padding-ww);
            pos.y = clamp(pos.y, -size.y/2+14, size.y/2-14);
            renderer.text(name, pos.x, pos.y, 0, 0, align);
        }

        renderer.restore();
    }
    recalculatePorts() {
        var size = this.getSize();

        var inputs = this.inputs;
        for (var i = 0; i < inputs.length; i++) {
            var inp = inputs[i];
            // Scale by large number to make sure that the target pos is not in the IC
            var pos = inp.getPos().add(inp.getPos().sub(inp.getOPos()).normalize().scale(10000));
            var p = getNearestPointOnRect(V(-size.x/2, -size.y/2), V(size.x/2, size.y/2), pos);
            var v1 = p.sub(pos).normalize().scale(size.scale(0.5)).add(p);
            var v2 = p.sub(pos).normalize().scale(size.scale(0.5).sub(V(IO_PORT_LENGTH+size.x/2-25, IO_PORT_LENGTH+size.y/2-25))).add(p);
            inp.setOrigin(v1);
            inp.setTarget(v2);
        }
        var outputs = this.outputs;
        for (var i = 0; i < outputs.length; i++) {
            var out = outputs[i];
            // Scale by large number to make sure that the target pos is not in the IC
            var pos = out.getPos().add(out.getPos().sub(out.getOPos()).normalize().scale(10000));
            var p = getNearestPointOnRect(V(-size.x/2, -size.y/2), V(size.x/2, size.y/2), pos);
            var v1 = p.sub(pos).normalize().scale(size.scale(0.5)).add(p);
            var v2 = p.sub(pos).normalize().scale(size.scale(0.5).sub(V(IO_PORT_LENGTH+size.x/2-25, IO_PORT_LENGTH+size.y/2-25))).add(p);
            out.setOrigin(v1);
            out.setTarget(v2);
        }
    }
    getDisplayName() {
        return "IC";
    }
    copy() {
        var ic = new IC(this.context);
        copyIC(this, ic);
        return ic;
    }
    writeTo(node) {
        var ICNode = super.writeTo(node);
        createTextElement(ICNode, "icuid", this.icuid);
        return ICNode;
    }
    load(node) {
        var icuid = getIntValue(getChildNode(node, "icuid"));
        var ic = findIC(icuid);
        copyIC(ic, this);
        super.load(node);
        return this;
    }
}

function createIC(context, selections, pos) {
    var objects = copyGroup(selections).objects;
    var separate = separateGroup(objects);
    for (var i = 0; i < separate.inputs.length; i++) {
        var input = separate.inputs[i];
        if (input instanceof Clock && input.getName() === input.getDisplayName())
            input.setName(">");
    }

    return new IC(context, pos.x, pos.y, separate.inputs, separate.outputs, separate.components, ICs.length);
}

function copyIC(source, target) {
    var group = source.inputObjects.concat(source.components, source.outputObjects);
    var copies = copyGroup(group).objects;

    // Separate each input/output/component
    var separate = separateGroup(copies);

    target.setup(separate.inputs, separate.outputs, separate.components);
    target.icuid = source.icuid;
    target.transform = source.transform.copy();

    // Copy inputs of the IC
    for (var i = 0; i < source.inputs.length; i++) {
        target.inputs[i] = source.inputs[i].copy();
        target.inputs[i].parent = target;
    }

    // Copy outputs of the IC and wire them to activate internal outputs
    for (var i = 0; i < source.outputs.length; i++) {
        target.outputs[i] = source.outputs[i].copy();
        target.outputs[i].parent = target;

        var ii = i;
        target.outputObjects[i].activate = function(on) {
            target.outputs[ii].activate(on);
        }
    }

    target.recalculatePorts();
}

function writeICs(node) {
    for (var icuid = 0; icuid < ICs.length; icuid++) {
        var ic = ICs[icuid];
        var ICNode = createChildNode(node, "ic");
        createTextElement(ICNode, "icuid", icuid);
        createTextElement(ICNode, "width", ic.transform.size.x);
        createTextElement(ICNode, "height", ic.transform.size.y);

        var iportNode = createChildNode(ICNode, "iports");
        for (var i = 0; i < ic.inputs.length; i++)
            ic.inputs[i].writeTo(iportNode);

        var oportNode = createChildNode(ICNode, "oports");
        for (var i = 0; i < ic.outputs.length; i++)
            ic.outputs[i].writeTo(oportNode);

        var componentsNode = createChildNode(ICNode, "components");
        var objects = ic.inputObjects.concat(ic.components, ic.outputObjects);
        var wires = getAllWires(objects);
        writeGroup(componentsNode, objects, wires);
    }
}

function loadICs(node, context) {
    var icsNode = getChildrenByTagName(node, "ic");
    var maxUID = 0;
    for (var i = 0; i < icsNode.length; i++) {
        var icNode = icsNode[i];
        var icuid = getIntValue(getChildNode(icNode, "icuid"));
        var width = getIntValue(getChildNode(icNode, "width"));
        var height = getIntValue(getChildNode(icNode, "height"));

        var componentsNode = getChildNode(icNode, "components");
        var components = loadGroup(componentsNode, context);
        var objects = components[0];
        var wires = components[1];
        for (var j = 0; j < objects.length; j++)
            maxUID = Math.max(objects[j].uid, maxUID);
        for (var j = 0; j < wires.length; j++)
            maxUID = Math.max(wires[j].uid, maxUID);

        var separate = separateGroup(objects);

        var ic = new IC(this.context, 0, 0, separate.inputs, separate.outputs, separate.components, icuid);
        ic.transform.setSize(V(width, height));

        var iportsNode = getChildNode(icNode, "iports");
        var iports = getChildrenByTagName(iportsNode, "iport");
        for (var j = 0; j < iports.length; j++) {
            var iportNode = iports[j];
            var origin = V(getFloatValue(getChildNode(iportNode, "originx")), getFloatValue(getChildNode(iportNode, "originy")));
            var target = V(getFloatValue(getChildNode(iportNode, "targetx")), getFloatValue(getChildNode(iportNode, "targety")));
            ic.inputs[j].setOrigin(origin);
            ic.inputs[j].setTarget(target);
        }

        var oportsNode = getChildNode(icNode, "oports");
        var oports = getChildrenByTagName(oportsNode, "oport");
        for (var j = 0; j < oports.length; j++) {
            var oportNode = oports[j];
            var origin = V(getFloatValue(getChildNode(oportNode, "originx")), getFloatValue(getChildNode(oportNode, "originy")));
            var target = V(getFloatValue(getChildNode(oportNode, "targetx")), getFloatValue(getChildNode(oportNode, "targety")));
            ic.outputs[j].setOrigin(origin);
            ic.outputs[j].setTarget(target);
        }

        ICs.push(ic);
    }
    return maxUID;
}
