var mousePos = new Vector(0,0);
var prevMousePos = new Vector(0,0);
var worldMousePos = new Vector(0,0);

var mouseDown = false;
var mouseDownPos = undefined;

var z = 0;

var isDragging = false;
var startTapTime = undefined;

var isSidebarOpen = false;

var selectionTool = new SelectionTool();
var panTool = new PanTool();
var wiringTool = new WiringTool();
var itemTool = new ItemTool();

var currentTool = selectionTool;


// sidebar();
function sidebar() {
    isSidebarOpen = !isSidebarOpen;

    if (isSidebarOpen) {
        document.getElementById("items").style.width = "200px";
        document.getElementById("openItemsTab").style.marginLeft = "200px";
        document.getElementById("openItemsTab").innerHTML = "<";
    } else {
        document.getElementById("items").style.width = "0";
        document.getElementById("openItemsTab").style.marginLeft = "0";
        document.getElementById("openItemsTab").innerHTML = ">";
    }
}

function setupInput(canvas) {
    window.addEventListener('keydown',onKeyDown,false);
    window.addEventListener('keyup',onKeyUp,false);
    canvas.addEventListener('click', onClick, false);
    canvas.addEventListener('dblclick', onDoubleClick, false);
    canvas.addEventListener('wheel', onWheel, false);
    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('mousemove', onMouseMove, false);
}

function placeItem(item) {
    itemTool.activate(item);
}

function onKeyDown(e) {
    var code = e.keyCode;

    currentTool.onKeyDown(code);
}

function onKeyUp(e) {
    var code = e.keyCode;

    currentTool.onKeyUp(code);
}

function onClick(e) {
    if (isDragging)
        return;

    currentTool.onClick();
}

function onDoubleClick(e) {
}

function onWheel(e) {
    var delta = e.wheelDelta / 120.0;

    var factor = 0.95;
    if (delta < 0)
        factor = 1 / factor;

    var worldMousePos = camera.getWorldPos(mousePos);
    camera.zoom *= factor;
    var newMousePos = camera.getScreenPos(worldMousePos);
    var dx = (mousePos.x - newMousePos.x) * camera.zoom;
    var dy = (mousePos.y - newMousePos.y) * camera.zoom;

    camera.pos.x -= dx;
    camera.pos.y -= dy;

    popup.onWheel();

    render();
}

function onMouseDown(e) {
    isDragging = false;
    startTapTime = Date.now();
    mouseDown = true;
    mouseDownPos = new Vector(e.clientX, e.clientY);

    currentTool.onMouseDown();
}

function onMouseUp(e) {
    mouseDown = false;

    currentTool.onMouseUp();
}

function onMouseMove(e) {
    prevMousePos.x = mousePos.x;
    prevMousePos.y = mousePos.y;

    mousePos = new Vector(e.clientX, e.clientY);
    worldMousePos = camera.getWorldPos(mousePos);

    isDragging = (mouseDown && (Date.now() - startTapTime > 50));

    currentTool.onMouseMove();
}
