class PanTool extends Tool {
    onKeyUp(code) {
        if (code === 18) { // Option key
            selectionTool.activate();
        }
    }
    onMouseMove() {
        if (isDragging) {
            var pos = new Vector(mousePos.x, mousePos.y);
            var dPos = mouseDownPos.sub(pos);
            camera.pos.x += camera.zoom * dPos.x;
            camera.pos.y += camera.zoom * dPos.y;
            mouseDownPos = mousePos;

            popup.onMove();

            render();
        }
    }
}
