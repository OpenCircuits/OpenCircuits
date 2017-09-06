class SelectionPopup extends Menu {
    constructor() {
        super("popupDiv");
        this.title = document.getElementById("nameText");

        this.posX = document.getElementById("positionx");
        this.posY = document.getElementById("positiony");

        this.inputCountText = document.getElementById("inputCountText");
        this.inputCount = document.getElementById("inputcount");

        this.colorText = document.getElementById("colorText");
        this.colorPicker = document.getElementById("colorPicker");

        this.createICButton = document.getElementById("createic-button");
        this.busButton = document.getElementById("bus-button");

        this.selections = [];
    }
    onPosXChange() {
        for (var i = 0; i < this.selections.length; i++)
            this.selections[i].setPos(V(GRID_SIZE*(Number(this.posX.value)+0.5), this.selections[i].getPos().y));
        this.updatePosValue();
        render();
    }
    onPosYChange() {
        for (var i = 0; i < this.selections.length; i++)
            this.selections[i].setPos(V(this.selections[i].getPos().x, GRID_SIZE*(Number(this.posY.value)+0.5)));
        this.updatePosValue();
        render();
    }
    onInputCountChange() {
        for (var i = 0; i < this.selections.length; i++)
            this.selections[i].setInputAmount(Number(this.inputCount.value));
        render();
    }
    onColorChange() {
        for (var i = 0; i < this.selections.length; i++)
            this.selections[i].color = this.colorPicker.value;
        render();
    }
    onTitleChange() {
        for (var i = 0; i < this.selections.length; i++)
            this.selections[i].setName(this.title.value);
    }
    onTitleFocus() {
        this.focused = true;
    }
    onTitleBlur() {
        this.focused = false;
        this.onTitleChange();
    }
    onEnter() {
        if (this.posX === document.activeElement) {
            this.onPosXChange();
            this.posX.blur();
        }
        if (this.posY === document.activeElement) {
            this.onPosYChange();
            this.posY.blur();
        }
        if (this.inputCount === document.activeElement) {
            this.onInputCountChange();
            this.inputCount.blur();
        }
        if (this.title === document.activeElement) {
            this.onTitleChange();
            this.title.blur();
        }
    }
    updateTitleValue() {
        var allSame = true;
        for (var i = 0; i < this.selections.length; i++)
            allSame = allSame && this.selections[i].getName() === this.selections[0].getName();
        this.title.value = (allSame ? this.selections[0].getName() : "<Multiple>");
    }
    updatePosValue() {
        var allXSame = true, allYSame = true;
        for (var i = 0; i < this.selections.length; i++) {
            allXSame = allXSame && this.selections[i].getPos().x === this.selections[0].getPos().x;
            allYSame = allYSame && this.selections[i].getPos().y === this.selections[0].getPos().y;
        }
        this.posX.value = (allXSame ? +(this.selections[0].getPos().x/GRID_SIZE - 0.5).toFixed(3) : "");
        this.posX.placeholder = (allXSame ? "" : "-");
        this.posY.value = (allYSame ? +(this.selections[0].getPos().y/GRID_SIZE - 0.5).toFixed(3) : "");
        this.posY.placeholder = (allYSame ? "" : "-");
    }
    updateInputCountValue() {
        var allSame = true, display = true;
        var maxMinValue = 0;
        var minMaxValue = 1000;
        for (var i = 0; i < this.selections.length; i++) {
            display = display && (this.selections[i].maxInputs > 1 && this.selections[i].noChange !== true);
            allSame = allSame && this.selections[i].getInputAmount() === this.selections[0].getInputAmount();
            maxMinValue = Math.max(this.selections[i].getMinInputFieldCount(), maxMinValue);
            minMaxValue = Math.min(this.selections[i].getMaxInputFieldCount(), minMaxValue);
        }
        this.inputCount.value = (allSame ? this.selections[0].getInputAmount() : "");
        this.inputCount.placeholder = (allSame ? "" : "-");
        this.inputCountText.style.display = this.inputCount.style.display = (display ? "inherit" : "none");
        this.inputCount.min = maxMinValue;
        this.inputCount.max = minMaxValue;
    }
    updateColorValue() {
        var allLEDs = true, allSame = true;
        for (var i = 0; i < this.selections.length; i++) {
            allLEDs = allLEDs && this.selections[i] instanceof LED;
            if (allLEDs)
                allSame = allSame && this.selections[i].color === this.selections[0].color;
        }
        this.colorPicker.value = (allLEDs && allSame ? this.selections[0].color : '#ffffff');
        this.colorText.style.display = this.colorPicker.style.display = (allLEDs ? "inherit" : "none");
    }
    updateICButton() {
        var count = 0;
        for (var i = 0; i < this.selections.length; i++) {
            if (this.selections[i] instanceof IOObject && !(this.selections[i] instanceof WirePort))
                count++;
        }
        this.createICButton.style.display = (count >= 2 ? "inherit" : "none");
    }
    updateBusButton() {
        var iports = 0, oports = 0;
        for (var i = 0; i < this.selections.length; i++) {
            if (this.selections[i] instanceof IPort) {
                iports++;
            } else if (this.selections[i] instanceof OPort) {
                oports++;
            } else {
                this.busButton.style.display = "none";
                return;
            }
        }
        this.busButton.style.display = (iports === oports ? "inherit" : "none");
    }
    select(objs) {
        for (var i = 0; i < objs.length; i++)
            this.selections.push(objs[i]);

        this.updateTitleValue();
        this.updatePosValue();
        this.updateInputCountValue();
        this.updateColorValue();
        this.updateICButton();
        this.updateBusButton();

        this.onMove();
        this.show();
    }
    deselect() {
        this.selections = [];
        this.hide();
    }
    getSelectionPos() {
        var midpoint = V(0, 0);
        for (var i = 0; i < this.selections.length; i++)
            midpoint.translate(this.selections[i].getPos());
        return midpoint.scale(1.0 / this.selections.length);
    }
    onMove() {
        var camera = getCurrentContext().getCamera();
        if (this.selections.length > 0) {
            var pos = camera.getScreenPos(this.getSelectionPos());
            pos.y -= this.div.clientHeight/2;
            this.setPos(pos);
        }
    }
    onWheel() {
        this.onMove();
    }
}
