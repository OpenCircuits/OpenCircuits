var images = [];
var objects = [];
var wires = [];

var propogationQueue = [];

var updateRequests = 0;

var popup;

const UPS = 60;

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

class SelectionPopup {
    constructor() {
        this.div = document.getElementById("popupDiv");
        this.title = document.getElementById("nameText");

        this.posX = document.getElementById("positionx");
        this.posY = document.getElementById("positiony");

        this.inputCountText = document.getElementById("inputCountText");
        this.inputCount = document.getElementById("inputcount");

        this.colorText = document.getElementById("colorText");
        this.colorPicker = document.getElementById("colorPicker");

        this.setPos(V(0,0));
        this.hide();
    }
    onInputChange() {
        if (this.selection !== undefined) {
            this.selection.setPos(V(Number(this.posX.value)+0.5, Number(this.posY.value)+0.5).scale(50));
            if (this.selection.maxInputs > 1)
                this.selection.setInputAmount(Number(this.inputCount.value));
            if (this.selection instanceof LED)
                this.selection.color = this.colorPicker.value;

            render();
        }
    }
    select(obj) {
        this.selection = obj;
        this.setTitle(obj.getDisplayName());

        this.posX.value = this.selection.getPos().x/50 - 0.5;
        this.posY.value = this.selection.getPos().y/50 - 0.5;

        this.inputCount.value = this.selection.getInputAmount();
        this.inputCountText.style.display = (this.selection.maxInputs > 1 ? "inherit" : "none");
        this.inputCount.style.display = (this.selection.maxInputs > 1 ? "inherit" : "none");

        if (this.selection instanceof LED)
            this.colorPicker.value = this.selection.color;
        this.colorText.style.display = (this.selection instanceof LED > 0 ? "inherit" : "none");
        this.colorPicker.style.display = (this.selection instanceof LED > 0 ? "inherit" : "none");

        this.onMove();
        this.show();
    }
    deselect() {
        this.selection = undefined;
        this.hide();
    }
    onMove() {
        if (this.selection !== undefined) {
            var pos = camera.getScreenPos(this.selection.getPos());
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
    setTitle(x) {
        this.title.innerHTML = x;
    }
    setPos(v) {
        this.pos = V(v.x, v.y);
        this.clamp();

        this.div.style.left = this.pos.x;
        this.div.style.top = this.pos.y;
    }
    clamp() {
        this.pos.x = Math.max(Math.min(this.pos.x, frame.canvas.width-this.div.clientWidth-1), isSidebarOpen ? 210 : 10);
        this.pos.y = Math.max(Math.min(this.pos.y, frame.canvas.height-this.div.clientHeight-1), 46);
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

    popup = new SelectionPopup();

    // popup.show();

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

    objects.push(new LED(350, -50, '#ff0000'));


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
