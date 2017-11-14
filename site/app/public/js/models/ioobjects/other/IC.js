class IC extends IOObject {
    constructor(context, data, x, y) {
        super(context, x, y, 50, 50, undefined, false, 999, 999);
        this.data = data;
        this.setup();
    }
    setup() {
        if (this.data == undefined)
            return;

        // Setup input and outputs
        this.setInputAmount(this.data.getInputAmount());
        this.setOutputAmount(this.data.getOutputAmount());

        // Copy object references
        var copy = this.data.copy();
        this.inputObjects = copy.inputs;
        this.outputObjects = copy.outputs;
        this.components = copy.components;
        for (var i = 0; i < this.outputObjects.length; i++) {
            var ii = i;
            var port = this.outputs[i];
            this.outputObjects[i].activate = function(on) {
                port.activate(on);
            }
        }
        this.noChange = true;

        this.update();
    }
    update() {
        if (this.data == undefined)
            return;

        // Update size
        this.transform.setWidth(this.data.getWidth());
        this.transform.setHeight(this.data.getHeight());

        // Update port positions
        for (var i = 0; i < this.inputs.length; i++) {
            this.inputs[i].setOrigin(this.data.iports[i].origin);
            this.inputs[i].setTarget(this.data.iports[i].target);
        }
        for (var i = 0; i < this.outputs.length; i++) {
            this.outputs[i].setOrigin(this.data.oports[i].origin);
            this.outputs[i].setTarget(this.data.oports[i].target);
        }

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
    getDisplayName() {
        return "IC";
    }
    copy() {
        return new IC(this.context, this.data, this.transform.pos.x, this.transform.pos.y);
    }
    writeTo(node) {
        var ICNode = super.writeTo(node);
        createTextElement(ICNode, "icuid", this.data.getUID());
        return ICNode;
    }
    load(node, ics) {
        super.load(node);
        var icuid = getIntValue(getChildNode(node, "icuid"));
        var data = findIC(icuid, ics);
        this.data = data;
        this.setup();
        return this;
    }
}
IC.getXMLName = function() { return "ic"; }
Importer.types.push(IC);
