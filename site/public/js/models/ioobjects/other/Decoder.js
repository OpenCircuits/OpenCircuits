class Decoder extends Gate {
    constructor(context, x, y) {
        super(context, false, x, y, undefined);
        this.activate(0);
    }
    onTransformChange() {
        this.transform.setSize(V(DEFAULT_SIZE, DEFAULT_SIZE));
        super.onTransformChange();
        this.transform.setSize(V(DEFAULT_SIZE, DEFAULT_SIZE/2*(2 << (this.inputs.length-1))));
    }
    setInputAmount(target) {
        target = clamp(target, 1, 8);
        super.setInputAmount(target);
        super.setOutputAmount(2 << (target-1));
    }
    getInputAmount() {
        return this.inputs.length;
    }
    activate(x) {
        var num = 0;
        for (var i = 0; i < this.inputs.length; i++)
            num = num | ((this.inputs[i].isOn ? 1 : 0) << i);
        for (var i = 0; i < this.outputs.length; i++)
            this.outputs[i].activate(i === num, i);
    }
    draw() {
        super.draw();

        var renderer = this.context.getRenderer();
        this.localSpace();
        renderer.rect(0, 0, this.transform.size.x + 20, this.transform.size.y, this.getCol(), this.getBorderColor());
        var size = this.transform.size;

        for (var i = 0; i < this.inputs.length; i++) {      //add labels to inputs
            var name = "D" + String(i);
            var pos1 = this.transform.toLocalSpace(this.inputs[i].getPos());
            var align = "center";
            var padding = 8;
            var ww = renderer.getTextWidth(name)/2;
            var pos = getNearestPointOnRect(V(-size.x/2, -size.y/2), V(size.x/2, size.y/2), pos1);
            pos = pos.sub(pos1).normalize().scale(padding).add(pos);
            pos.x = clamp(pos.x, -size.x/2+padding+ww, size.x/2-padding-ww);
            pos.y = clamp(pos.y, -size.y/2+14, size.y/2-14);
            renderer.text(name, pos.x-15, pos.y, 0, 0, align);
        }
        for (var i = 0; i < this.outputs.length; i++) {     //add labels to outputs
            var name = "Q" + String(i);
            var pos1 = this.transform.toLocalSpace(this.outputs[i].getPos());
            var align = "center";
            var padding = 8;
            var ww = renderer.getTextWidth(name)/2;
            var pos = getNearestPointOnRect(V(-size.x/2, -size.y/2), V(size.x/2, size.y/2), pos1);
            pos = pos.sub(pos1).normalize().scale(padding).add(pos);
            pos.x = clamp(pos.x, -size.x/2+padding+ww, size.x/2-padding-ww);
            pos.y = clamp(pos.y, -size.y/2+14, size.y/2-14);
            renderer.text(name, pos.x+15, pos.y, 0, 0, align);
        }
        renderer.restore();
    }
    getMinInputFieldCount() {
        return 1;
    }
    getDisplayName() {
        return "Decoder";
    }
}
Decoder.getXMLName = function() { return "decoder"; }
Importer.types.push(Decoder);
