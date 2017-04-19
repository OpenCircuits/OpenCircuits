class ConstantHigh extends IOObject {
    constructor(x, y) {
        super(x, y, 50, 50, images["constHigh.svg"], false, 0, 1);
        super.activate(true);
    }
    getDisplayName() {
        return "Constant High";
    }
}
