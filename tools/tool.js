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
    onMouseMove() {
    }
    onMouseDown() {
    }
    onMouseUp() {
    }
    onClick() {
    }
    draw() {
    }
}
