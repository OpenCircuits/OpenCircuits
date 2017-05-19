var images = [];
var objects = [];
var wires = [];

var propogationQueue = [];

var updateRequests = 0;

var popup;

const UPS = 6;

function getIndexOfObject(obj) {
    for (var i = 0; i < objects.length; i++) {
        if (obj === objects[i])
            return i;
    }
    return -1;
}

function getIndexOfWire(wire) {
    for (var i = 0; i < wires.length; i++) {
        if (wire === wires[i])
            return i;
    }
    return -1;
}

class Propogation {
    constructor(sender, receiver, signal) {
        this.sender = sender;
        this.receiver = receiver;
        this.signal = signal;

        if (updateRequests === 0) {
            updateRequests++;
            setTimeout(update, 1000/UPS);
        }
    }
    send() {
        this.receiver.activate(this.signal);
    }
}

function start() {
    loadImage(images,
        ["constLow.svg", "constHigh.svg",
         "buttonUp.svg", "buttonDown.svg",
         "switchUp.svg", "switchDown.svg",
         "led.svg", "ledLight.svg",
         "buffer.svg", "and.svg",
         "or.svg", "xor.svg",
         "base.svg"], 0, onFinishLoading);
}

function wire(source, target) {
    var wire = new Wire(source);
    source.connect(wire);
    wire.connect(target);
}

function onFinishLoading() {
    frame.start();

    popup = new SelectionPopup();

    // var o = new ANDGate(false, 0, 0);
    // objects.push(o);
    //
    // o.transform.transformCtx(frame.context);
    // frame.context.drawImage(o.img, -20, -20, 40, 40);
    //
    // o.rotate(1*Math.PI/4, V(100, 0));
    //
    // o.transform.transformCtx(frame.context);
    // frame.context.drawImage(o.img, -20, -20, 40, 40);
    // o.draw();

    render();
}

function update() {
    console.log("UPDATE");

    var tempQueue = [];
    while (propogationQueue.length > 0)
        tempQueue.push(propogationQueue.pop());

    while (tempQueue.length > 0)
        tempQueue.pop().send();

    if (propogationQueue.length > 0)
        updateRequests++;

    updateRequests--;

    render();

    if (updateRequests > 0) {
        setTimeout(update, 1000/UPS);
    }
}

function render() {
    console.log("RENDER");

    frame.clear();

    frame.context.strokeStyle = '#999';
    frame.context.lineWidth = 1 / camera.zoom;

    var step = 50/camera.zoom;

    var cpos = V(camera.pos.x/camera.zoom - frame.canvas.width/2, camera.pos.y/camera.zoom - frame.canvas.height/2);

    var cpx = cpos.x - Math.floor(cpos.x / step) * step;
    if (cpx < 0) cpx += step;
    var cpy = cpos.y - Math.floor(cpos.y / step) * step;
    if (cpy < 0) cpy += step;

    for (var x = -cpx; x <= frame.canvas.width-cpx+step; x += step) {
        frame.context.beginPath();
        frame.context.moveTo(x, 0);
        frame.context.lineTo(x, frame.canvas.height);
        frame.context.stroke();
        frame.context.closePath();
    }
    for (var y = -cpy; y <= frame.canvas.height-cpy+step; y += step) {
        frame.context.beginPath();
        frame.context.moveTo(0, y);
        frame.context.lineTo(frame.canvas.width, y);
        frame.context.stroke();
        frame.context.closePath();
    }

    for (var i = 0; i < wires.length; i++)
        wires[i].draw();

    for (var i = 0; i < objects.length; i++)
        objects[i].draw();

    selectionTool.draw();
}

function loadImage(imgs, imageNames, index, onFinish) {
    var img = new Image();
    img.onload = function() {
        imgs[imageNames[index]] = img;
        img.dx = 0;
        img.dy = 0;
        img.ratio = img.width / img.height;
        if (index === imageNames.length-1)
            onFinish(imgs);
        else
            loadImage(imgs, imageNames, index+1, onFinish);
    }
    img.src = "images/items/" + imageNames[index];
}
