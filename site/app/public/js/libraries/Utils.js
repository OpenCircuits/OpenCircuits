
/* Should be const instead of var
   but Safari does not allow it */
var DEFAULT_SIZE = 50;
var GRID_SIZE = 50;
var DEFAULT_FILL_COLOR = "#ffffff";
var DEFAULT_BORDER_COLOR = "#000000";
var DEFAULT_ON_COLOR = "#3cacf2";

var IO_PORT_LENGTH = 60;
var IO_PORT_RADIUS = 7;
var IO_PORT_BORDER_WIDTH = 1;
var IO_PORT_LINE_WIDTH = 2;

var WIRE_DIST_THRESHOLD = 5;
var WIRE_DIST_THRESHOLD2 = WIRE_DIST_THRESHOLD*WIRE_DIST_THRESHOLD;
var WIRE_DIST_ITERATIONS = 10;
var WIRE_NEWTON_ITERATIONS = 5;
var WIRE_SNAP_THRESHOLD = 10;

var ROTATION_CIRCLE_RADIUS = 75;
var ROTATION_CIRCLE_THICKNESS = 5;
var ROTATION_CIRCLE_THRESHOLD = 5;
var ROTATION_CIRCLE_R1 = Math.pow(ROTATION_CIRCLE_RADIUS - ROTATION_CIRCLE_THRESHOLD, 2);
var ROTATION_CIRCLE_R2 = Math.pow(ROTATION_CIRCLE_RADIUS + ROTATION_CIRCLE_THRESHOLD, 2);

var SIDENAV_WIDTH = 200;
var ITEMNAV_WIDTH = 200;

var LEFT_MOUSE_BUTTON = 0;
var RIGHT_MOUSE_BUTTON = 1;

var OPTION_KEY = 18;
var SHIFT_KEY = 16;
var BACKSPACE_KEY = 8;
var DELETE_KEY = 46;
var ENTER_KEY = 13;
var ESC_KEY = 27;
var A_KEY = 65;
var C_KEY = 67;
var V_KEY = 86;
var X_KEY = 88;
var Y_KEY = 89;
var Z_KEY = 90;
var CONTROL_KEY = 17;
var COMMAND_KEY = 91;

/**
 * Determines whether the given point is
 * within the rectangle defined by the
 * given transform
 *
 * @param  {Transform} transform
 *         The transform that represents the rectangle
 *
 * @param  {Vector} pos
 *         * Must be in world coordinates *
 *         The point to determine whether or not
 *         it's within the rectangle
 *
 * @return {Boolean}
 *         True if the point is within the rectangle,
 *         false otherwise
 */
function rectContains(transform, pos) {
    var tr = transform.size.scale(0.5);
    var bl = transform.size.scale(-0.5);
    var p  = transform.toLocalSpace(pos);

    return (p.x > bl.x &&
            p.y > bl.y &&
            p.x < tr.x &&
            p.y < tr.y);
}

/**
 * Determines whether the given point
 * is within the circle defined by the
 * given transform
 *
 * @param  {Transform} transform
 *         The transform that represents the circle
 *
 * @param  {Vector} pos
 *         * Must be in world coordinates *
 *         The point to determine whether or not
 *         it's within the rectangle
 *
 * @return {Boolean}
 *          True if the point is within the rectangle,
 *          false otherwise
 */
function circleContains(transform, pos) {
    var v = transform.toLocalSpace(pos);
    return (v.len2() <= transform.size.x*transform.size.x/4);
}

/**
 * Compares two transforms to see if they overlap.
 * First tests it using a quick circle-circle
 * intersection using the 'radius' of the transform
 *
 * Then uses a SAT (Separating Axis Theorem) method
 * to determine whether or not the two transforms
 * are intersecting
 *
 * @param  {Transform} a
 *         The first transform
 *
 * @param  {Transform} b
 *         The second transform
 *
 * @return {Boolean}
 *         True if the two transforms are overlapping,
 *         false otherwise
 */
function transformContains(A, B) {
    // If both transforms are non-rotated
    if (Math.abs(A.getAngle()) <= 1e-5 && Math.abs(B.getAngle()) <= 1e-5) {
        var aPos = A.getPos(), aSize = A.getSize();
        var bPos = B.getPos(), bSize = B.getSize();
        return (Math.abs(aPos.x - bPos.x) * 2 < (aSize.x + bSize.x)) &&
               (Math.abs(aPos.y - bPos.y) * 2 < (aSize.y + bSize.y));
    }

    // Quick check circle-circle intersection
    var r1 = A.getRadius();
    var r2 = B.getRadius();
    var sr = r1 + r2;                       // Sum of radius
    var dpos = A.getPos().sub(B.getPos());  // Delta position
    if (dpos.dot(dpos) > sr*sr)
        return false;

    /* Perform SAT */

    // Get corners in local space of transform A
    var a = A.getLocalCorners();

    // Transform B's corners into A local space
    var bworld = B.getCorners();
    var b = [];
    for (var i = 0; i < 4; i++) {
        b[i] = A.toLocalSpace(bworld[i]);

        // Offsets x and y to fix perfect lines
        // where b[0] = b[1] & b[2] = b[3]
        b[i].x += 0.0001*i;
        b[i].y += 0.0001*i;
    }

    var corners = a.concat(b);

    var minA, maxA, minB, maxB;

    // SAT w/ x-axis
    // Axis is <1, 0>
    // So dot product is just the x-value
    minA = maxA = corners[0].x;
    minB = maxB = corners[4].x;
    for (var j = 1; j < 4; j++) {
        minA = Math.min(corners[j].x, minA);
        maxA = Math.max(corners[j].x, maxA);
        minB = Math.min(corners[j+4].x, minB);
        maxB = Math.max(corners[j+4].x, maxB);
    }
    if (maxA < minB || maxB < minA)
        return false;

    // SAT w/ y-axis
    // Axis is <1, 0>
    // So dot product is just the y-value
    minA = maxA = corners[0].y;
    minB = maxB = corners[4].y;
    for (var j = 1; j < 4; j++) {
        minA = Math.min(corners[j].y, minA);
        maxA = Math.max(corners[j].y, maxA);
        minB = Math.min(corners[j+4].y, minB);
        maxB = Math.max(corners[j+4].y, maxB);
    }
    if (maxA < minB || maxB < minA)
        return false;

    // SAT w/ other two axes
    var normals = [b[3].sub(b[0]), b[3].sub(b[2])];
    for (var i = 0; i < normals.length; i++) {
        var normal = normals[i];
        var minA = undefined, maxA = undefined;
        var minB = undefined, maxB = undefined;
        for (var j = 0; j < 4; j++) {
            var s = corners[j].dot(normal);
            minA = Math.min(s, (minA ? minA :  Infinity));
            maxA = Math.max(s, (maxA ? maxA : -Infinity));
            var s2 = corners[j+4].dot(normal);
            minB = Math.min(s2, (minB ? minB :  Infinity));
            maxB = Math.max(s2, (maxB ? maxB : -Infinity));
        }
        if (maxA < minB || maxB < minA)
            return false;
    }

    return true;
}

/**
 * Returns the nearest point on the edge
 * of the given rectangle.
 *
 * @param  {Vector} bl
 *         Bottom left corner of the rectangle
 *
 * @param  {Vector} tr
 *         Top right corner of the rectangle
 *
 * @param  {Vector} pos
 *         The position to get the nearest point on
 *
 * @return {Vector}
 *         The closest position on the edge of
 *         the rectangle from 'pos'
 */
function getNearestPointOnRect(bl, tr, pos) {
    if (pos.x < bl.x)
        return V(bl.x, clamp(pos.y, bl.y, tr.y));
    if (pos.x > tr.x)
        return V(tr.x, clamp(pos.y, bl.y, tr.y));
    if (pos.y < bl.y)
        return V(clamp(pos.x, bl.x, tr.x), bl.y);
    if (pos.y > tr.y)
        return V(clamp(pos.x, bl.x, tr.x), tr.y);
    return V(0, 0);
}

// Okay, I know this is awful but it's like 5:47 am and I'm tired
function getAllThingsBetween(things) {
    var objects = [];
    var wiresAndPorts = [];
    for (var i = 0; i < things.length; i++) {
        if (things[i] instanceof Wire || things[i] instanceof WirePort)
            wiresAndPorts.push(things[i]);
        else if (things[i] instanceof IOObject)
            objects.push(things[i]);
    }
    var allTheThings = [];
    for (var i = 0; i < objects.length; i++) {
        allTheThings.push(objects[i]);
        for (var j = 0; j < objects[i].inputs.length; j++) {
            var iport = objects[i].inputs[j];
            obj = iport.input;
            while (obj != undefined && !(obj instanceof OPort)) {
                if (findByUID(allTheThings, obj.uid) == undefined) // If not added yet
                    allTheThings.push(obj);
                obj = obj.input;
            }
        }
        for (var j = 0; j < objects[i].outputs.length; j++) {
            var oport = objects[i].outputs[j];
            for (var k = 0; k < oport.connections.length; k++) {
                obj = oport.connections[k];
                while (obj != undefined && !(obj instanceof IPort)) {
                    if (findByUID(allTheThings, obj.uid) == undefined) // If not added yet
                        allTheThings.push(obj);
                    obj = obj.connection;
                }
            }
        }
    }
    for (var i = 0; i < wiresAndPorts.length; i++) {
        allTheThings.push(wiresAndPorts[i]);
        var obj = wiresAndPorts[i].input;
        while (obj != undefined && !(obj instanceof OPort)) {
            if (findByUID(allTheThings, obj.uid) == undefined) // If not added yet
                allTheThings.push(obj);
            obj = obj.input;
        }
        obj = wiresAndPorts[i].connection;
        while (obj != undefined && !(obj instanceof IPort)) {
            if (findByUID(allTheThings, obj.uid) == undefined) // If not added yet
                allTheThings.push(obj);
            obj = obj.connection;
        }
    }
    return allTheThings;
}

/**
 * Finds and returns all the inter-connected wires
 * in a given group of objects
 *
 * @param  {Array} objects
 *         The group of objects to find the wires
 *         in between
 *
 * @return {Array}
 *         The resulting wires
 */
function getAllWires(objects) {
    var wires = [];
    for (var i = 0; i < objects.length; i++) {
        var obj = objects[i];
        for (var j = 0; j < obj.outputs.length; j++) {
            var connections = obj.outputs[j].connections;
            for (var k = 0; k < connections.length; k++) {
                var wire = connections[k];
                while (wire.connection instanceof WirePort) {
                    wires.push(wire);
                    wire = wire.connection.connection;
                }
                wires.push(wire);
            }
        }
    }
    return wires;
}

/**
 * Removes all objects and wires+wireports
 * between them
 *
 * @param  {Context} ctx
 *         The context which the objects are apart of
 *
 * @param  {Array} objects
 *         The array of objects in which to remove
 *
 * @param  {Boolean} doAction
 *         True if the action should be re/undoable,
 *         False otherwise
 */
function RemoveObjects(ctx, objects, doAction) {
    if (objects.length === 0)
        return;

    var action = new GroupAction();
    var things = getAllThingsBetween(objects);
    for (var i = 0; i < things.length; i++) {
        if (things[i].selected)
            selectionTool.deselect([things[i]]);
        if (things[i] instanceof Wire || things[i] instanceof WirePort) {
            var oldinput = things[i].input;
            var oldconnection = things[i].connection;
            things[i].remove();
            if (doAction)
                action.add(new DeleteAction(things[i], oldinput, oldconnection));
        }
    }
    for (var i = 0; i < things.length; i++) {
        if (!(things[i] instanceof Wire || things[i] instanceof WirePort)) {
            things[i].remove();
            if (doAction)
                action.add(new DeleteAction(things[i]));
        }
    }
    if (doAction)
        ctx.addAction(action);
    render();
}

/**
 * Simply copies all elements of an array into
 * another array and returns that array
 * [DOES NOT COPY EACH OBJECT IN THE ARRAY]
 *
 * @param  {Array} arr
 *         The array to copy
 *
 * @return {Array}
 *         The copied array
 */
function CopyArray(arr) {
    var copy = [];
    for (var i = 0; i < arr.length; i++)
        copy.push(arr[i]);
    return copy;
}

/**
 * Finds and returns the IC from a given icuid
 *
 * @param  {Integer} id
 *         The icuid of the target IC
 *         (Integrated Circuit Unique Identification)
 *
 * @return {IC}
 *         The ic with the given icuid or undefined if
 *         the IC is not found
 */
function findIC(id, ics) {
    for (var i = 0; i < ics.length; i++) {
        if (ics[i].icuid === id)
            return ics[i];
    }
    return undefined;
}

function findByUID(objects, id) {
    for (var i = 0; i < objects.length; i++) {
        if (objects[i].uid === id)
            return objects[i];
    }
    return undefined;
}

/**
 * Creates a group transform action given
 * the relevant objects and their original
 * transforms
 *
 * @param  {Array} objects
 *         The array of objects who have been transformed
 *
 * @param  {Array} t0
 *         The array of transforms that correspond to
 *         the original transform of the object in objects
 */
function createTransformAction(objects, t0) {
    var action = new GroupAction();
    for (var i = 0; i < objects.length; i++) {
        var origin = t0[i];
        var target = objects[i].transform.copy();
        if (origin.equals(target))
            continue;
        action.add(new TransformAction(objects[i], origin, target));
    }
    return action;
}

/**
 * Finds and returns the closest 't' value
 * of the parametric equation for a line.
 *
 * Parametric function defined by
 * X(t) = t(p2.x - p1.x) + p1.x
 * Y(t) = t(p2.y - p1.y) + p1.y
 *
 * Solves for 't' from root of the derivative of
 * the distance function between the line and <mx, my>
 * D(t) = sqrt((X(t) - mx)^2 + (Y(t) - my)^2)
 *
 * @param  {Vector} p1
 *         The first point of the line
 *
 * @param  {Vector} p2
 *         The second point of the line
 *
 * @param  {Number} mx
 *         The x-value of the point
 *         to determine the 't' value
 *
 * @param  {Number} my
 *         The y-value of the point
 *         to determine the 't' value
 *
 * @return {Number}
 *         The nearest 't' value of <mx, my>
 *         on the line p1->p2 or -1 if the
 *         dist < WIRE_DIST_THRESHOLD
 */
function getNearestT(p1, p2, mx, my) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    var t = (dx*(mx - p1.x) + dy*(my - p1.y))/(dx*dx + dy*dy);
    t = clamp(t, 0, 1);
    var pos = V(dx * t + p1.x, dy * t + p1.y);
    if (pos.sub(V(mx, my)).len2() < WIRE_DIST_THRESHOLD2)
        return t;
    else
        return -1;
}

/**
 * Uses Newton's method to find the roots of
 * the function 'f' given a derivative 'df'
 *
 * @param  {Number} iterations
 *         The number of iterations to perform
 *         Newton's method with; the smaller
 *         the better but less accurate
 *
 * @param  {Number} t0
 *         The starting root value parameter
 *
 * @param  {Number} x
 *         Parameter 1 for the function
 *
 * @param  {Number} y
 *         Parameter 2 for the function
 *
 * @param  {Function} f
 *         The function to find the roots of
 *         In the form f(t, x, y) = ...
 *
 * @param  {Function} df
 *         The derivative of the function
 *         In the form of df(t, x, y)
 *
 * @return {Number}
 *         The parameter 't' that results in
 *         f(t, x, y) = 0
 */
function findRoots(iterations, t0, x, y, f, df) {
    var t = t0;
    do {
        var v = f(t, x, y);
        var dv = df(t, x, y);
        if (dv === 0)
            break;
        t = t - v / dv;
        t = clamp(t, 0.01, 0.99);
    } while((iterations--) > 0);
    return t;
}

// Separates an array of objects into three sub-groups
// of input-type objects (switch and buttons),
// output-type objects (LEDs),
// and other components.
function separateGroup(group) {
    var inputs = [];
    var components = [];
    var outputs = [];
    for (var i = 0; i < group.length; i++) {
        var object = group[i];
        if (object instanceof Switch || object instanceof Button || object instanceof Clock)
            inputs.push(object);
        else if (object instanceof LED)
            outputs.push(object);
        else
            components.push(object);
    }
    return {inputs:inputs, components:components, outputs:outputs};
}

/**
 * Clamps a number between a given min and max
 *
 * @param  {Number} x
 *         The number to clamp
 *
 * @param  {Number} min
 *         The minimum
 *
 * @param  {Number} max
 *         The maximum
 *
 * @return {Number}
 *         The clamped number
 */
function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}

// Code from https://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
function getBrowser() {
    if (navigator == undefined)
        return;
    var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])) {
        tem=/\brv[ :]+(\d+)/g.exec(ua) || [];
        return {name:'IE',version:(tem[1]||'')};
    }
    if(M[1]==='Chrome') {
        tem=ua.match(/\bOPR|Edge\/(\d+)/)
        if(tem!=null)   {return {name:'Opera', version:tem[1]};}
    }
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return {
      name: M[0],
      version: M[1]
    };
 }
