
function openFile() {
    var fileInput = document.getElementById('file-input');

    if (fileInput.files.length === 0) {
        console.log("Select one or more files.");
    } else {
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

    var objectsNode = getChildNode(projectNode, "objects");
    var wiresNode = getChildNode(projectNode, "wires");

    var context = getCurrentContext();

    var constantLows = objectsNode.getElementsByTagName("constantlow");
    for (var i = 0; i < constantLows.length; loadConstantLow(context, constantLows[i++]));
    var constantHighs = objectsNode.getElementsByTagName("constanthigh");
    for (var i = 0; i < constantHighs.length; loadConstantHigh(context, constantHighs[i++]));
    var buttons = objectsNode.getElementsByTagName("button");
    for (var i = 0; i < buttons.length; loadButton(context, buttons[i++]));
    var switches = objectsNode.getElementsByTagName("switch");
    for (var i = 0; i < switches.length; loadSwitch(context, switches[i++]));

    var leds = objectsNode.getElementsByTagName("led");
    for (var i = 0; i < leds.length; loadLED(context, leds[i++]));

    var buffergates = objectsNode.getElementsByTagName("buffergate");
    for (var i = 0; i < buffergates.length; loadBufferGate(context, buffergates[i++]));
    var andgates = objectsNode.getElementsByTagName("andgate");
    for (var i = 0; i < andgates.length; loadANDGate(context, andgates[i++]));
    var orgates = objectsNode.getElementsByTagName("orgate");
    for (var i = 0; i < orgates.length; loadORGate(context, orgates[i++]));
    var xorgates = objectsNode.getElementsByTagName("xorgate");
    for (var i = 0; i < xorgates.length; loadXORGate(context, xorgates[i++]));

    var wiresArr = wiresNode.getElementsByTagName("wire");
    for (var i = 0; i < wiresArr.length; i++)
        loadWire(context, wiresArr[i]);
    for (var i = 0; i < wiresArr.length; i++)
        loadWireConnections(context, context.getWires()[i], wiresArr[i]);

    render();
}
