
var images = [];

var popup;
var icdesigner;

var context;

var currentContext;

var ICs = [];

var browser = getBrowser();

function start() {
    loadImage(images,
        ["constLow.svg", "constHigh.svg",
         "buttonUp.svg", "buttonDown.svg",
         "switchUp.svg", "switchDown.svg",
         "led.svg", "ledLight.svg",
         "buffer.svg", "and.svg",
         "or.svg", "xor.svg",
         "segment1.svg", "segment2.svg",
         "segment3.svg", "segment4.svg",
         "clock.svg", "clockOn.svg"], 0, onFinishLoading);
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

    // context.addObject(new SRFlipFlop(context));

    render();
}

var renderQueue = 0;

function render() {
    if (renderQueue === 0)
        requestAnimationFrame(actualRender);
    renderQueue++;
}

function actualRender() {
    // console.log("Saved : " + (renderQueue - 1) + " render calls!");
    renderQueue = 0;
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
