var images = [];
var objects = [];
var wires = [];

var propogationQueue = [];

var updateRequests = 0;

var popup;

const UPS = 60;

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
    updatePosValue() {
        this.posX.value = this.selection.getPos().x/50 - 0.5;
        this.posY.value = this.selection.getPos().y/50 - 0.5;
    }
    select(obj) {
        this.selection = obj;
        this.setTitle(obj.getDisplayName());

        this.updatePosValue();

        this.inputCount.value = this.selection.getInputAmount();
        this.inputCountText.style.display = (this.selection.maxInputs > 1 && this.selection.noChange !== true ? "inherit" : "none");
        this.inputCount.style.display = (this.selection.maxInputs > 1 && this.selection.noChange !== true ? "inherit" : "none");

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


    // S-R Flip flop

    // objects.push(new Switch(-225, 0));
    // objects.push(new Switch(-225, 100));
    // objects.push(new Switch(-225, -100));
    //
    // objects.push(new ANDGate(false, -50, 50));
    // objects.push(new ANDGate(false, -50, -50));
    //
    // objects.push(new ORGate(true, 125, 50));
    // objects.push(new ORGate(true, 125, -50));
    //
    // objects.push(new LED(225, 0, '#ff0000'));
    //
    // // objects.push(new SRFlipFlop(0, 0));
    //
    // // for (var i = 0; i < objects.length; i++)
    // //     objects[i].setAngle(Math.random() * 2 * Math.PI);
    //
    // wire(objects[0].outputs[0], objects[3].inputs[1]);
    // wire(objects[1].outputs[0], objects[3].inputs[0]);
    // wire(objects[0].outputs[0], objects[4].inputs[0]);
    // wire(objects[2].outputs[0], objects[4].inputs[1]);
    // wire(objects[3].outputs[0], objects[5].inputs[0]);
    // wire(objects[4].outputs[0], objects[6].inputs[1]);
    // wire(objects[5].outputs[0], objects[6].inputs[0]);
    // wire(objects[6].outputs[0], objects[5].inputs[1]);
    // wire(objects[6].outputs[0], objects[7].inputs[0]);

    // objects.push(new Switch(-150, 50));
    // objects.push(new Switch(-150, -50));
    //
    // objects.push(new ANDGate(false, 0, 0));
    //
    // objects.push(new LED(100, 0, '#ffffff'));
    //
    // wire(objects[0].outputs[0], objects[2].inputs[0]);
    // wire(objects[1].outputs[0], objects[2].inputs[1]);
    // wire(objects[2].outputs[0], objects[3].inputs[0]);
    //
    // for (var i = 0; i < wires.length; i++)
    //     console.log(wires[i]);

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
