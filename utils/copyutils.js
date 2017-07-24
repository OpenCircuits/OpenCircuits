
function copyGroup(objects) {
    if (objects.length === 0)
        return [];

    copies = [];
    for (var i = 0; i < objects.length; i++)
        copies[i] = objects[i].copy();

    // Copy and reconnect all wires
    wireCopies = [];
    for (var i = 0; i < objects.length; i++) {
        var obj = objects[i];
        for (var j = 0; j < obj.outputs.length; j++) {
            var wires = obj.outputs[j].connections;
            for (var k = 0; k < wires.length; k++) {
                var wire = wires[k].copy();
                copies[i].outputs[j].connect(wire);
                var w = wires[k];
                // Iterate through all wires connected to other wires
                while(w.connection instanceof Wire) {
                    w = w.connection;
                    var w2 = w.copy();
                    wire.connect(w2);
                    wireCopies.push(wire);
                    wire = w2;
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
