class PanTool extends Tool {
    onKeyUp(code) {
        if (code === OPTION_KEY) { // Option key
            selectionTool.activate();
        }
    }
    onMouseMove(input) {
        if (input.isDragging) {
            var pos = new Vector(input.mousePos.x, input.mousePos.y);
            var dPos = input.mouseDownPos.sub(pos);
            input.camera.pos.x += input.camera.zoom * dPos.x;
            input.camera.pos.y += input.camera.zoom * dPos.y;
            input.mouseDownPos = input.mousePos;

            popup.onMove();

            return true;
        }
    }
}
