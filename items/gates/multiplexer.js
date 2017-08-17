class Multiplexer extends Gate {
    constructor(context, x, y) {
        super(context, false, x, y, undefined);
    }
    setInputAmount(target) {
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

        var p1 = V(-this.transform.size.x/2, this.transform.size.y/2);
        var p2 = V(-this.transform.size.x/2, -this.transform.size.y/2);
        var p3 = V(this.transform.size.x/2, -this.transform.size.y/2+20);
        var p4 = V(this.transform.size.x/2, this.transform.size.y/2-20);

        renderer.shape([p1, p2, p3, p4], this.getCol(), this.getBorderColor(), 2);

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
