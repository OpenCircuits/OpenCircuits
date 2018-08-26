class SelectionPopup extends Popup {
    constructor() {
        super("popup");

        this.add(new TitleModule(this, "popup-name"));

        this.add(new PositionXModule(this, "popup-position-x"));
        this.add(new PositionYModule(this, "popup-position-y"));

        this.add(new InputCountModule(this, "popup-input-count", "popup-input-count-text"));

        this.add(new ColorPickerModule(this, "popup-color-picker", "popup-color-text"));

        this.add(new ICButtonModule(this, "popup-ic-button"));
        this.add(new BusButtonModule(this, "popup-bus-button"));
    }
    onKeyDown(code) {
        if ((code === DELETE_KEY || code === BACKSPACE_KEY) && !this.focused) {
            RemoveObjects(getCurrentContext(), selectionTool.selections, true);
            return;
        }
        if (code === ESC_KEY && !this.hidden) {
            selectionTool.deselectAll();
            render();
            return;
        }
    }
    onEnter() {
        this.blur();
    }
    update() {
        var selections = selectionTool.selections;
        if (selections.length > 0) {
            this.show();
            this.onMove();
        } else {
            this.hide();
        }
    }
    onMove() {
        var camera = getCurrentContext().getCamera();
        if (selectionTool.selections.length > 0) {
            selectionTool.recalculateMidpoint();
            var pos = camera.getScreenPos(selectionTool.midpoint);
            pos.y -= this.div.clientHeight/2;
            this.setPos(pos);
        }
    }
    onWheel() {
        this.onMove();
    }
}
