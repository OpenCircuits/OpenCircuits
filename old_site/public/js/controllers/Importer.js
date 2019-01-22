var Importer = (function() {   
    var fileInput = document.getElementById('file-input');
     
    return {
        types: [],
        openFile: function() {
            // TODO: Custom popup w/ option to save
            var open = confirm("Are you sure you want to overwrite your current scene?");

            if (open) {
                reset();

                var reader = new FileReader();

                reader.onload = function(e) {
                    Importer.load(reader.result, getCurrentContext());
                    render();
                }

                reader.readAsText(fileInput.files[0]);
            }
        },
        load: function(text, context) {
            //
            // Why?!?!
            // 
            // // Remove all whitespace from XML file except for header
            // var header = text.substring(0, text.indexOf(">")+1);
            // text = header + text.substring(text.indexOf(">")+1).replace(/\s/g,'');

            var root = new window.DOMParser().parseFromString(text, "text/xml");
            if (root.documentElement.nodeName == "parsererror")
                return;

            var project = getChildNode(root, "project");
            var icsNode = getChildNode(project, "ics");

            var ics = this.loadICs(icsNode, context);

            var group = this.loadGroup(project, context, ics);
            context.addObjects(group.objects);
            context.addWires(group.wires);

            for (var i = 0; i < ics.length; i++)
                ICData.add(ics[i]);

            context.redistributeUIDs();
            ICData.redistributeUIDs();

            return group;
        },
        loadGroup: function(node, context, ics) {
            var objectsNode = getChildNode(node, "objects");
            var wiresNode = getChildNode(node, "wires");

            var objects = [];
            var wires = [];

            for (var i = 0; i < this.types.length; i++) {
                var type = this.types[i];
                var nodes = getChildrenByTagName(objectsNode, type.getXMLName());
                for (var j = 0; j < nodes.length; j++)
                    objects.push(new type(context).load(nodes[j], ics));
            }

            var wiresArr = getChildrenByTagName(wiresNode, "wire");
            for (var i = 0; i < wiresArr.length; i++)
                wires.push(new Wire(context).load(wiresArr[i]));

            for (var i = 0; i < wires.length; i++)
                wires[i].loadConnections(wiresArr[i], objects);

            return {objects:objects, wires:wires};
        },
        loadICs: function(node, context) {
            var ics = [];
            var icNodes = getChildrenByTagName(node, "ic");
            for (var i = 0; i < icNodes.length; i++) {
                var icNode = icNodes[i];
                var icuid = getIntValue(getChildNode(icNode, "icuid"));
                var width = getIntValue(getChildNode(icNode, "width"));
                var height = getIntValue(getChildNode(icNode, "height"));

                var componentsNode = getChildNode(icNode, "components");
                var group = this.loadGroup(componentsNode, context, ics);
                var data = ICData.create(group.objects);

                data.icuid = icuid;
                data.transform.setSize(V(width, height));

                var iports = getChildrenByTagName(getChildNode(icNode, "iports"), "iport");
                for (var j = 0; j < iports.length; j++)
                    data.iports[j] = new IPort().load(iports[j]);

                var oports = getChildrenByTagName(getChildNode(icNode, "oports"), "oport");
                for (var j = 0; j < oports.length; j++)
                    data.oports[j] = new OPort().load(oports[j]);

                ics.push(data);
            }
            return ics;
        }
    };
})();

// UTILS
function getChildNode(parent, name) {
    for (var i = 0; i < parent.childNodes.length; i++) {
        if (parent.childNodes[i].nodeName === name)
            return parent.childNodes[i];
    }
    return undefined;
}
function getChildrenByTagName(parent, name) {
    var children = [];
    for (var i = 0; i < parent.childNodes.length; i++) {
        if (parent.childNodes[i].nodeName === name)
            children.push(parent.childNodes[i]);
    }
    return children;
}
function getBooleanValue(node, def) {
    if (node == undefined)
        return def;
    return node.childNodes[0].nodeValue === "true" ? true : false;
}
function getIntValue(node, def) {
    if (node == undefined)
        return def;
    return parseInt(node.childNodes[0].nodeValue);
}
function getFloatValue(node, def) {
    if (node == undefined)
        return def;
    return parseFloat(node.childNodes[0].nodeValue);
}
function getStringValue(node, def) {
    if (node == undefined)
        return def;
    return node.childNodes[0].nodeValue;
}
