
const IO_PORT_LENGTH = 60;
const IO_PORT_RADIUS = 7;
const IO_PORT_BORDER_WIDTH = 1;
const DEFAULT_SIZE = 50;
const GRID_SIZE = 50;

const OPTION_KEY = 18;
const SHIFT_KEY = 16;
const DELETE_KEY = 8;
const ENTER_KEY = 13;
const C_KEY = 67;
const X_KEY = 88;
const V_KEY = 86;
const CONTROL_KEY = 17;
const COMMAND_KEY = 91;

function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}

// Pos must be in world coords
function containsPoint(transform, pos) {
    var tr = transform.size.scale(0.5);
    var bl = transform.size.scale(-0.5);
    var p  = transform.toLocalSpace(pos);

    //
    // DEBUG DRAWING
    //
    // var renderer = getCurrentContext().getRenderer();
    // renderer.save();
    // transform.transformCtx(renderer.context);
    // renderer.rect(0, 0, transform.size.x, transform.size.y, '#ff00ff', '#000');
    // renderer.restore();
    // var camera = getCurrentContext().getCamera();
    // var mv = camera.getScreenPos(pos);
    // renderer.circle(mv.x, mv.y, 5, '#00ff00', '#000', 1 / camera.zoom);

    return (p.x > bl.x &&
            p.y > bl.y &&
            p.x < tr.x &&
            p.y < tr.y);
}

// Pos must be in world coords
function circleContains(transform, pos) {
    var v = transform.toLocalSpace(pos);

    //
    // DEBUG DRAWING
    //
    // saveCtx();
    // transform.transfomCtx(frame.context);
    // circle(0, 0, transform.size.x, '#ff00ff', '#000');
    // restoreCtx();
    // var mv = camera.getScreenPos(pos);
    // circle(mv.x, mv.y, 5, '#00ff00', '#000', 1 / camera.zoom);

    return (v.len2() <= transform.size.x*transform.size.x/4);
}

function transformContains(t1, t2, second) {
    var s = t1.size;
    var c0 = t1.toWorldSpace(V(0, 0));
    if (containsPoint(t2, c0))
        return true;
    var c1 = t1.toWorldSpace(V(s.x/2, s.y/2));
    if (containsPoint(t2, c1))
        return true;
    var c2 = t1.toWorldSpace(V(s.x/2, -s.y/2));
    if (containsPoint(t2, c2))
        return true;
    var c3 = t1.toWorldSpace(V(-s.x/2, -s.y/2));
    if (containsPoint(t2, c3))
        return true;
    var c4 = t1.toWorldSpace(V(-s.x/2, s.y/2));
    if (containsPoint(t2, c4))
        return true;

    if (!second)
        return transformContains(t2, t1, true);

    return false;
}

function getNearestPointOnRect(bl, tr, pos) {
    if (pos.x < bl.x) {
        return V(bl.x, clamp(pos.y, bl.y, tr.y));
    }
    if (pos.x > tr.x) {
        return V(tr.x, clamp(pos.y, bl.y, tr.y));
    }
    if (pos.y < bl.y) {
        return V(clamp(pos.x, bl.x, tr.x), bl.y);
    }
    if (pos.y > tr.y) {
        return V(clamp(pos.x, bl.x, tr.x), tr.y);
    }
    return V(0, 0);
}

function ioPort(x1, y1, x2, y2, col, bCol, r, s) {
    strokeLine(x1, y1, x2, y2, (bCol === undefined ? '#000' : bCol), (s === undefined ? 2 : s));
    circle(x2, y2, (r === undefined ? 7 : r), (col === undefined ? '#fff' : col), (bCol === undefined ? '#000' : bCol), 1);
}

function getAllWires(objects) {
    var wires = [];
    for (var i = 0; i < objects.length; i++) {
        var obj = objects[i];
        for (var j = 0; j < obj.outputs.length; j++) {
            var connections = obj.outputs[j].connections;
            for (var k = 0; k < connections.length; k++) {
                var wire = connections[k];
                do {
                    wires.push(wire);
                    wire = wire.connection;
                } while(wire instanceof Wire);
            }
        }
    }
    return wires;
}
