class ConstantHigh extends IOObject {
    constructor(context, x, y) {
        super(context, x, y, DEFAULT_SIZE, DEFAULT_SIZE, images["constHigh.svg"], false, 0, 1);
        super.activate(true);
    }
    getDisplayName() {
        return "Constant High";
    }
}
ConstantHigh.getXMLName = function() { return "consthigh"; }
Importer.types.push(ConstantHigh);
