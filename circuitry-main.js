var images = [];
var objects = [];
var wires = [];

var propogationQueue = [];

var updateRequests = 0;

const UPS = 10;

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
        ["img-constLow.svg", "img-constHigh.svg",
         "img-buttonUp.svg", "img-buttonDown.svg",
         "img-switchUp.svg", "img-switchDown.svg",
         "img-led.svg", "img-ledLight.svg",
         "img-buffer.svg", "img-and.svg",
         "img-or.svg", "img-xor.svg"], 0, onFinishLoading);
}

function onFinishLoading() {
    frame.start();

    // objects.push(new ANDGate(false, 0, 0));
    // objects.push(new ANDGate(true, 0, -50));
    // objects.push(new XORGate(false, 100, -50));
    // objects.push(new XORGate(true, 100, 50));
    // objects.push(new BUFGate(false, 0, 50));
    // objects.push(new BUFGate(true, 0, 100));

    var a = 3*Math.PI/4;

    // objects.push(new ANDGate(false, 100, 0));
    // objects[objects.length-1].setAngle(a);
    // objects.push(new ANDGate(true, 150, 0));
    // objects[objects.length-1].setAngle(a);
    // objects.push(new XORGate(false, 100, -120));
    // objects[objects.length-1].setAngle(a);
    // objects.push(new XORGate(true, 150, -120));
    // objects[objects.length-1].setAngle(a);
    // objects.push(new BUFGate(false, 100, 120));
    // objects[objects.length-1].setAngle(a);
    // objects.push(new BUFGate(true, 150, 120));
    // objects[objects.length-1].setAngle(a);

    // S-R Flip flop

    objects.push(new Switch(-100, 0));
    objects.push(new Switch(-100, 100));
    objects.push(new Switch(-100, -100));

    objects.push(new ANDGate(false, 75, 50));
    objects.push(new ANDGate(false, 75, -50));

    objects.push(new ORGate(true, 250, 50));
    objects.push(new ORGate(true, 250, -50));

    objects.push(new LED(350, -50, '#fff'));


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
    frame.context.lineWidth = 1;

    var step = 50/camera.zoom;

    var cpos = V(camera.pos.x/camera.zoom - frame.canvas.width/2, camera.pos.y/camera.zoom - frame.canvas.height/2);

    var cpx = cpos.x - Math.floor(cpos.x / step) * step;
    if (cpx < 0) cpx += step;
    var cpy = cpos.y - Math.floor(cpos.y / step) * step;
    if (cpy < 0) cpy += step;

    for (var x = -cpx; x <= frame.canvas.width-cpx+step; x += step) {
        frame.context.moveTo(x, 0);
        frame.context.lineTo(x, frame.canvas.height);
        frame.context.stroke();
    }
    for (var y = -cpy; y <= frame.canvas.height-cpy+step; y += step) {
        frame.context.moveTo(0, y);
        frame.context.lineTo(frame.canvas.width, y);
        frame.context.stroke();
    }

    for (var i = 0; i < wires.length; i++)
        wires[i].draw();

    for (var i = 0; i < objects.length; i++)
        objects[i].draw();
}

function loadImage(imgs, imageNames, index, onFinish) {
    var img = new Image();
    img.onload = function() {
        imgs[imageNames[index]] = img;
        img.dx = 0;
        img.dy = 0;
        if (index === imageNames.length-1)
            onFinish(imgs);
        else
            loadImage(imgs, imageNames, index+1, onFinish);
    }
    img.src = imageNames[index];
}
