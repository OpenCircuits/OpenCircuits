class DLatch extends Gate {
    constructor(context, x, y) {
        super(context, false, x, y, undefined);
        this.noChange = true;
        this.setInputAmount(2);
        this.setOutputAmount(2);
        this.transform.setSize(this.transform.size.scale(1.5));
    }
    onTransformChange() {
        this.transform.setSize(V(DEFAULT_SIZE, DEFAULT_SIZE));
        super.onTransformChange();
        this.transform.setSize(V(DEFAULT_SIZE*1.5, DEFAULT_SIZE*1.5));
    }
    activate(x) {
        var on = this.outputs[1].isOn;

        var set = this.inputs[1].isOn;
        var clock = this.inputs[0].isOn;

        if (clock) {
            if (set) {
                on = true;
            } else {
            	on = false;
            }
        }

        super.activate(on, 1);
        super.activate(!on, 0);
    }
    draw() {
        super.draw();

        var renderer = this.context.getRenderer();
        this.localSpace();
        var size = this.transform.size;
        renderer.rect(0, 0, size.x, size.y, this.getCol(), '#000000', 1);

        for (var i = 0; i < this.inputs.length; i++) {		//add labels and place accordingly
            if (i == 0) {
                var name = ">";
            } else {
                var name = "D";
            }
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
        
        for (var i = 0; i < this.outputs.length; i++) {		//add labels and place accordingly
            if (i == 0) {
                var name = "Q'";
            } else {
                var name = "Q";
            }
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
        return "D Latch";
    }
}
DLatch.getXMLName = function() { return "dl"; }
Importer.types.push(DLatch);
