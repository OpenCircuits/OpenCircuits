class Tool {
    constructor() {
        this.isActive = false;
    }
    activate() {
        currentTool.deactivate();

        currentTool = this;
        this.isActive = true;
        render();
    }
    deactivate() {
        this.isActive = false;
    }
    onKeyDown(code) {
    }
    onKeyUp(code) {
    }
    onMouseDown() {
    }
    onMouseMove() {
    }
    onMouseUp() {
    }
    onClick() {
    }
    draw() {
    }
}
