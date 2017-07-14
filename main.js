var images = [];

var popup;
var icdesigner;

var context;

var currentContext;

var ICs = [];

class Context {
    constructor(designer) {
        this.designer = designer;
    }
    reset() {
        this.designer.reset();
    }
    render() {
        this.designer.render();
    }
    propogate(sender, receiver, signal) {
        this.designer.propogate(sender, receiver, signal);
    }
    addObject(o) {
        this.designer.addObject(o);
    }
    addWire(w) {
        this.designer.addWire(w);
    }
    getDesigner() {
        return this.designer;
    }
    getRenderer() {
        return this.designer.renderer;
    }
    getCamera() {
        return this.designer.camera;
    }
    getInput() {
        return this.designer.input;
    }
    getObjects() {
        return this.designer.objects;
    }
    getWires() {
        return this.designer.wires;
    }
    getIndexOf(o) {
        if (o instanceof Wire)
            return this.designer.getIndexOfWire(o);
        else
            return this.designer.getIndexOfObject(o);
    }
    findByUID(uid) {
        var obj = findObjectByUID(uid);
        if (obj === undefined)
            obj = findWireByUID(uid);
        return obj;
    }
    findObjectByUID(uid) {
        for (var i = 0; i < this.designer.objects.length; i++) {
            if (this.designer.objects[i].uid === uid)
                return this.designer.objects[i];
        }
        return undefined;
    }
    findWireByUID(uid) {
        for (var i = 0; i < this.designer.wires.length; i++) {
            if (this.designer.wires[i].uid === uid)
                return this.designer.wires[i];
        }
        return undefined;
    }
    getWorldMousePos() {
        return this.designer.input.worldMousePos;
    }
}

function getCurrentContext() {
    return currentContext;
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
    var wire = new Wire(getCurrentContext(), source);
    source.connect(wire);
    wire.connect(target);
}

function reset() {
    UID_COUNTER = 0;
    ICs = [];
    currentContext = context;
    context.reset();
}

function onFinishLoading() {
    var designer = new CircuitDesigner(document.getElementById("canvas"));
    context = new Context(designer);
    currentContext = context;

    popup = new SelectionPopup();
    icdesigner = new ICDesigner();

    // var asd = new Switch(context, -100, 100);
    // context.getDesigner().addObject(asd);
    // var asd2 = new asd.constructor(context, 50, 100);
    // context.getDesigner().addObject(asd2);

    // objects.push(new Switch(-50, 0));
    // objects.push(new LED(100, 0, '#ffffff'));
    var a = new Switch(context, -100, -50);
    var b = new Switch(context, -100, 50);
    var c = new ANDGate(context, false, 50, 0);
    var q = new LED(context, 150, 0, '#ffffff');
    a.setName("A");
    b.setName("B");
    q.setName("Q");

    var a2 = new Switch(context, -100, 250);
    var b2 = new Switch(context, -100, 350);
    var q2 = new LED(context, 150, 300, '#ffffff');
    // i.setName("Switch 1");
    // i2.setName("Switch 2")
    // o.setName("LED 1");
    context.getDesigner().addObject(a);
    context.getDesigner().addObject(b);
    context.getDesigner().addObject(c);
    context.getDesigner().addObject(q);
    context.getDesigner().addObject(a2);
    context.getDesigner().addObject(b2);
    context.getDesigner().addObject(q2);


    // context.addObject(new Switch(context, 0, 0));

    // var a = new Transform(V(0, 0), V(20, 20), 0, context.getCamera());
    // var b = new Transform(V(30, 0), V(20, 20), 0, context.getCamera());
    //
    // var renderer = context.getRenderer();
    //
    // renderer.save();
    // a.transformCtx(renderer.context);
    // renderer.rect(0, 0, a.size.x, a.size.y, '#ff00ff');
    // renderer.restore();
    //
    // renderer.save();
    // b.transformCtx(renderer.context);
    // renderer.rect(0, 0, b.size.x, b.size.y, '#ff00ff');
    // renderer.restore();
    //
    // console.log(transformContains(a, b));

    // icdesigner.show([i, i2, o]);

    render();
}

var renderQueue = 0;

function render() {
    if (renderQueue === 0)
        requestAnimationFrame(actualRender);
    renderQueue++;
}

function actualRender() {
    renderQueue = 0; // Saves (renderQueue - 1) render calls
    getCurrentContext().render();
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
