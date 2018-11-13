class Multiplexer extends Gate {
    constructor(context, x, y) {
        super(context, false, x, y, undefined);
    }
    setInputAmount(target) {
        // if input was zero or negative, mux would glitch
        target = clamp(target, 1, 8);

        super.setInputAmount(target + (2 << (target-1)));

        var width = Math.max(DEFAULT_SIZE/2*(target-1), DEFAULT_SIZE);
        var height = DEFAULT_SIZE/2*(2 << (target-1));
        this.transform.setSize(V(width+10, height));

        this.selectLines = [];
        for (var i = 0; i < target; i++) {
            var input = this.inputs[i];
            this.selectLines.push(input);

            var l = -DEFAULT_SIZE/2*(i - target/2 + 0.5);
            if (i === 0) l -= 1;
            if (i === target-1) l += 1;

            input.setOrigin(V(l, 0));
            input.setTarget(V(l, IO_PORT_LENGTH+height/2-DEFAULT_SIZE/2));
        }
        for (var ii = target; ii < this.inputs.length; ii++) {
            var input = this.inputs[ii];

            var i = ii - target;

            var l = -DEFAULT_SIZE/2*(i - (this.inputs.length-target)/2 + 0.5);
            if (i === 0) l -= 1;
            if (i === this.inputs.length-target-1) l += 1;

            input.setOrigin(V(0, l));
            input.setTarget(V(-IO_PORT_LENGTH-(width/2-DEFAULT_SIZE/2), l));
        }
        var output = this.outputs[0];
        output.target = V(IO_PORT_LENGTH+(width/2-DEFAULT_SIZE/2), output.target.y);
    }
    getInputAmount() {
        return this.selectLines.length;
    }
    activate(x) {
        var num = 0;
        for (var i = 0; i < this.selectLines.length; i++)
            num = num | ((this.selectLines[i].isOn ? 1 : 0) << i);
        super.activate(this.inputs[num + this.selectLines.length].isOn);
    }
    draw() {
        super.draw();

        var renderer = this.context.getRenderer();
        this.localSpace();

        var p1 = V(-this.transform.size.x/2 - 5, this.transform.size.y/2 + 25);
        var p2 = V(-this.transform.size.x/2 - 5, -this.transform.size.y/2 - 25);
        var p3 = V(this.transform.size.x/2 + 5, -this.transform.size.y/2 - 7);
        var p4 = V(this.transform.size.x/2 + 5, this.transform.size.y/2 + 7);

        renderer.shape([p1, p2, p3, p4], this.getCol(), this.getBorderColor(), 2);

        var size = this.transform.size;

        for (var i = 0; i < this.inputs.length; i++) {      //add labels to input and select lines
            if (i < this.selectLines.length){
                var name = "S" + String(i);
            } else {
                var name = "D" + String(i-this.selectLines.length);
            }
            var pos1 = this.transform.toLocalSpace(this.inputs[i].getPos());
            var align = "center";
            var padding = 8;
            var ww = renderer.getTextWidth(name)/2 - 10;
            var pos = getNearestPointOnRect(V(-size.x/2, -size.y/2), V(size.x/2, size.y/2), pos1);
            pos = pos.sub(pos1).normalize().scale(padding).add(pos);
            pos.x = clamp(pos.x, -size.x/2+padding+ww, size.x/2-padding-ww);
            pos.y = clamp(pos.y, -size.y/2, size.y/2);
            if (i < this.selectLines.length) {
                renderer.text(name, pos.x, pos.y + (i * 2.7) + 5, 0, 0, align);     //for select lines, print at am amngle, aligning to bottom
            } else {
                renderer.text(name, pos.x, pos.y, 0, 0, align);
            }
        }
        for (var i = 0; i < this.outputs.length; i++) {     //add labels to output
            var name = "Q" + String(i);
            var pos1 = this.transform.toLocalSpace(this.outputs[i].getPos());
            var align = "center";
            var padding = 8;
            var ww = renderer.getTextWidth(name)/2 - 10;
            var pos = getNearestPointOnRect(V(-size.x/2, -size.y/2), V(size.x/2, size.y/2), pos1);
            pos = pos.sub(pos1).normalize().scale(padding).add(pos);
            pos.x = clamp(pos.x, -size.x/2+padding+ww, size.x/2-padding-ww);
            pos.y = clamp(pos.y, -size.y/2, size.y/2);
            renderer.text(name, pos.x, pos.y, 0, 0, align);
        }

        renderer.restore();
    }
    getMinInputFieldCount() {
        return 1;
    }
    getDisplayName() {
        return "Multiplexer";
    }
    getXMLName() {
        return "mux";
    }
}
Multiplexer.getXMLName = function() { return "mux"; }
Importer.types.push(Multiplexer);
