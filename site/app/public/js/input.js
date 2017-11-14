var num = 0;
class Input {
    constructor(parent) {
        this.parent = parent;
        this.canvas = parent.renderer.canvas;
        this.camera = parent.camera;

        this.num = (num++);

        this.rawMousePos = new Vector(0, 0);
        this.mousePos = new Vector(0,0);
        this.prevMousePos = new Vector(0,0);
        this.worldMousePos = new Vector(0,0);

        this.mouseDown = false;
        this.mouseDownPos = undefined;

        this.z = 0;

        this.shiftKeyDown = false;
        this.modiferKeyDown = false;
        this.optionKeyDown = false;

        this.isDragging = false;
        this.startTapTime = undefined;
        this.setup();
    }
    setup() {
        var canvas = this.parent.renderer.canvas;
        window.addEventListener('keydown', e => {if (this === getCurrentContext().getInput())this.onKeyDown(e);}, false);
        window.addEventListener('keyup', e => {if (this === getCurrentContext().getInput())this.onKeyUp(e);}, false);
        canvas.addEventListener('click', e => this.onClick(e), false);
        canvas.addEventListener('dblclick', e => this.onDoubleClick(e), false);
        // if (browser.name !== "Firefox")
            canvas.addEventListener('wheel', e => this.onWheel(e), false);
        // else
        //     canvas.addEventListener('DOMMouseScroll', e => this.onWheel(e), false);
        canvas.addEventListener('mousedown', e => this.onMouseDown(e), false);
        canvas.addEventListener('mouseup', e => this.onMouseUp(e), false);
        canvas.addEventListener('mousemove', e => this.onMouseMove(e), false);

        canvas.addEventListener("contextmenu", function(e) {
            contextmenu.show(e);
            e.preventDefault();
        });
    }
    onKeyDown(e) {
        var code = e.keyCode;

        if (code === SHIFT_KEY)
            this.shiftKeyDown = true;
        else if (code === CONTROL_KEY || code === COMMAND_KEY)
            this.modiferKeyDown = true;
        else if (code === OPTION_KEY) {
            this.optionKeyDown = true;
            getCurrentContext().setCursor("pointer");
        } else if (code === ENTER_KEY && document.activeElement === projectNameInput)
            projectNameInput.blur();

        var objects = this.parent.getObjects();
        for (var i = 0; i < objects.length; i++) {
            if (objects[i] instanceof Keyboard)
                objects[i].onKeyDown(code);
        }

        this.parent.history.onKeyDown(code, this);
        if (currentTool.onKeyDown(code, this))
            render();
    }
    onKeyUp(e) {
        var code = e.keyCode;

        if (code === SHIFT_KEY)
            this.shiftKeyDown = false;
        else if (code === CONTROL_KEY || code === COMMAND_KEY)
            this.modiferKeyDown = false;
        else if (code === OPTION_KEY) {
            this.optionKeyDown = false;
            getCurrentContext().setCursor("default");
        }

        var objects = this.parent.getObjects();
        for (var i = 0; i < objects.length; i++) {
            if (objects[i] instanceof Keyboard)
                objects[i].onKeyUp(code);
        }

        currentTool.onKeyUp(code, this);
    }
    onDoubleClick(e) {
    }
    onWheel(e) {
        var delta = -e.deltaY / 120.0;

        var factor = 0.95;
        if (delta < 0)
            factor = 1 / factor;

        var worldMousePos = this.camera.getWorldPos(this.mousePos);
        this.camera.zoomBy(factor);
        var newMousePos = this.camera.getScreenPos(this.worldMousePos);
        var dx = (this.mousePos.x - newMousePos.x) * this.camera.zoom;
        var dy = (this.mousePos.y - newMousePos.y) * this.camera.zoom;

        this.camera.translate(-dx, -dy);

        popup.onWheel();

        render();
    }
    onMouseDown(e) {
        var rect = this.canvas.getBoundingClientRect();
        this.isDragging = false;
        this.startTapTime = Date.now();
        this.mouseDown = true;
        this.mouseDownPos = new Vector(e.clientX - rect.left, e.clientY - rect.top);

        if (e.button === 0) { // Left mouse down
            var shouldRender = false;
            contextmenu.hide();
            shouldRender = currentTool.onMouseDown(this);
            shouldRender = icdesigner.onMouseDown(this) || shouldRender;
            if (shouldRender)
                render();
        }
    }
    onMouseMove(e) {
        var rect = this.canvas.getBoundingClientRect();

        this.prevMousePos.x = this.mousePos.x;
        this.prevMousePos.y = this.mousePos.y;

        this.rawMousePos = new Vector(e.clientX, e.clientY);
        this.mousePos = new Vector(e.clientX - rect.left, e.clientY - rect.top);
        this.worldMousePos = this.camera.getWorldPos(this.mousePos);

        // console.log("Move : " + (e.clientX - rect.left) + ", " + (e.clientY - rect.top));

        this.isDragging = (this.mouseDown && (Date.now() - this.startTapTime > 50));

        var shouldRender = false;

        if (this.optionKeyDown && this.isDragging) {
            var pos = new Vector(this.mousePos.x, this.mousePos.y);
            var dPos = this.mouseDownPos.sub(pos);
            this.camera.translate(this.camera.zoom * dPos.x, this.camera.zoom * dPos.y);
            this.mouseDownPos = this.mousePos;

            popup.onMove();
            shouldRender = true;
        }

        shouldRender = currentTool.onMouseMove(this) || shouldRender;
        shouldRender = icdesigner.onMouseMove(this) || shouldRender;
        if (shouldRender)
            render();
    }
    onMouseUp(e) {
        this.mouseDown = false;

        var shouldRender = false;
        shouldRender = currentTool.onMouseUp(this);
        shouldRender = icdesigner.onMouseUp(this) || shouldRender;
        if (shouldRender)
            render();
    }
    onClick(e) {
        if (this.isDragging)
            return;

        if (currentTool.onClick(this))
            render();
    }
}

var clipboard = new Clipboard();

var wiringTool = new WiringTool();
var itemTool = new ItemTool();
var selectionTool = new SelectionTool();
var currentTool = selectionTool;

var header = document.getElementById("header");
var projectNameInput = document.getElementById("project-name");

var justDragged = false;

function placeItem(item, not) {
    if (not)
        item.not = not;
    var rect = getCurrentContext().getInput().canvas.getBoundingClientRect();
    itemTool.activate(item, getCurrentContext());
    if (justDragged) {
        getCurrentContext().getInput().onMouseMove(event);
        itemTool.onMouseMove(getCurrentContext().getInput())
        itemTool.onClick();
    }
    justDragged = false;
}

function onDragEnd(event) {
    justDragged = true;
    event.srcElement.parentElement.onclick();
}
