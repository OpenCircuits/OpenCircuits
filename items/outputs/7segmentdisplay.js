class SevenSegmentDisplay extends IOObject {
    constructor(context, x, y) {
        super(context, x, y, 100*7/10, 100, undefined, false, 7, 0);
        this.setInputAmount(7);
        this.noChange = true;
        this.segmentWidth = 45;
        this.segmentHeight = 10;

        for (var ii = 0; ii < 7; ii++) {
            var iport = this.inputs[ii];
            var i = iport.getIndex();

            var l = -15*(i - iport.getArray().length/2.0 + 0.5);

            iport.setOrigin(V(iport.origin.x, l));
            iport.setTarget(V(iport.target.x, l));
        }
        var w = this.transform.size.x;
        var h = this.transform.size.y;

        var padding = 15;

        var sw = this.segmentWidth;
        var sh = this.segmentHeight;

        this.segmentPositions = [V(0, -sw+sh),
                                 V(sw/2-sh/2, (-sw+sh)/2),
                                 V(sw/2-sh/2, (+sw-sh)/2),
                                 V(0, sw-sh),
                                 V(-sw/2+sh/2, (+sw-sh)/2),
                                 V(-sw/2+sh/2, (-sw+sh)/2),
                                 V(0, 0)];
        this.segmentSizes = [V(sw,sh), V(sh,sw), V(sh, sw), V(sw, sh), V(sh, sw), V(sh, sw), V(sw, sh)];
        this.segmentImages = [images["segment1.svg"], images["segment2.svg"], images["segment2.svg"], images["segment1.svg"], images["segment2.svg"], images["segment2.svg"], images["segment1.svg"]];
        this.segmentOnImages = [images["segment3.svg"], images["segment4.svg"], images["segment4.svg"], images["segment3.svg"], images["segment4.svg"], images["segment4.svg"], images["segment3.svg"]];
    }
    draw() {
        super.draw();

        this.localSpace();
        var renderer = this.context.getRenderer();
        renderer.rect(0, 0, this.transform.size.x, this.transform.size.y, this.getCol(), this.getBorderColor());

        for (var i = 0; i < 7; i++) {
            var pos = this.segmentPositions[i];
            var size = this.segmentSizes[i];
            var on = this.inputs[i].isOn;
            var img = (on ? this.segmentOnImages[i] : this.segmentImages[i]);

            renderer.image(img, pos.x, pos.y, size.x, size.y, undefined);
        }

        renderer.restore();
    }
    getDisplayName() {
        return "7 Segment Display";
    }
    getXMLName() {
        return "sevensegmentdisplay";
    }
}
SevenSegmentDisplay.getXMLName = function() { return "sevensegmentdisplay"; }
Importer.types.push(SevenSegmentDisplay);
