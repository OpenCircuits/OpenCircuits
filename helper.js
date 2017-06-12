
const IO_PORT_LENGTH = 60;
const DEFAULT_SIZE = 50;

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
    // saveCtx();
    // transform.transformCtx(frame.context);
    // rect(0, 0, transform.size.x, transform.size.y, '#ff00ff', '#000');
    // restoreCtx();
    // var mv = camera.getScreenPos(pos);
    // circle(mv.x, mv.y, 5, '#00ff00', '#000', 1 / camera.zoom);

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

function transformContains(t1, t2) {
    var s = t1.size;
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

    return false;
}

function ioPort(x1, y1, x2, y2, col, bCol, r, s) {
    strokeLine(x1, y1, x2, y2, (bCol === undefined ? '#000' : bCol), (s === undefined ? 2 : s));
    circle(x2, y2, (r === undefined ? 7 : r), (col === undefined ? '#fff' : col), (bCol === undefined ? '#000' : bCol), 1);
}
