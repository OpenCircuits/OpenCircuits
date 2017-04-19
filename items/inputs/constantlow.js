class ConstantLow extends IOObject {
    constructor(x, y) {
        super(x, y, 50, 50, images["constLow.svg"], false, 0, 1);
        super.activate(false);
    }
    getDisplayName() {
        return "Constant Low";
    }
}
