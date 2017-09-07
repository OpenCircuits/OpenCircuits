class Label extends IOObject {
    constructor(context, x, y) {
        super(context, x, y, 0, 0, undefined, true, 0, 0, 60, 30);
        this.setName("LABEL");

        this.setInputAmount(0);
        this.setOutputAmount(0);
    }
    activate(x) {
    }
    draw() {
        super.draw();

        var renderer = this.context.getRenderer();

        this.localSpace();

        var align = "center";
        var padding = 8;
        var ww = renderer.getTextWidth(this.text)/2;
        var pos = V(0, 0);
        renderer.text(this.name, pos.x, pos.y, 0, 0, align);

        renderer.restore();
    }
    setName(name) {
        super.setName(name);
        var renderer = this.context.getRenderer();
        var width = renderer.getTextWidth(this.name) + 20;
        this.selectionBoxTransform.setSize(V(width, this.selectionBoxTransform.size.y));
        this.onTransformChange();
        render();
    }
    getDisplayName() {
        return this.name;
    }
}
Label.getXMLName = function() { return "label"; }
Importer.types.push(Label);
