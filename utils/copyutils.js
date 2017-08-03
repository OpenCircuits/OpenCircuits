
function copyGroup(objects) {
    if (objects.length === 0)
        return [];

    copies = [];
    for (var i = 0; i < objects.length; i++) {
        if (objects[i] instanceof WirePort)
            objects.splice(i--, 1);
        else
            copies[i] = objects[i].copy();
    }

    // Copy and reconnect all wires
    wireCopies = [];
    for (var i = 0; i < objects.length; i++) {
        var obj = objects[i];
        for (var j = 0; j < obj.outputs.length; j++) {
            var wires = obj.outputs[j].connections;
            for (var k = 0; k < wires.length; k++) {
                // See if connection was also copied
                var ww = wires[k];
                while (ww instanceof Wire || ww instanceof WirePort)
                    ww = ww.connection;
                if (findIPort(objects, ww, copies) == undefined)
                    break;

                var wire = wires[k].copy();
                copies[i].outputs[j].connect(wire);
                var w = wires[k];
                // Iterate through all wires connected to other wires
                while(w.connection instanceof WirePort) {
                    var port = new WirePort(obj.context);
                    wire.connect(port);
                    wireCopies.push(wire);
                    w = w.connection.connection;
                    wire = w.copy();
                    port.connect(wire);
                    copies.push(port);
                }
                var lastConnection = findIPort(objects, w.connection, copies);
                wire.connect(lastConnection);
                wireCopies.push(wire);
            }
        }
    }

    return {objects:copies, wires:wireCopies};
}

function findIPort(objects, target, copies) {
    for (var i = 0; i < objects.length; i++) {
        var iports = objects[i].inputs;
        for (var j = 0; j < iports.length; j++) {
            if (iports[j] === target)
                return copies[i].inputs[j];
        }
    }
    return undefined;
}
