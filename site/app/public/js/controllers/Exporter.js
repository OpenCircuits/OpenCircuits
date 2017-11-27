var Exporter = (function() {    
    var projectNameInput = document.getElementById("project-name");

    return {
        ROOT: undefined,
        saveFile: function() {
            var data = this.write(getCurrentContext());
            var projectName = projectNameInput.value;
            if (projectName === "Untitled Circuit*")
                projectName = "Untitled Circuit";
            var filename = projectName + ".circuit";

            var file = new Blob([data], {type: "text/plain"});
            if (window.navigator.msSaveOrOpenBlob) { // IE10+
                window.navigator.msSaveOrOpenBlob(file, filename);
                saved = true;
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
                    saved = true;
                }, 0);
            }
        },
        write: function(context) {
            var root = new window.DOMParser().parseFromString("<?xml version=\"1.0\" encoding=\"UTF-8\"?><project></project>", "text/xml");
            this.ROOT = root;

            var objects = context.getObjects();
            var wires = context.getWires();

            var projectNode = getChildNode(root, "project");

            var icNode = createChildNode(projectNode, "ics");

            this.writeICs(icNode);
            this.writeGroup(projectNode, objects, wires);

            return root.xml ? root.xml : (new XMLSerializer()).serializeToString(root);
        },
        writeGroup: function(node, objects, wires) {
            var objectsNode = createChildNode(node, "objects");
            var wiresNode = createChildNode(node, "wires");

            for (var i = 0; i < objects.length; i++)
                objects[i].writeTo(objectsNode);

            for (var i = 0; i < wires.length; i++)
                wires[i].writeTo(wiresNode);
        },
        writeICs: function(node) {
            for (var i = 0; i < ICData.ICs.length; i++) {
                var ic = ICData.ICs[i];
                var ICNode = createChildNode(node, "ic");
                createTextElement(ICNode, "icuid", ic.icuid);
                createTextElement(ICNode, "width", ic.transform.size.x);
                createTextElement(ICNode, "height", ic.transform.size.y);

                var iportNode = createChildNode(ICNode, "iports");
                for (var j = 0; j < ic.iports.length; j++)
                    ic.iports[j].writeTo(iportNode);

                var oportNode = createChildNode(ICNode, "oports");
                for (var j = 0; j < ic.oports.length; j++)
                    ic.oports[j].writeTo(oportNode);

                var componentsNode = createChildNode(ICNode, "components");
                var objects = ic.inputs.concat(ic.components, ic.outputs);
                var wires = getAllWires(objects);
                this.writeGroup(componentsNode, objects, wires);
            }
        }
    };
})();

// UTILS
function createChildNode(parent, tag) {
    var child = Exporter.ROOT.createElement(tag);
    parent.appendChild(child);
    return child;
}

function createTextElement(node, tag, text) {
    var a = Exporter.ROOT.createElement(tag);
    var b = Exporter.ROOT.createTextNode(text);
    a.appendChild(b);
    node.appendChild(a);
}
