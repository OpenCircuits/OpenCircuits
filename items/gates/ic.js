class IC extends IOObject {
    constructor(context, x, y, inputs, outputs, components, icuid) {
        super(context, x, y, 50, 50, undefined, false, 999, 999);
        this.icuid = icuid;
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
        this.transform.size.x = DEFAULT_SIZE + 20*longestName;
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
        var group = this.inputObjects.concat(this.components, this.outputObjects);
        var copies = copyGroup(group)[0];

        // Separate each input/output/component
        var inputs = [];
        var outputs = [];
        var components = [];
        for (var i = 0; i < copies.length; i++) {
            var copy = copies[i];
            if (copy instanceof Switch || copy instanceof Button)
                inputs.push(copy);
            else if (copy instanceof LED)
                outputs.push(copy);
            else
                components.push(copy);
        }

        var ic = new IC(this.context, 0, 0, inputs, outputs, components, this.uid);
        ic.transform = this.transform.copy();

        // Copy inputs of the IC
        for (var i = 0; i < this.inputs.length; i++) {
            ic.inputs[i] = this.inputs[i].copy();
            ic.inputs[i].parent = ic;
        }

        // Copy outputs of the IC and wire them to activate internal outputs
        for (var i = 0; i < this.outputs.length; i++) {
            ic.outputs[i] = this.outputs[i].copy();
            ic.outputs[i].parent = ic;

            const ii = i;
            ic.outputObjects[i].activate = function(on) {
                ic.outputs[ii].activate(on);
            }
        }

        return ic;
    }
    writeTo(node, uid) {
        var ICNode = createChildNode(node, "ic");
        super.writeTo(ICNode, uid);
        createTextElement(ICNode, "icuid", this.icuid);
    }
}

function createIC(context, selections, pos) {
    var inputs = [];
    var outputs = [];
    var components = [];
    for (var i = 0; i < selections.length; i++) {
        var selection = selections[i];
        if (selection instanceof Switch || selection instanceof Button)
            inputs.push(selection);
        else if (selection instanceof LED)
            outputs.push(selection);
        else
            components.push(selection);
    }

    var ic = new IC(context, pos.x, pos.y, inputs, outputs, components, ICs.length);
    ICs.push(ic);
    return ic;
}

function writeICs(node) {
    for (var icuid = 0; icuid < ICs.length; icuid++) {
        var ic = ICs[icuid];
        var ICNode = createChildNode(node, "ic");
        createTextElement(ICNode, "icuid", icuid);
        createTextElement(ICNode, "width", ic.transform.size.x);
        createTextElement(ICNode, "height", ic.transform.size.y);

        console.log(ic);
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
