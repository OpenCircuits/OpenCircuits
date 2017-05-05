
var _ROOT = undefined;

function saveFile() {
    var data = writeFile();
    var filename = "Untitled.circuit";

    var file = new Blob([data], {type: "text/plain"});
    if (window.navigator.msSaveOrOpenBlob) { // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    } else { // Others
        var a = document.createElement("a");
        var url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

function createChildNode(parent, tag) {
    var child = _ROOT.createElement(tag);
    parent.appendChild(child);
    return child;
}

function createTextElement(node, tag, text) {
    var a = _ROOT.createElement(tag);
    var b = _ROOT.createTextNode(text);
    a.appendChild(b);
    node.appendChild(a);
}

function writeFile() {
    var root = new window.DOMParser().parseFromString("<?xml version=\"1.0\" encoding=\"UTF-8\"?><project></project>", "text/xml");
    _ROOT = root;

    var projectNode = getChildNode(root, "project");

    var objectsNode = createChildNode(projectNode, "objects");

    var uid = 0;
    for (var i = 0; i < objects.length; i++) {
        objects[i].writeTo(objectsNode, uid);
        uid++;
    }

    var wiresNode = createChildNode(projectNode, "wires");

    for (var i = 0; i < wires.length; i++) {
        wires[i].writeTo(wiresNode, uid);
        uid++;
    }


    return root.xml ? root.xml : (new XMLSerializer()).serializeToString(root);
}
