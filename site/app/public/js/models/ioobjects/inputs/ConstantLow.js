class ConstantLow extends IOObject {
    constructor(context, x, y) {
        super(context, x, y, DEFAULT_SIZE, DEFAULT_SIZE, images["constLow.svg"], false, 0, 1);
        super.activate(false);
    }
    getDisplayName() {
        return "Constant Low";
    }
}
ConstantLow.getXMLName = function() { return "constlow"; }
Importer.types.push(ConstantLow);
