
function openFile() {
    var fileInput = document.getElementById('file-input');

    // TODO: Custom popup w/ option to save
    var open = confirm("Are you sure you want to overwrite your current scene?");

    if (open) {
        reset();

        var reader = new FileReader();

        reader.onload = function(e) {
            // Remove all whitespace from XML file except for header
            var text = reader.result;
            var header = text.substring(0, text.indexOf(">")+1);
            text = header + text.substring(text.indexOf(">")+1).replace(/\s/g,'');

            var xml = new window.DOMParser().parseFromString(text, "text/xml");
            loadProject(xml);
        }

        reader.readAsText(fileInput.files[0]);
    }
}

function getChildNode(parent, name) {
    for (var i = 0; i < parent.childNodes.length; i++) {
        if (parent.childNodes[i].nodeName === name)
            return parent.childNodes[i];
    }
    return undefined;
}

function getBooleanValue(node, def) {
    if (node === undefined)
        return def;
    return node.childNodes[0].nodeValue === "true" ? true : false;
}

function getIntValue(node, def) {
    if (node === undefined)
        return def;
    return parseInt(node.childNodes[0].nodeValue);
}

function getFloatValue(node, def) {
    if (node === undefined)
        return def;
    return parseFloat(node.childNodes[0].nodeValue);
}

function getStringValue(node, def) {
    if (node === undefined)
        return def;
    return node.childNodes[0].nodeValue;
}

function loadProject(root) {
    var projectNode = getChildNode(root, "project");

    var context = getCurrentContext();

    var maxUID = 0;

    maxUID = loadICs(projectNode, context);

    var group = loadGroup(projectNode, context);
    var objects = group[0];
    var wires = group[1];
    for (var i = 0; i < objects.length; i++) {
        maxUID = Math.max(objects[i].uid, maxUID);
        context.addObject(objects[i]);
    }
    for (var i = 0; i < wires.length; i++) {
        maxUID = Math.max(wires[i].uid, maxUID);
        context.addWire(wires[i]);
    }

    UID_COUNTER = maxUID+1;

    console.log(UID_COUNTER);
    console.log(this.context.getWires().length);

    render();
}

function loadGroup(node, context) {
    var objectsNode = getChildNode(node, "objects");
    var wiresNode = getChildNode(node, "wires");

    var objects = [];
    var wires = [];

    var constantLows = objectsNode.getElementsByTagName("constantlow");
    for (var i = 0; i < constantLows.length; objects.push(new ConstantLow(context).load(constantLows[i++])));
    var constantHighs = objectsNode.getElementsByTagName("constanthigh");
    for (var i = 0; i < constantHighs.length; objects.push(new ConstantHigh(context).load(constantHighs[i++])));
    var buttons = objectsNode.getElementsByTagName("button");
    for (var i = 0; i < buttons.length; objects.push(new Button(context).load(buttons[i++])));
    var switches = objectsNode.getElementsByTagName("switch");
    for (var i = 0; i < switches.length; objects.push(new Switch(context).load(switches[i++])));

    var leds = objectsNode.getElementsByTagName("led");
    for (var i = 0; i < leds.length; objects.push(new LED(context).load(leds[i++])));

    var buffergates = objectsNode.getElementsByTagName("buffergate");
    for (var i = 0; i < buffergates.length; objects.push(new BUFGate(context).load(buffergates[i++])));
    var andgates = objectsNode.getElementsByTagName("andgate");
    for (var i = 0; i < andgates.length; objects.push(new ANDGate(context).load(andgates[i++])));
    var orgates = objectsNode.getElementsByTagName("orgate");
    for (var i = 0; i < orgates.length; objects.push(new ORGate(context).load(orgates[i++])));
    var xorgates = objectsNode.getElementsByTagName("xorgate");
    for (var i = 0; i < xorgates.length; objects.push(new XORGate(context).load(xorgates[i++])));

    var wiresArr = wiresNode.getElementsByTagName("wire");
    for (var i = 0; i < wiresArr.length; i++)
        wires.push(new Wire(context).load(wiresArr[i]));
    for (var i = 0; i < wiresArr.length; i++)
        wires[i].loadConnections(wiresArr[i], objects, wires);

    return [objects, wires];
}
