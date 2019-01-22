class JKFlipFlop extends Gate {
    constructor(context, x, y) {
        super(context, false, x, y, undefined);
        this.noChange = true;
        this.setInputAmount(3);
        this.setOutputAmount(2);
        this.transform.setSize(this.transform.size.scale(1.5));
		this.clock = false;
		this.last_clock = false;
		this.state = false;
    }
    onTransformChange() {
        this.transform.setSize(V(DEFAULT_SIZE, DEFAULT_SIZE));
        super.onTransformChange();
        this.transform.setSize(V(DEFAULT_SIZE*1.5, DEFAULT_SIZE*1.5));
    }
    activate(x) {
		this.last_clock = this.clock;
        this.clock = this.inputs[1].isOn;
        var set = this.inputs[0].isOn;
        var reset = this.inputs[2].isOn;
        if (this.clock && !this.last_clock) {
            if (set && reset) {
                this.state = !this.state;
            } else if (set) {
                this.state = true;
            } else if (reset) {
                this.state = false;
            }
        }

        super.activate(this.state, 0);
        super.activate(!this.state, 1);
    }
    draw() {
        super.draw();

        var renderer = this.context.getRenderer();
        this.localSpace();
        renderer.rect(0, 0, this.transform.size.x, this.transform.size.y, this.getCol(), this.getBorderColor());
        var size = this.transform.size;
        
        for (var i = 0; i < this.inputs.length; i++) {          //add input labels and place
            if (i == 1) {
                var name = ">";
            } else if (i == 0) {
                var name = "K";
            } else {
                var name = "J";
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
        for (var i = 0; i < this.outputs.length; i++) {         //add output labels and place
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
        return "JK Flip Flop";
    }
}
JKFlipFlop.getXMLName = function() { return "srff"; }
Importer.types.push(JKFlipFlop);
