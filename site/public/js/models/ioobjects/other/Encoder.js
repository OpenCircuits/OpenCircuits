class Encoder extends Gate {
    constructor(context, x, y) {
        super(context, false, x, y, undefined);
    }
    onTransformChange() {
        this.transform.setSize(V(DEFAULT_SIZE, DEFAULT_SIZE));
        super.onTransformChange();
        this.transform.setSize(V(DEFAULT_SIZE, DEFAULT_SIZE/2*(2 << (this.outputs.length-1))));
    }
    setInputAmount(target) {
        target = clamp(target, 1, 8);
        super.setInputAmount(2 << (target-1));
        super.setOutputAmount(target);
    }
    getInputAmount() {
        return this.outputs.length;
    }
    activate(x) {
        var indx = -1;
        for (var i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i].isOn) {
                if (indx !== -1)
                    return; // undefined behavior
                indx = i;
            }
        }
        if (indx === -1)
            return; // undefined behavior
        for (var i = this.outputs.length-1; i >= 0; i--) {
            var num = 1 << i;
            if (num > indx) {
                this.outputs[i].activate(false);
            } else {
                this.outputs[i].activate(true);
                indx -= num;
            }
        }
    }
    draw() {
        super.draw();
        var renderer = this.context.getRenderer();
        this.localSpace();
        renderer.rect(0, 0, this.transform.size.x+20, this.transform.size.y, this.getCol(), this.getBorderColor());
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
        return "Encoder";
    }
}
Encoder.getXMLName = function() { return "encoder"; }
Importer.types.push(Encoder);
