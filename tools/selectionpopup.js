class SelectionPopup {
    constructor() {
        this.div = document.getElementById("popupDiv");
        this.div.style.position = "absolute";
        this.title = document.getElementById("nameText");
        this.focused = false;

        this.posX = document.getElementById("positionx");
        this.posY = document.getElementById("positiony");

        this.inputCountText = document.getElementById("inputCountText");
        this.inputCount = document.getElementById("inputcount");

        this.colorText = document.getElementById("colorText");
        this.colorPicker = document.getElementById("colorPicker");

        this.createICButton = document.getElementById("createic-button");

        this.selections = [];

        this.setPos(V(0,0));
        this.hide();
    }
    onPosXChange() {
        for (var i = 0; i < this.selections.length; i++)
            this.selections[i].setPos(V(50*(Number(this.posX.value)+0.5), this.selections[i].getPos().y));
        render();
    }
    onPosYChange() {
        for (var i = 0; i < this.selections.length; i++)
            this.selections[i].setPos(V(this.selections[i].getPos().x, 50*(Number(this.posY.value)+0.5)));
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
        this.posX.value = (allXSame ? this.selections[0].getPos().x/50 - 0.5 : "");
        this.posX.placeholder = (allXSame ? "" : "-");
        this.posY.value = (allYSame ? this.selections[0].getPos().y/50 - 0.5 : "");
        this.posY.placeholder = (allYSame ? "" : "-");
    }
    updateInputCountValue() {
        var allSame = true, display = true;
        for (var i = 0; i < this.selections.length; i++) {
            display = display && (this.selections[i].maxInputs > 1 && this.selections[i].noChange !== true);
            allSame = allSame && this.selections[i].getInputAmount() === this.selections[0].getInputAmount();
        }
        this.inputCount.value = (allSame ? this.selections[0].getInputAmount() : "");
        this.inputCount.placeholder = (allSame ? "" : "-");
        this.inputCountText.style.display = this.inputCount.style.display = (display ? "inherit" : "none");
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
        this.createICButton.style.display = (this.selections.length > 1 ? "inherit" : "none");
    }
    select(obj) {
        for (var i = 0; i < obj.length; i++)
            this.selections.push(obj[i]);

        this.updateTitleValue();
        this.updatePosValue();
        this.updateInputCountValue();
        this.updateColorValue();
        this.updateICButton();

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
        if (this.selections.length > 0) {
            var pos = camera.getScreenPos(this.getSelectionPos());
            pos.y -= this.div.clientHeight;
            this.setPos(pos);
        }
    }
    onWheel() {
        this.onMove();
    }
    show() {
        this.hidden = false;
        this.div.style.visibility = "visible";
    }
    hide() {
        this.hidden = true;
        this.div.style.visibility = "hidden";
    }
    setPos(v) {
        this.pos = V(v.x, v.y);
        this.clamp();

        this.div.style.left = this.pos.x + "px";
        this.div.style.top = this.pos.y + "px";
    }
    clamp() {
        this.pos.x = Math.max(Math.min(this.pos.x, frame.canvas.width-this.div.clientWidth-1), isSidebarOpen ? 210 : 10);
        this.pos.y = Math.max(Math.min(this.pos.y, frame.canvas.height-this.div.clientHeight-1), 46);
    }
}
