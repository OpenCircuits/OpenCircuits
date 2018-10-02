/* Built at: Mon Apr 16 2018 17:18:22 GMT-0400 (Eastern Daylight Time) */
"use strict";

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var __TESTING__ = false;

var Camera = function () {
    function Camera(designer, startPos, startZoom) {
        _classCallCheck(this, Camera);

        this.canvas = designer.renderer.canvas;
        this.pos = startPos ? startPos : V(0, 0);
        this.zoom = startZoom ? startZoom : 1;
        this.center = V(0, 0);
        this.transform = new Transform(V(0, 0), V(0, 0), 0, this);
        this.dirty = true;
    }

    _createClass(Camera, [{
        key: 'resize',
        value: function resize() {
            this.center = V(this.canvas.width, this.canvas.height).scale(0.5);
        }
    }, {
        key: 'updateMatrix',
        value: function updateMatrix() {
            if (!this.dirty) return;
            this.dirty = false;

            this.mat = new Matrix2x3();
            this.mat.translate(this.pos);
            this.mat.scale(V(this.zoom, this.zoom));
            this.inv = this.mat.inverse();

            var p1 = this.getWorldPos(V(0, 0));
            var p2 = this.getWorldPos(V(this.canvas.width, this.canvas.height));
            this.transform.setPos(p2.add(p1).scale(0.5));
            this.transform.setSize(p2.sub(p1));
        }
    }, {
        key: 'translate',
        value: function translate(dx, dy) {
            this.dirty = true;
            this.pos.x += dx;
            this.pos.y += dy;
        }
    }, {
        key: 'zoomBy',
        value: function zoomBy(s) {
            this.dirty = true;
            this.zoom *= s;
        }
    }, {
        key: 'cull',
        value: function cull(transform) {
            // getCurrentContext().getRenderer().save();
            // transform.transformCtx(getCurrentContext().getRenderer().context);
            // getCurrentContext().getRenderer().rect(0, 0, transform.size.x, transform.size.y, '#ff00ff');
            // getCurrentContext().getRenderer().restore();

            return transformContains(transform, this.getTransform());
        }
    }, {
        key: 'getTransform',
        value: function getTransform() {
            this.updateMatrix();
            return this.transform;
        }
    }, {
        key: 'getMatrix',
        value: function getMatrix() {
            this.updateMatrix();
            return this.mat;
        }
    }, {
        key: 'getInverseMatrix',
        value: function getInverseMatrix() {
            this.updateMatrix();
            return this.inv;
        }
    }, {
        key: 'getScreenPos',
        value: function getScreenPos(v) {
            return this.getInverseMatrix().mul(v).add(this.center);
        }
    }, {
        key: 'getWorldPos',
        value: function getWorldPos(v) {
            return this.getMatrix().mul(v.sub(this.center));
        }
    }]);

    return Camera;
}();

var Clipboard = function () {
    function Clipboard() {
        var _this = this;

        _classCallCheck(this, Clipboard);

        document.addEventListener('copy', function (e) {
            _this.copy(e);
        }, false);
        document.addEventListener('cut', function (e) {
            _this.cut(e);
        }, false);
        document.addEventListener('paste', function (e) {
            _this.paste(e);
        }, false);
    }

    _createClass(Clipboard, [{
        key: 'copy',
        value: function copy(e) {
            var selections = selectionTool.selections;
            var things = getAllThingsBetween(selections);
            var objects = [];
            var wires = [];
            for (var i = 0; i < things.length; i++) {
                if (things[i] instanceof Wire) wires.push(things[i]);else objects.push(things[i]);
            }
            var ctx = { getObjects: function getObjects() {
                    return objects;
                }, getWires: function getWires() {
                    return wires;
                } };
            var data = Exporter.write(ctx);
            e.clipboardData.setData("text/plain", data);
            e.preventDefault();
        }
    }, {
        key: 'cut',
        value: function cut(e) {
            this.copy(e);
            RemoveObjects(getCurrentContext(), selectionTool.selections, true);
            e.preventDefault();
        }
    }, {
        key: 'paste',
        value: function paste(e) {
            console.log("ASd");
            var group = Importer.load(e.clipboardData.getData("text/plain"), getCurrentContext());
            var objects = group.objects;
            var wires = group.wires;

            var action = new GroupAction();

            for (var i = 0; i < objects.length; i++) {
                objects[i].setPos(objects[i].getPos().add(V(5, 5)));
                action.add(new PlaceAction(objects[i]));
            }

            getCurrentContext().addAction(action);

            selectionTool.deselectAll();
            selectionTool.select(objects);

            render();
            e.preventDefault();
        }
    }]);

    return Clipboard;
}();

var clipboard = new Clipboard();

var Context = function () {
    function Context(designer) {
        _classCallCheck(this, Context);

        this.uidmanager = new UIDManager(this);
        this.designer = designer;
    }

    _createClass(Context, [{
        key: 'reset',
        value: function reset() {
            this.designer.reset();
        }
    }, {
        key: 'render',
        value: function render() {
            this.designer.render();
        }
    }, {
        key: 'propogate',
        value: function propogate(sender, receiver, signal) {
            this.designer.propogate(sender, receiver, signal);
        }
    }, {
        key: 'add',
        value: function add(o) {
            if (o instanceof Wire) this.addWire(o);else this.addObject(o);
        }
    }, {
        key: 'addObject',
        value: function addObject(o) {
            this.designer.addObject(o);
            this.uidmanager.giveUIDTo(o);
        }
    }, {
        key: 'addObjects',
        value: function addObjects(arr) {
            for (var i = 0; i < arr.length; i++) {
                this.addObject(arr[i]);
            }
        }
    }, {
        key: 'addWire',
        value: function addWire(w) {
            this.designer.addWire(w);
            this.uidmanager.giveUIDTo(w);
        }
    }, {
        key: 'addWires',
        value: function addWires(arr) {
            for (var i = 0; i < arr.length; i++) {
                this.addWire(arr[i]);
            }
        }
    }, {
        key: 'addAction',
        value: function addAction(action) {
            this.designer.history.add(action);
        }
    }, {
        key: 'setCursor',
        value: function setCursor(cursor) {
            this.designer.renderer.setCursor(cursor);
        }
    }, {
        key: 'remove',
        value: function remove(o) {
            var index = this.getIndexOf(o);
            if (index === -1) return;
            if (o instanceof Wire) this.designer.getWires().splice(index, 1);else this.designer.getObjects().splice(index, 1);
        }
    }, {
        key: 'undo',
        value: function undo() {
            this.designer.history.undo();
        }
    }, {
        key: 'redo',
        value: function redo() {
            this.designer.history.redo();
        }
    }, {
        key: 'redistributeUIDs',
        value: function redistributeUIDs() {
            this.uidmanager.redistribute();
        }
    }, {
        key: 'getDesigner',
        value: function getDesigner() {
            return this.designer;
        }
    }, {
        key: 'getRenderer',
        value: function getRenderer() {
            return this.designer.renderer;
        }
    }, {
        key: 'getCamera',
        value: function getCamera() {
            return this.designer.camera;
        }
    }, {
        key: 'getHistoryManager',
        value: function getHistoryManager() {
            return this.designer.history;
        }
    }, {
        key: 'getObjects',
        value: function getObjects() {
            // Copy to avoid confusing bugs when
            // modifying the objects through add/remove
            // and have it edit the returned array
            return CopyArray(this.designer.objects);
        }
    }, {
        key: 'getWires',
        value: function getWires() {
            // Copy to avoid confusing bugs when
            // modifying the objects through add/remove
            // and have it edit the returned array
            return CopyArray(this.designer.wires);
        }
    }, {
        key: 'getIndexOf',
        value: function getIndexOf(o) {
            if (o instanceof Wire) return this.designer.getIndexOfWire(o);else return this.designer.getIndexOfObject(o);
        }
    }, {
        key: 'findByUID',
        value: function findByUID(uid) {
            return findObjectByUID(uid) || findWireByUID(uid);
        }
    }, {
        key: 'findObjectByUID',
        value: function findObjectByUID(uid) {
            return UIDManager.find(this.getObjects(), uid);
        }
    }, {
        key: 'findWireByUID',
        value: function findWireByUID(uid) {
            return UIDManager.find(this.getWires(), uid);
        }
    }]);

    return Context;
}();

function getCurrentContext() {
    return currentContext;
}

function copyGroup(objects) {
    if (objects.length === 0) return [];

    var copies = [];
    for (var i = 0; i < objects.length; i++) {
        if (objects[i] instanceof WirePort) objects.splice(i--, 1);else copies[i] = objects[i].copy();
    }

    // Copy and reconnect all wires
    var wireCopies = [];
    for (var i = 0; i < objects.length; i++) {
        var obj = objects[i];
        for (var j = 0; j < obj.outputs.length; j++) {
            var wires = obj.outputs[j].connections;
            for (var k = 0; k < wires.length; k++) {
                // See if connection was also copied
                var ww = wires[k];
                while (ww instanceof Wire || ww instanceof WirePort) {
                    ww = ww.connection;
                }if (findIPort(objects, ww, copies) == undefined) break;

                var wire = wires[k].copy();
                copies[i].outputs[j].connect(wire);
                var w = wires[k];
                // Iterate through all wires connected to other wires
                while (w.connection instanceof WirePort) {
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
    for (var i = 0; i < objects.length; i++) {
        copies[i].isOn = objects[i].isOn;
        if (objects[i].inputs.length === 0) copies[i].activate(objects[i].isOn);
    }
    for (var i = 0; i < wireCopies.length; i++) {
        if (objects[i].inputs.length === 0) copies[i].activate(objects[i].isOn);
    }

    return { objects: copies, wires: wireCopies };
}

function findIPort(objects, target, copies) {
    for (var i = 0; i < objects.length; i++) {
        var iports = objects[i].inputs;
        for (var j = 0; j < iports.length; j++) {
            if (iports[j] === target) return copies[i].inputs[j];
        }
    }
    return undefined;
}

var HistoryManager = function () {
    function HistoryManager() {
        _classCallCheck(this, HistoryManager);

        this.undoStack = [];
        this.redoStack = [];
    }

    _createClass(HistoryManager, [{
        key: 'onKeyDown',
        value: function onKeyDown(code, input) {
            if (Input.getModifierKeyDown()) {
                if (code === Y_KEY || code === Z_KEY && Input.getShiftKeyDown()) this.redo();else if (code === Z_KEY) this.undo();
            }
        }
    }, {
        key: 'add',
        value: function add(action) {
            // Check for empty group action
            if (action instanceof GroupAction && action.actions.length == 0) {
                return;
            }

            this.redoStack = [];
            this.undoStack.push(action);
        }
    }, {
        key: 'undo',
        value: function undo() {
            if (this.undoStack.length > 0) {
                var action = this.undoStack.pop();
                action.undo();
                this.redoStack.push(action);
                // Update popup's values
                popup.update();
                render();
            }
        }
    }, {
        key: 'redo',
        value: function redo() {
            if (this.redoStack.length > 0) {
                var action = this.redoStack.pop();
                action.redo();
                this.undoStack.push(action);
                // Update popup's values
                popup.update();
                render();
            }
        }
    }]);

    return HistoryManager;
}();

/* Should be const instead of var
   but Safari does not allow it */


var PROPOGATION_TIME = 1;

var updateRequests = 0;

var Propogation = function () {
    function Propogation(sender, receiver, signal, update) {
        _classCallCheck(this, Propogation);

        this.sender = sender;
        this.receiver = receiver;
        this.signal = signal;

        if (updateRequests === 0) {
            updateRequests++;
            setTimeout(update, PROPOGATION_TIME);
        }
    }

    _createClass(Propogation, [{
        key: 'send',
        value: function send() {
            this.receiver.activate(this.signal);
        }
    }]);

    return Propogation;
}();

var UIDManager = function () {
    function UIDManager(context) {
        _classCallCheck(this, UIDManager);

        this.context = context;
        this.counter = 0;
    }

    _createClass(UIDManager, [{
        key: 'giveUIDTo',
        value: function giveUIDTo(obj) {
            if (!obj.uid) obj.uid = this.counter++;
        }
    }, {
        key: 'redistribute',
        value: function redistribute() {
            var things = this.context.getObjects().concat(this.context.getWires());
            this.counter = 0;
            for (var i = 0; i < things.length; i++) {
                things[i].uid = this.counter++;
            }
        }
    }]);

    return UIDManager;
}();

/**
 * Finds and returns the thing in the given
 * array that has the given uid (Unique Identification)
 *
 * @param  {Array} things
 *         The group of things to search
 *
 * @param  {Integer} uid
 *         The target unique identification to search for
 *
 * @return {IOObject}
 *         The object with the given uid or undefined if
 *         the object is not found
 */


UIDManager.find = function (things, target) {
    for (var i = 0; i < things.length; i++) {
        if (things[i].uid === target) return things[i];
    }
    return undefined;
};

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
var WIRE_DIST_THRESHOLD2 = WIRE_DIST_THRESHOLD * WIRE_DIST_THRESHOLD;
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
var DELETE_KEY = 8;
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
    var p = transform.toLocalSpace(pos);

    return p.x > bl.x && p.y > bl.y && p.x < tr.x && p.y < tr.y;
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
    return v.len2() <= transform.size.x * transform.size.x / 4;
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
        var aPos = A.getPos(),
            aSize = A.getSize();
        var bPos = B.getPos(),
            bSize = B.getSize();
        return Math.abs(aPos.x - bPos.x) * 2 < aSize.x + bSize.x && Math.abs(aPos.y - bPos.y) * 2 < aSize.y + bSize.y;
    }

    // Quick check circle-circle intersection
    var r1 = A.getRadius();
    var r2 = B.getRadius();
    var sr = r1 + r2; // Sum of radius
    var dpos = A.getPos().sub(B.getPos()); // Delta position
    if (dpos.dot(dpos) > sr * sr) return false;

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
        b[i].x += 0.0001 * i;
        b[i].y += 0.0001 * i;
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
        minB = Math.min(corners[j + 4].x, minB);
        maxB = Math.max(corners[j + 4].x, maxB);
    }
    if (maxA < minB || maxB < minA) return false;

    // SAT w/ y-axis
    // Axis is <1, 0>
    // So dot product is just the y-value
    minA = maxA = corners[0].y;
    minB = maxB = corners[4].y;
    for (var j = 1; j < 4; j++) {
        minA = Math.min(corners[j].y, minA);
        maxA = Math.max(corners[j].y, maxA);
        minB = Math.min(corners[j + 4].y, minB);
        maxB = Math.max(corners[j + 4].y, maxB);
    }
    if (maxA < minB || maxB < minA) return false;

    // SAT w/ other two axes
    var normals = [b[3].sub(b[0]), b[3].sub(b[2])];
    for (var i = 0; i < normals.length; i++) {
        var normal = normals[i];
        var minA = undefined,
            maxA = undefined;
        var minB = undefined,
            maxB = undefined;
        for (var j = 0; j < 4; j++) {
            var s = corners[j].dot(normal);
            minA = Math.min(s, minA ? minA : Infinity);
            maxA = Math.max(s, maxA ? maxA : -Infinity);
            var s2 = corners[j + 4].dot(normal);
            minB = Math.min(s2, minB ? minB : Infinity);
            maxB = Math.max(s2, maxB ? maxB : -Infinity);
        }
        if (maxA < minB || maxB < minA) return false;
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
    if (pos.x < bl.x) return V(bl.x, clamp(pos.y, bl.y, tr.y));
    if (pos.x > tr.x) return V(tr.x, clamp(pos.y, bl.y, tr.y));
    if (pos.y < bl.y) return V(clamp(pos.x, bl.x, tr.x), bl.y);
    if (pos.y > tr.y) return V(clamp(pos.x, bl.x, tr.x), tr.y);
    return V(0, 0);
}

// Okay, I know this is awful but it's like 5:47 am and I'm tired
function getAllThingsBetween(things) {
    var objects = [];
    var wiresAndPorts = [];
    for (var i = 0; i < things.length; i++) {
        if (things[i] instanceof Wire || things[i] instanceof WirePort) wiresAndPorts.push(things[i]);else if (things[i] instanceof IOObject) objects.push(things[i]);
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
    if (objects.length === 0) return;

    var action = new GroupAction();
    var things = getAllThingsBetween(objects);
    for (var i = 0; i < things.length; i++) {
        if (things[i].selected) selectionTool.deselect([things[i]]);
        if (things[i] instanceof Wire || things[i] instanceof WirePort) {
            var oldinput = things[i].input;
            var oldconnection = things[i].connection;
            things[i].remove();
            if (doAction) action.add(new DeleteAction(things[i], oldinput, oldconnection));
        }
    }
    for (var i = 0; i < things.length; i++) {
        if (!(things[i] instanceof Wire || things[i] instanceof WirePort)) {
            things[i].remove();
            if (doAction) action.add(new DeleteAction(things[i]));
        }
    }
    if (doAction) ctx.addAction(action);
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
    for (var i = 0; i < arr.length; i++) {
        copy.push(arr[i]);
    }return copy;
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
        if (ics[i].icuid === id) return ics[i];
    }
    return undefined;
}

function findByUID(objects, id) {
    for (var i = 0; i < objects.length; i++) {
        if (objects[i].uid === id) return objects[i];
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
        if (origin.equals(target)) continue;
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
function _getNearestT(p1, p2, mx, my) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    var t = (dx * (mx - p1.x) + dy * (my - p1.y)) / (dx * dx + dy * dy);
    t = clamp(t, 0, 1);
    var pos = V(dx * t + p1.x, dy * t + p1.y);
    if (pos.sub(V(mx, my)).len2() < WIRE_DIST_THRESHOLD2) return t;else return -1;
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
        if (dv === 0) break;
        t = t - v / dv;
        t = clamp(t, 0.01, 0.99);
    } while (iterations-- > 0);
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
        if (object instanceof Switch || object instanceof Button || object instanceof Clock) inputs.push(object);else if (object instanceof LED) outputs.push(object);else components.push(object);
    }
    return { inputs: inputs, components: components, outputs: outputs };
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
    if (navigator == undefined) return;
    var ua = navigator.userAgent,
        tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return { name: 'IE', version: tem[1] || '' };
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\bOPR|Edge\/(\d+)/);
        if (tem != null) {
            return { name: 'Opera', version: tem[1] };
        }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) {
        M.splice(1, 1, tem[1]);
    }
    return {
        name: M[0],
        version: M[1]
    };
}

var Action = function () {
    function Action() {
        _classCallCheck(this, Action);

        this.context = getCurrentContext();
        // Anytime an action is performed, user should need to save
        saved = false;
    }

    _createClass(Action, [{
        key: 'undo',
        value: function undo() {}
    }, {
        key: 'redo',
        value: function redo() {}
    }]);

    return Action;
}();

var DeleteAction = function (_Action) {
    _inherits(DeleteAction, _Action);

    function DeleteAction(obj, oldinput, oldconnection) {
        _classCallCheck(this, DeleteAction);

        var _this2 = _possibleConstructorReturn(this, (DeleteAction.__proto__ || Object.getPrototypeOf(DeleteAction)).call(this));

        _this2.obj = obj;
        _this2.oldinput = oldinput;
        _this2.oldconnection = oldconnection;
        return _this2;
    }

    _createClass(DeleteAction, [{
        key: 'undo',
        value: function undo() {
            this.context.add(this.obj);
            if (this.oldinput != undefined) this.oldinput.connect(this.obj);
            if (this.oldconnection != undefined) this.obj.connect(this.oldconnection);
        }
    }, {
        key: 'redo',
        value: function redo() {
            this.obj.remove();
        }
    }]);

    return DeleteAction;
}(Action);

var GroupAction = function (_Action2) {
    _inherits(GroupAction, _Action2);

    function GroupAction() {
        _classCallCheck(this, GroupAction);

        var _this3 = _possibleConstructorReturn(this, (GroupAction.__proto__ || Object.getPrototypeOf(GroupAction)).call(this));

        _this3.actions = [];
        return _this3;
    }

    _createClass(GroupAction, [{
        key: 'add',
        value: function add(action) {
            this.actions.push(action);
        }
    }, {
        key: 'undo',
        value: function undo() {
            for (var i = this.actions.length - 1; i >= 0; i--) {
                this.actions[i].undo();
            }
        }
    }, {
        key: 'redo',
        value: function redo() {
            for (var i = 0; i < this.actions.length; i++) {
                this.actions[i].redo();
            }
        }
    }]);

    return GroupAction;
}(Action);

var PlaceAction = function (_Action3) {
    _inherits(PlaceAction, _Action3);

    function PlaceAction(obj) {
        _classCallCheck(this, PlaceAction);

        var _this4 = _possibleConstructorReturn(this, (PlaceAction.__proto__ || Object.getPrototypeOf(PlaceAction)).call(this));

        _this4.obj = obj;
        return _this4;
    }

    _createClass(PlaceAction, [{
        key: 'undo',
        value: function undo() {
            this.context.remove(this.obj);
        }
    }, {
        key: 'redo',
        value: function redo() {
            this.context.addObject(this.obj);
        }
    }]);

    return PlaceAction;
}(Action);

var PlaceWireAction = function (_Action4) {
    _inherits(PlaceWireAction, _Action4);

    function PlaceWireAction(wire) {
        _classCallCheck(this, PlaceWireAction);

        var _this5 = _possibleConstructorReturn(this, (PlaceWireAction.__proto__ || Object.getPrototypeOf(PlaceWireAction)).call(this));

        _this5.wire = wire;
        _this5.input = _this5.wire.input;
        _this5.connection = _this5.wire.connection;
        return _this5;
    }

    _createClass(PlaceWireAction, [{
        key: 'undo',
        value: function undo() {
            this.context.remove(this.wire);
            this.wire.disconnect();
            this.wire.input.disconnect(this.wire);
        }
    }, {
        key: 'redo',
        value: function redo() {
            this.context.add(this.wire);
            this.wire.connect(this.connection);
            this.input.connect(this.wire);
        }
    }]);

    return PlaceWireAction;
}(Action);

var SelectAction = function (_Action5) {
    _inherits(SelectAction, _Action5);

    function SelectAction(obj, flip) {
        _classCallCheck(this, SelectAction);

        var _this6 = _possibleConstructorReturn(this, (SelectAction.__proto__ || Object.getPrototypeOf(SelectAction)).call(this));

        _this6.obj = obj;
        _this6.flip = flip;
        return _this6;
    }

    _createClass(SelectAction, [{
        key: 'undo',
        value: function undo() {
            if (this.flip) this.reselect();else this.deselect();
        }
    }, {
        key: 'redo',
        value: function redo() {
            if (this.flip) this.deselect();else this.reselect();
        }
    }, {
        key: 'reselect',
        value: function reselect() {
            selectionTool.select([this.obj]);
        }
    }, {
        key: 'deselect',
        value: function deselect() {
            selectionTool.deselect([this.obj]);
        }
    }]);

    return SelectAction;
}(Action);

var SplitWireAction = function (_Action6) {
    _inherits(SplitWireAction, _Action6);

    function SplitWireAction(wire) {
        _classCallCheck(this, SplitWireAction);

        var _this7 = _possibleConstructorReturn(this, (SplitWireAction.__proto__ || Object.getPrototypeOf(SplitWireAction)).call(this));

        _this7.wireport = wire.connection;
        _this7.wire = wire;
        _this7.newwire = _this7.wireport.connection;
        _this7.connection = _this7.newwire.connection;
        return _this7;
    }

    _createClass(SplitWireAction, [{
        key: 'undo',
        value: function undo() {
            this.context.remove(this.wireport);
            this.context.remove(this.newwire);

            this.wire.disconnect();
            this.newwire.disconnect();

            this.wire.connect(this.connection);
        }
    }, {
        key: 'redo',
        value: function redo() {
            this.context.add(this.wireport);
            this.context.add(this.newwire);

            this.wire.disconnect();

            this.wire.connect(this.wireport);
            this.newwire.connect(this.connection);
        }
    }]);

    return SplitWireAction;
}(Action);

var TransformAction = function (_Action7) {
    _inherits(TransformAction, _Action7);

    function TransformAction(obj, t0, t1) {
        _classCallCheck(this, TransformAction);

        var _this8 = _possibleConstructorReturn(this, (TransformAction.__proto__ || Object.getPrototypeOf(TransformAction)).call(this));

        _this8.obj = obj;
        _this8.t0 = t0;
        _this8.t1 = t1;
        return _this8;
    }

    _createClass(TransformAction, [{
        key: 'undo',
        value: function undo() {
            this.obj.setTransform(this.t0);
            this.updatePopup();
        }
    }, {
        key: 'redo',
        value: function redo() {
            this.obj.setTransform(this.t1);
            this.updatePopup();
        }
    }, {
        key: 'updatePopup',
        value: function updatePopup() {
            if (this.obj.selected) {
                selectionTool.recalculateMidpoint();
                popup.onMove();
            }
        }
    }]);

    return TransformAction;
}(Action);

var BezierCurve = function () {
    function BezierCurve(p1, p2, c1, c2) {
        _classCallCheck(this, BezierCurve);

        this.p1 = V(p1.x, p1.y);
        this.p2 = V(p2.x, p2.y);
        this.c1 = V(c1.x, c1.y);
        this.c2 = V(c2.x, c2.y);
        this.dirty = true;
        this.boundingBox = new Transform(0, 0, 0, getCurrentContext().getCamera());
    }

    _createClass(BezierCurve, [{
        key: 'update',
        value: function update(p1, p2, c1, c2) {
            this.p1.x = p1.x;
            this.p1.y = p1.y;
            this.p2.x = p2.x;
            this.p2.y = p2.y;
            this.c1.x = c1.x;
            this.c1.y = c1.y;
            this.c2.x = c2.x;
            this.c2.y = c2.y;
        }
    }, {
        key: 'updateBoundingBox',
        value: function updateBoundingBox() {
            if (!this.dirty) return;
            this.dirty = false;

            var min = V(0, 0);
            var max = V(0, 0);
            var end1 = this.getPos(0);
            var end2 = this.getPos(1);
            var a = this.c1.sub(this.c2).scale(3).add(this.p2.sub(this.p1));
            var b = this.p1.sub(this.c1.scale(2).add(this.c2)).scale(2);
            var c = this.c1.sub(this.p1);

            var discriminant1 = b.y * b.y - 4 * a.y * c.y;
            discriminant1 = discriminant1 >= 0 ? Math.sqrt(discriminant1) : -1;
            var t1 = discriminant1 !== -1 ? clamp((-b.y + discriminant1) / (2 * a.y), 0, 1) : 0;
            var t2 = discriminant1 !== -1 ? clamp((-b.y - discriminant1) / (2 * a.y), 0, 1) : 0;
            max.y = Math.max(this.getY(t1), this.getY(t2), end1.y, end2.y);
            min.y = Math.min(this.getY(t1), this.getY(t2), end1.y, end2.y);

            var discriminant2 = b.x * b.x - 4 * a.x * c.x;
            discriminant2 = discriminant2 >= 0 ? Math.sqrt(discriminant2) : -1;
            var t3 = discriminant2 !== -1 ? clamp((-b.x + discriminant2) / (2 * a.x), 0, 1) : 0;
            var t4 = discriminant2 !== -1 ? clamp((-b.x - discriminant2) / (2 * a.x), 0, 1) : 0;
            max.x = Math.max(this.getX(t1), this.getX(t2), end1.x, end2.x);
            min.x = Math.min(this.getX(t1), this.getX(t2), end1.x, end2.x);

            this.boundingBox.setSize(V(max.x - min.x, max.y - min.y));
            this.boundingBox.setPos(V((max.x - min.x) / 2 + min.x, (max.y - min.y) / 2 + min.y));
        }
    }, {
        key: 'draw',
        value: function draw(style, size, renderer) {
            var camera = renderer.parent.camera;

            var p1 = camera.getScreenPos(this.p1);
            var p2 = camera.getScreenPos(this.p2);
            var c1 = camera.getScreenPos(this.c1);
            var c2 = camera.getScreenPos(this.c2);

            renderer.curve(p1.x, p1.y, p2.x, p2.y, c1.x, c1.y, c2.x, c2.y, style, size);
        }
    }, {
        key: 'getX',
        value: function getX(t) {
            var it = 1 - t;
            return this.p1.x * it * it * it + 3 * this.c1.x * t * it * it + 3 * this.c2.x * t * t * it + this.p2.x * t * t * t;
        }
    }, {
        key: 'getY',
        value: function getY(t) {
            var it = 1 - t;
            return this.p1.y * it * it * it + 3 * this.c1.y * t * it * it + 3 * this.c2.y * t * t * it + this.p2.y * t * t * t;
        }
    }, {
        key: 'getPos',
        value: function getPos(t) {
            return V(this.getX(t), this.getY(t));
        }
    }, {
        key: 'getDX',
        value: function getDX(t) {
            var it = 1 - t;
            return -3 * this.p1.x * it * it + 3 * this.c1.x * it * (1 - 3 * t) + 3 * this.c2.x * t * (2 - 3 * t) + 3 * this.p2.x * t * t;
        }
    }, {
        key: 'getDY',
        value: function getDY(t) {
            var it = 1 - t;
            return -3 * this.p1.y * it * it + 3 * this.c1.y * it * (1 - 3 * t) + 3 * this.c2.y * t * (2 - 3 * t) + 3 * this.p2.y * t * t;
        }
    }, {
        key: 'getVel',
        value: function getVel(t) {
            return V(this.getDX(t), this.getDY(t));
        }
    }, {
        key: 'getDDX',
        value: function getDDX(t) {
            var m = -this.p1.x + 3 * this.c1.x - 3 * this.c2.x + this.p2.x;
            var b = this.p1.x - 2 * this.c1.x + this.c2.x;
            return 6 * (m * t + b);
        }
    }, {
        key: 'getDDY',
        value: function getDDY(t) {
            var m = -this.p1.y + 3 * this.c1.y - 3 * this.c2.y + this.p2.y;
            var b = this.p1.y - 2 * this.c1.y + this.c2.y;
            return 6 * (m * t + b);
        }
    }, {
        key: 'getDist',
        value: function getDist(t, mx, my) {
            var dx = this.getX(t) - mx;
            var dy = this.getY(t) - my;
            return Math.sqrt(dx * dx + dy * dy);
        }
    }, {
        key: 'getDist2',
        value: function getDist2(t, mx, my) {
            var dx = this.getX(t) - mx;
            var dy = this.getY(t) - my;
            return dx * dx + dy * dy;
        }
    }, {
        key: 'getDistDenominator',
        value: function getDistDenominator(t, mx, my) {
            var dx = this.getX(t) - mx;
            var dy = this.getY(t) - my;
            return dx * dx + dy * dy;
        }
    }, {
        key: 'getDistDenominatorDerivative',
        value: function getDistDenominatorDerivative(t, mx, my) {
            return 2 * (this.getX(t) - mx) * this.getDX(t) + 2 * (this.getY(t) - my) * this.getDY(t);
        }
    }, {
        key: 'getDistNumerator',
        value: function getDistNumerator(t, mx, my) {
            var dx = this.getX(t) - mx;
            var dy = this.getY(t) - my;
            return this.getDX(t) * dx + this.getDY(t) * dy;
        }
    }, {
        key: 'getDistNumeratorDerivative',
        value: function getDistNumeratorDerivative(t, mx, my) {
            var dx = this.getX(t) - mx;
            var dy = this.getY(t) - my;
            var dbx = this.getDX(t);
            var dby = this.getDY(t);
            return dbx * dbx + dx * this.getDDX(t) + dby * dby + dy * this.getDDY(t);
        }
    }, {
        key: 'getNearestT',
        value: function getNearestT(mx, my) {
            var _this9 = this;

            var minDist = 1e20;
            var t0 = -1;
            for (var tt = 0; tt <= 1.0; tt += 1.0 / WIRE_DIST_ITERATIONS) {
                var dist = this.getDist(tt, mx, my);
                if (dist < minDist) {
                    t0 = tt;
                    minDist = dist;
                }
            }

            // Newton's method to find parameter for when slope is undefined AKA denominator function = 0
            var t1 = findRoots(WIRE_NEWTON_ITERATIONS, t0, mx, my, function (t, x, y) {
                return _this9.getDistDenominator(t, x, y);
            }, function (t, x, y) {
                return _this9.getDistDenominatorDerivative(t, x, y);
            });
            if (this.getDist2(t1, mx, my) < WIRE_DIST_THRESHOLD2) return t1;

            // Newton's method to find parameter for when slope is 0 AKA numerator function = 0
            var t2 = findRoots(WIRE_NEWTON_ITERATIONS, t0, mx, my, function (t, x, y) {
                return _this9.getDistNumerator(t, x, y);
            }, function (t, x, y) {
                return _this9.getDistNumeratorDerivative(t, x, y);
            });
            if (this.getDist2(t2, mx, my) < WIRE_DIST_THRESHOLD2) return t2;

            return -1;
        }
    }, {
        key: 'getBoundingBox',
        value: function getBoundingBox() {
            this.updateBoundingBox();
            return this.boundingBox;
        }
    }, {
        key: 'copy',
        value: function copy() {
            return new BezierCurve(this.p1.copy(), this.p2.copy(), this.c1.copy(), this.c2.copy());
        }
    }, {
        key: 'writeTo',
        value: function writeTo(node) {
            var bezierNode = createChildNode(node, "bezier");
            createTextElement(bezierNode, "p1x", this.p1.x);
            createTextElement(bezierNode, "p1y", this.p1.y);
            createTextElement(bezierNode, "p2x", this.p2.x);
            createTextElement(bezierNode, "p2y", this.p2.y);
            createTextElement(bezierNode, "c1x", this.c1.x);
            createTextElement(bezierNode, "c1y", this.c1.y);
            createTextElement(bezierNode, "c2x", this.c2.x);
            createTextElement(bezierNode, "c2y", this.c2.y);
        }
    }, {
        key: 'load',
        value: function load(node) {
            var p1 = V(getFloatValue(getChildNode(node, "p1x")), getFloatValue(getChildNode(node, "p1y")));
            var p2 = V(getFloatValue(getChildNode(node, "p2x")), getFloatValue(getChildNode(node, "p2y")));
            var c1 = V(getFloatValue(getChildNode(node, "c1x")), getFloatValue(getChildNode(node, "c1y")));
            var c2 = V(getFloatValue(getChildNode(node, "c2x")), getFloatValue(getChildNode(node, "c2y")));
            this.update(p1, p2, c1, c2);
        }
    }]);

    return BezierCurve;
}();

var Matrix2x3 = function () {
    function Matrix2x3(other) {
        _classCallCheck(this, Matrix2x3);

        this.mat = [];
        this.identity();
        if (other instanceof Matrix2x3) {
            for (var i = 0; i < 2 * 3; i++) {
                this.mat[i] = other.mat[i];
            }
        }
    }

    _createClass(Matrix2x3, [{
        key: 'zero',
        value: function zero() {
            for (var i = 0; i < 2 * 3; i++) {
                this.mat[i] = 0;
            }return this;
        }
    }, {
        key: 'identity',
        value: function identity() {
            this.zero();

            this.mat[0] = 1.0;
            this.mat[3] = 1.0;

            return this;
        }
    }, {
        key: 'mul',
        value: function mul(v) {
            var result = V(0, 0);
            result.x = this.mat[0] * v.x + this.mat[2] * v.y + this.mat[4];
            result.y = this.mat[1] * v.x + this.mat[3] * v.y + this.mat[5];
            return result;
        }
    }, {
        key: 'mult',
        value: function mult(m) {
            var result = new Matrix2x3();
            result.mat[0] = this.mat[0] * m.mat[0] + this.mat[2] * m.mat[1];
            result.mat[1] = this.mat[1] * m.mat[0] + this.mat[3] * m.mat[1];
            result.mat[2] = this.mat[0] * m.mat[2] + this.mat[2] * m.mat[3];
            result.mat[3] = this.mat[1] * m.mat[2] + this.mat[3] * m.mat[3];
            result.mat[4] = this.mat[0] * m.mat[4] + this.mat[2] * m.mat[5] + this.mat[4];
            result.mat[5] = this.mat[1] * m.mat[4] + this.mat[3] * m.mat[5] + this.mat[5];
            return result;
        }
    }, {
        key: 'translate',
        value: function translate(v) {
            this.mat[4] += this.mat[0] * v.x + this.mat[2] * v.y;
            this.mat[5] += this.mat[1] * v.x + this.mat[3] * v.y;
        }
    }, {
        key: 'rotate',
        value: function rotate(theta) {
            var c = Math.cos(theta);
            var s = Math.sin(theta);
            var m11 = this.mat[0] * c + this.mat[2] * s;
            var m12 = this.mat[1] * c + this.mat[3] * s;
            var m21 = this.mat[0] * -s + this.mat[2] * c;
            var m22 = this.mat[1] * -s + this.mat[3] * c;
            this.mat[0] = m11;
            this.mat[1] = m12;
            this.mat[2] = m21;
            this.mat[3] = m22;
        }
    }, {
        key: 'scale',
        value: function scale(s) {
            this.mat[0] *= s.x;
            this.mat[1] *= s.x;
            this.mat[2] *= s.y;
            this.mat[3] *= s.y;
        }
    }, {
        key: 'inverse',
        value: function inverse() {
            var inv = new Array(3 * 2);
            var det;

            inv[0] = this.mat[3];
            inv[1] = -this.mat[1];
            inv[2] = -this.mat[2];
            inv[3] = this.mat[0];
            inv[4] = this.mat[2] * this.mat[5] - this.mat[4] * this.mat[3];
            inv[5] = this.mat[4] * this.mat[1] - this.mat[0] * this.mat[5];

            det = this.mat[0] * this.mat[3] - this.mat[1] * this.mat[2];

            if (det == 0) return undefined;

            det = 1.0 / det;

            var m = new Matrix2x3();
            for (var i = 0; i < 2 * 3; i++) {
                m.mat[i] = inv[i] * det;
            }return m;
        }
    }, {
        key: 'print',
        value: function print() {
            console.log("[" + this.mat[0].toFixed(3) + ", " + this.mat[2].toFixed(3) + ", " + this.mat[4].toFixed(3) + "]\n" + "[" + this.mat[1].toFixed(3) + ", " + this.mat[3].toFixed(3) + ", " + this.mat[5].toFixed(3) + "]");
        }
    }]);

    return Matrix2x3;
}();

var Transform = function () {
    function Transform(pos, size, angle, camera) {
        _classCallCheck(this, Transform);

        this.parent = undefined;
        this.pos = V(pos.x, pos.y);
        this.size = V(size.x, size.y);
        this.angle = angle;
        this.scale = V(1, 1);
        this.corners = [];
        this.localCorners = [];
        this.camera = camera;
        this.dirty = true;
        this.dirtySize = true;
        this.dirtyCorners = true;
        this.updateMatrix();
    }

    _createClass(Transform, [{
        key: 'updateMatrix',
        value: function updateMatrix(c) {
            if (!this.dirty) return;
            this.dirty = false;

            this.matrix = new Matrix2x3();
            this.matrix.translate(this.pos);
            this.matrix.rotate(this.angle);
            this.matrix.scale(this.scale);

            if (this.parent != undefined) this.matrix = this.parent.getMatrix().mult(this.matrix);

            this.inverse = this.matrix.inverse();
        }
    }, {
        key: 'updateSize',
        value: function updateSize() {
            if (!this.dirtySize) return;
            this.dirtySize = false;

            this.localCorners = [this.size.scale(V(-0.5, 0.5)), this.size.scale(V(0.5, 0.5)), this.size.scale(V(0.5, -0.5)), this.size.scale(V(-0.5, -0.5))];

            this.radius = Math.sqrt(this.size.x * this.size.x + this.size.y * this.size.y) / 2;
        }
    }, {
        key: 'updateCorners',
        value: function updateCorners() {
            if (!this.dirtyCorners) return;
            this.dirtyCorners = false;

            var corners = this.getLocalCorners();
            for (var i = 0; i < 4; i++) {
                this.corners[i] = this.toWorldSpace(corners[i]);
            }
        }
    }, {
        key: 'transformCtx',
        value: function transformCtx(ctx) {
            this.updateMatrix();
            var m = new Matrix2x3(this.matrix);
            var v = this.camera.getScreenPos(V(m.mat[4], m.mat[5]));
            m.mat[4] = v.x, m.mat[5] = v.y;
            m.scale(V(1 / this.camera.zoom, 1 / this.camera.zoom));
            ctx.setTransform(m.mat[0], m.mat[1], m.mat[2], m.mat[3], m.mat[4], m.mat[5]);
        }
    }, {
        key: 'rotateAbout',
        value: function rotateAbout(a, c) {
            this.setAngle(a);
            this.setPos(this.pos.sub(c));
            var cos = Math.cos(a),
                sin = Math.sin(a);
            var xx = this.pos.x * cos - this.pos.y * sin;
            var yy = this.pos.y * cos + this.pos.x * sin;
            this.setPos(V(xx, yy).add(c));
            this.dirty = true;
            this.dirtyCorners = true;
        }
    }, {
        key: 'setParent',
        value: function setParent(t) {
            this.parent = t;
            this.dirty = true;
            this.dirtyCorners = true;
        }
    }, {
        key: 'setCamera',
        value: function setCamera(c) {
            this.camera = c;
        }
    }, {
        key: 'setPos',
        value: function setPos(p) {
            this.pos.x = p.x;
            this.pos.y = p.y;
            this.dirty = true;
            this.dirtyCorners = true;
        }
    }, {
        key: 'setAngle',
        value: function setAngle(a) {
            this.angle = a;
            this.dirty = true;
            this.dirtyCorners = true;
        }
    }, {
        key: 'setScale',
        value: function setScale(s) {
            this.scale.x = s.x;
            this.scale.y = s.y;
            this.dirty = true;
        }
    }, {
        key: 'setSize',
        value: function setSize(s) {
            this.size.x = s.x;
            this.size.y = s.y;
            this.dirtySize = true;
            this.dirtyCorners = true;
        }
    }, {
        key: 'setWidth',
        value: function setWidth(w) {
            this.size.x = w;
            this.dirtySize = true;
            this.dirtyCorners = true;
        }
    }, {
        key: 'setHeight',
        value: function setHeight(h) {
            this.size.y = h;
            this.dirtySize = true;
            this.dirtyCorners = true;
        }
    }, {
        key: 'toLocalSpace',
        value: function toLocalSpace(v) {
            // v must be in world coords
            return this.getInverseMatrix().mul(v);
        }
    }, {
        key: 'toWorldSpace',
        value: function toWorldSpace(v) {
            // v must be in local coords
            return this.getMatrix().mul(v);
        }
    }, {
        key: 'getPos',
        value: function getPos() {
            return V(this.pos.x, this.pos.y);
        }
    }, {
        key: 'getAngle',
        value: function getAngle() {
            return this.angle;
        }
    }, {
        key: 'getScale',
        value: function getScale() {
            return V(this.scale.x, this.scale.y);
        }
    }, {
        key: 'getSize',
        value: function getSize() {
            return this.size;
        }
    }, {
        key: 'getRadius',
        value: function getRadius() {
            this.updateSize();
            return this.radius;
        }
    }, {
        key: 'getMatrix',
        value: function getMatrix() {
            this.updateMatrix();
            return this.matrix;
        }
    }, {
        key: 'getInverseMatrix',
        value: function getInverseMatrix() {
            this.updateMatrix();
            return this.inverse;
        }
    }, {
        key: 'getBottomLeft',
        value: function getBottomLeft() {
            this.updateCorners();
            return this.corners[0];
        }
    }, {
        key: 'getBottomRight',
        value: function getBottomRight() {
            this.updateCorners();
            return this.corners[1];
        }
    }, {
        key: 'getTopRight',
        value: function getTopRight() {
            this.updateCorners();
            return this.corners[2];
        }
    }, {
        key: 'getTopLeft',
        value: function getTopLeft() {
            this.updateCorners();
            return this.corners[3];
        }
    }, {
        key: 'getCorners',
        value: function getCorners() {
            this.updateCorners();
            return this.corners;
        }
    }, {
        key: 'getLocalCorners',
        value: function getLocalCorners() {
            this.updateSize();
            return this.localCorners;
        }
    }, {
        key: 'equals',
        value: function equals(other) {
            if (!(other instanceof Transform)) return false;

            var m1 = this.getMatrix().mat;
            var m2 = other.getMatrix().mat;
            for (var i = 0; i < m1.length; i++) {
                if (m1[i] !== m2[i]) return false;
            }
            return true;
        }
    }, {
        key: 'print',
        value: function print() {
            this.updateMatrix();
            this.matrix.print();
        }
    }, {
        key: 'copy',
        value: function copy() {
            var trans = new Transform(this.pos.copy(), this.size.copy(), this.angle, this.camera);
            trans.scale = this.scale.copy();
            trans.dirty = true;
            return trans;
        }
    }]);

    return Transform;
}();

// Utility method for a new Vector


function V(x, y) {
    return new Vector(x, y);
}

var Vector = function () {
    function Vector(x, y) {
        _classCallCheck(this, Vector);

        this.set(x, y);
    }

    _createClass(Vector, [{
        key: 'set',
        value: function set(x, y) {
            if (x instanceof Vector) {
                this.x = x.x ? x.x : 0;
                this.y = x.y ? x.y : 0;
            } else {
                this.x = x ? x : 0;
                this.y = y ? y : 0;
            }
        }
    }, {
        key: 'translate',
        value: function translate(dx, dy) {
            if (dx instanceof Vector) this.set(this.add(dx));else this.set(this.x + dx, this.y + dy);
        }
    }, {
        key: 'add',
        value: function add(x, y) {
            if (x instanceof Vector) return new Vector(this.x + x.x, this.y + x.y);else return new Vector(this.x + x, this.y + y);
        }
    }, {
        key: 'sub',
        value: function sub(x, y) {
            if (x instanceof Vector) return new Vector(this.x - x.x, this.y - x.y);else return new Vector(this.x - x, this.y - y);
        }
    }, {
        key: 'scale',
        value: function scale(a) {
            if (a instanceof Vector) return new Vector(a.x * this.x, a.y * this.y);else return new Vector(a * this.x, a * this.y);
        }
    }, {
        key: 'normalize',
        value: function normalize() {
            var len = this.len();
            if (len === 0) {
                return new Vector(0, 0);
            } else {
                var invLen = 1 / len;
                return new Vector(this.x * invLen, this.y * invLen);
            }
        }
    }, {
        key: 'len',
        value: function len() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
    }, {
        key: 'len2',
        value: function len2() {
            return this.x * this.x + this.y * this.y;
        }
    }, {
        key: 'distanceTo',
        value: function distanceTo(v) {
            return this.sub(v).len();
        }
    }, {
        key: 'dot',
        value: function dot(v) {
            return this.x * v.x + this.y * v.y;
        }
    }, {
        key: 'project',
        value: function project(v) {
            return this.scale(v.dot(this) / this.len2());
        }
    }, {
        key: 'copy',
        value: function copy() {
            return new Vector(this.x, this.y);
        }
    }]);

    return Vector;
}();

var Module = function () {
    function Module(parent, divName, divTextName) {
        var _this10 = this;

        _classCallCheck(this, Module);

        this.parent = parent;
        this.div = document.getElementById(divName);
        this.divtext = divTextName ? document.getElementById(divTextName) : undefined;
        this.div.oninput = function () {
            render();_this10.onChange();
        };
        this.div.onclick = function () {
            return _this10.onClick();
        };
        this.div.onfocus = function () {
            return _this10.onFocus();
        };
        this.div.onblur = function () {
            return _this10.onBlur();
        };
    }

    _createClass(Module, [{
        key: 'blur',
        value: function blur() {
            this.div.blur();
        }
    }, {
        key: 'onShow',
        value: function onShow() {}
    }, {
        key: 'setValue',
        value: function setValue(val) {
            this.div.value = val;
        }
    }, {
        key: 'setPlaceholder',
        value: function setPlaceholder(val) {
            this.div.placeholder = val;
        }
    }, {
        key: 'setVisibility',
        value: function setVisibility(val) {
            this.div.style.display = val;
            if (this.divtext != undefined) this.divtext.style.display = val;
        }
    }, {
        key: 'setDisabled',
        value: function setDisabled(val) {
            this.div.disabled = val;
        }
    }, {
        key: 'getValue',
        value: function getValue() {
            return this.div.value;
        }
    }, {
        key: 'onChange',
        value: function onChange() {}
    }, {
        key: 'onClick',
        value: function onClick() {}
    }, {
        key: 'onFocus',
        value: function onFocus() {
            this.parent.focused = true;
        }
    }, {
        key: 'onBlur',
        value: function onBlur() {
            this.parent.focused = false;
        }
    }]);

    return Module;
}();

var Popup = function () {
    function Popup(divName) {
        var _this11 = this;

        _classCallCheck(this, Popup);

        this.div = document.getElementById(divName);
        this.div.addEventListener('keydown', function (e) {
            _this11.onKeyDown(e.keyCode);
        }, false);
        this.div.addEventListener('keyup', function (e) {
            _this11.onKeyUp(e.keyCode);
        }, false);
        this.div.style.position = "absolute";
        this.focused = false;

        this.modules = [];

        this.setPos(V(0, 0));
        this.hide();
    }

    _createClass(Popup, [{
        key: 'onKeyDown',
        value: function onKeyDown(code) {}
    }, {
        key: 'onKeyUp',
        value: function onKeyUp(code) {}
    }, {
        key: 'add',
        value: function add(m) {
            this.modules.push(m);
        }
    }, {
        key: 'update',
        value: function update() {
            this.onShow();
        }
    }, {
        key: 'onShow',
        value: function onShow() {
            for (var i = 0; i < this.modules.length; i++) {
                this.modules[i].onShow();
            }
        }
    }, {
        key: 'blur',
        value: function blur() {
            for (var i = 0; i < this.modules.length; i++) {
                this.modules[i].blur();
            }
        }
    }, {
        key: 'show',
        value: function show() {
            this.hidden = false;
            this.div.style.visibility = "visible";
            this.div.focus();
            this.onShow();
        }
    }, {
        key: 'hide',
        value: function hide() {
            this.hidden = true;
            this.div.style.visibility = "hidden";
            this.div.blur();
        }
    }, {
        key: 'setPos',
        value: function setPos(v) {
            this.pos = V(v.x, v.y);
            this.clamp();

            this.div.style.left = this.pos.x + "px";
            this.div.style.top = this.pos.y + "px";
        }
    }, {
        key: 'clamp',
        value: function clamp() {
            this.pos.x = Math.max(Math.min(this.pos.x, window.innerWidth - this.div.clientWidth - 1), ItemNavController.isOpen ? ITEMNAV_WIDTH + 5 : 5);
            this.pos.y = Math.max(Math.min(this.pos.y, window.innerHeight - this.div.clientHeight - 1), (header ? header.clientHeight : 0) + 5);
        }
    }]);

    return Popup;
}();

var Exporter = function () {
    var projectNameInput = document.getElementById("project-name");

    return {
        ROOT: undefined,
        saveFile: function saveFile() {
            var data = this.write(getCurrentContext());
            var projectName = projectNameInput.value;
            if (projectName === "Untitled Circuit*") projectName = "Untitled Circuit";
            var filename = projectName + ".circuit";

            var file = new Blob([data], { type: "text/plain" });
            if (window.navigator.msSaveOrOpenBlob) {
                // IE10+
                window.navigator.msSaveOrOpenBlob(file, filename);
                saved = true;
            } else {
                // Others
                var a = document.createElement("a");
                var url = URL.createObjectURL(file);
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(function () {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    saved = true;
                }, 0);
            }
        },
        write: function write(context) {
            var root = new window.DOMParser().parseFromString("<?xml version=\"1.0\" encoding=\"UTF-8\"?><project></project>", "text/xml");
            this.ROOT = root;

            var objects = context.getObjects();
            var wires = context.getWires();

            var projectNode = getChildNode(root, "project");

            var icNode = createChildNode(projectNode, "ics");

            this.writeICs(icNode);
            this.writeGroup(projectNode, objects, wires);

            return root.xml ? root.xml : new XMLSerializer().serializeToString(root);
        },
        writeGroup: function writeGroup(node, objects, wires) {
            var objectsNode = createChildNode(node, "objects");
            var wiresNode = createChildNode(node, "wires");

            for (var i = 0; i < objects.length; i++) {
                objects[i].writeTo(objectsNode);
            }for (var i = 0; i < wires.length; i++) {
                wires[i].writeTo(wiresNode);
            }
        },
        writeICs: function writeICs(node) {
            for (var i = 0; i < ICData.ICs.length; i++) {
                var ic = ICData.ICs[i];
                var ICNode = createChildNode(node, "ic");
                createTextElement(ICNode, "icuid", ic.icuid);
                createTextElement(ICNode, "width", ic.transform.size.x);
                createTextElement(ICNode, "height", ic.transform.size.y);

                var iportNode = createChildNode(ICNode, "iports");
                for (var j = 0; j < ic.iports.length; j++) {
                    ic.iports[j].writeTo(iportNode);
                }var oportNode = createChildNode(ICNode, "oports");
                for (var j = 0; j < ic.oports.length; j++) {
                    ic.oports[j].writeTo(oportNode);
                }var componentsNode = createChildNode(ICNode, "components");
                var objects = ic.inputs.concat(ic.components, ic.outputs);
                var wires = getAllWires(objects);
                this.writeGroup(componentsNode, objects, wires);
            }
        }
    };
}();

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

var Importer = function () {
    var fileInput = document.getElementById('file-input');

    return {
        types: [],
        openFile: function openFile() {
            // TODO: Custom popup w/ option to save
            var open = confirm("Are you sure you want to overwrite your current scene?");

            if (open) {
                reset();

                var reader = new FileReader();

                reader.onload = function (e) {
                    Importer.load(reader.result, getCurrentContext());
                    render();
                };

                reader.readAsText(fileInput.files[0]);
            }
        },
        load: function load(text, context) {
            // Remove all whitespace from XML file except for header
            var header = text.substring(0, text.indexOf(">") + 1);
            text = header + text.substring(text.indexOf(">") + 1).replace(/\s/g, '');

            var root = new window.DOMParser().parseFromString(text, "text/xml");
            if (root.documentElement.nodeName == "parsererror") return;

            var project = getChildNode(root, "project");
            var icsNode = getChildNode(project, "ics");

            var ics = this.loadICs(icsNode, context);

            var group = this.loadGroup(project, context, ics);
            context.addObjects(group.objects);
            context.addWires(group.wires);

            for (var i = 0; i < ics.length; i++) {
                ICData.add(ics[i]);
            }context.redistributeUIDs();
            ICData.redistributeUIDs();

            return group;
        },
        loadGroup: function loadGroup(node, context, ics) {
            var objectsNode = getChildNode(node, "objects");
            var wiresNode = getChildNode(node, "wires");

            var objects = [];
            var wires = [];

            for (var i = 0; i < this.types.length; i++) {
                var type = this.types[i];
                var nodes = getChildrenByTagName(objectsNode, type.getXMLName());
                for (var j = 0; j < nodes.length; j++) {
                    objects.push(new type(context).load(nodes[j], ics));
                }
            }

            var wiresArr = getChildrenByTagName(wiresNode, "wire");
            for (var i = 0; i < wiresArr.length; i++) {
                wires.push(new Wire(context).load(wiresArr[i]));
            }for (var i = 0; i < wires.length; i++) {
                wires[i].loadConnections(wiresArr[i], objects);
            }return { objects: objects, wires: wires };
        },
        loadICs: function loadICs(node, context) {
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
                for (var j = 0; j < iports.length; j++) {
                    data.iports[j] = new IPort().load(iports[j]);
                }var oports = getChildrenByTagName(getChildNode(icNode, "oports"), "oport");
                for (var j = 0; j < oports.length; j++) {
                    data.oports[j] = new OPort().load(oports[j]);
                }ics.push(data);
            }
            return ics;
        }
    };
}();

// UTILS
function getChildNode(parent, name) {
    for (var i = 0; i < parent.childNodes.length; i++) {
        if (parent.childNodes[i].nodeName === name) return parent.childNodes[i];
    }
    return undefined;
}
function getChildrenByTagName(parent, name) {
    var children = [];
    for (var i = 0; i < parent.childNodes.length; i++) {
        if (parent.childNodes[i].nodeName === name) children.push(parent.childNodes[i]);
    }
    return children;
}
function getBooleanValue(node, def) {
    if (node == undefined) return def;
    return node.childNodes[0].nodeValue === "true" ? true : false;
}
function getIntValue(node, def) {
    if (node == undefined) return def;
    return parseInt(node.childNodes[0].nodeValue);
}
function getFloatValue(node, def) {
    if (node == undefined) return def;
    return parseFloat(node.childNodes[0].nodeValue);
}
function getStringValue(node, def) {
    if (node == undefined) return def;
    return node.childNodes[0].nodeValue;
}

var Input = function () {
    var rawMousePos = new Vector(0, 0);
    var mousePos = new Vector(0, 0);
    var prevMousePos = new Vector(0, 0);
    var worldMousePos = new Vector(0, 0);

    var mouseDown = false;
    var mouseDownPos = undefined;

    var mouseListeners = [];

    var z = 0;

    var shiftKeyDown = false;
    var modifierKeyDown = false;
    var optionKeyDown = false;

    var isDragging = false;
    var startTapTime = undefined;

    console.log(shiftKeyDown);

    var onKeyDown = function onKeyDown(e) {
        var code = e.keyCode;

        console.log(shiftKeyDown);

        switch (code) {
            case SHIFT_KEY:
                shiftKeyDown = true;
                break;
            case CONTROL_KEY:
            case COMMAND_KEY:
                modifierKeyDown = true;
                break;
            case OPTION_KEY:
                optionKeyDown = true;
                getCurrentContext().setCursor("pointer");
                break;
            case ENTER_KEY:
                if (document.activeElement !== document.body) document.activeElement.blur();
                break;
        }

        var objects = getCurrentContext().getObjects();
        for (var i = 0; i < objects.length; i++) {
            if (objects[i] instanceof Keyboard) objects[i].onKeyDown(code);
        }

        getCurrentContext().getHistoryManager().onKeyDown(code);
        if (CurrentTool.onKeyDown(code)) render();
    };
    var onKeyUp = function onKeyUp(e) {
        var code = e.keyCode;

        switch (code) {
            case SHIFT_KEY:
                shiftKeyDown = false;
                break;
            case CONTROL_KEY:
            case COMMAND_KEY:
                modifierKeyDown = false;
                break;
            case OPTION_KEY:
                optionKeyDown = false;
                getCurrentContext().setCursor("default");
                break;
        }

        var objects = getCurrentContext().getObjects();
        for (var i = 0; i < objects.length; i++) {
            if (objects[i] instanceof Keyboard) objects[i].onKeyUp(code);
        }

        if (CurrentTool.onKeyUp(code)) render();
    };
    var onDoubleClick = function onDoubleClick(e) {};
    var onWheel = function onWheel(e) {
        var camera = getCurrentContext().getCamera();
        var delta = -e.deltaY / 120.0;

        var factor = 0.95;
        if (delta < 0) factor = 1 / factor;

        var worldMousePos = camera.getWorldPos(mousePos);
        camera.zoomBy(factor);
        var newMousePos = camera.getScreenPos(worldMousePos);
        var dx = (mousePos.x - newMousePos.x) * camera.zoom;
        var dy = (mousePos.y - newMousePos.y) * camera.zoom;

        camera.translate(-dx, -dy);

        popup.onWheel();

        render();
    };
    var onMouseDown = function onMouseDown(e) {
        var canvas = getCurrentContext().getRenderer().canvas;
        var rect = canvas.getBoundingClientRect();
        isDragging = false;
        startTapTime = Date.now();
        mouseDown = true;
        mouseDownPos = new Vector(e.clientX - rect.left, e.clientY - rect.top);

        if (e.button === LEFT_MOUSE_BUTTON) {
            var shouldRender = false;
            contextmenu.hide();
            shouldRender = CurrentTool.onMouseDown(shouldRender);
            for (var i = 0; i < mouseListeners.length; i++) {
                var listener = mouseListeners[i];
                if (!listener.disabled && listener.onMouseDown(shouldRender)) shouldRender = true;
            }
            if (shouldRender) render();
        }
    };
    var onMouseMove = function onMouseMove(e) {
        var canvas = getCurrentContext().getRenderer().canvas;
        var camera = getCurrentContext().getCamera();
        var rect = canvas.getBoundingClientRect();

        prevMousePos.x = mousePos.x;
        prevMousePos.y = mousePos.y;

        rawMousePos = new Vector(e.clientX, e.clientY);
        mousePos = new Vector(e.clientX - rect.left, e.clientY - rect.top);
        worldMousePos = camera.getWorldPos(mousePos);

        isDragging = mouseDown && Date.now() - startTapTime > 50;

        var shouldRender = false;

        if (optionKeyDown && isDragging) {
            var pos = new Vector(mousePos.x, mousePos.y);
            var dPos = mouseDownPos.sub(pos);
            camera.translate(camera.zoom * dPos.x, camera.zoom * dPos.y);
            mouseDownPos = mousePos;

            popup.onMove();
            shouldRender = true;
        }

        shouldRender = CurrentTool.onMouseMove(shouldRender) || shouldRender;
        for (var i = 0; i < mouseListeners.length; i++) {
            var listener = mouseListeners[i];
            if (!listener.disabled && listener.onMouseMove(shouldRender)) shouldRender = true;
        }
        if (shouldRender) render();
    };
    var onMouseUp = function onMouseUp(e) {
        mouseDown = false;

        var shouldRender = false;
        shouldRender = CurrentTool.onMouseUp(shouldRender);
        for (var i = 0; i < mouseListeners.length; i++) {
            var listener = mouseListeners[i];
            if (!listener.disabled && listener.onMouseUp(shouldRender)) shouldRender = true;
        }
        if (shouldRender) render();
    };
    var onClick = function onClick(e) {
        var shouldRender = false;
        shouldRender = CurrentTool.onClick(shouldRender);
        for (var i = 0; i < mouseListeners.length; i++) {
            var listener = mouseListeners[i];
            if (!listener.disabled && listener.onClick(shouldRender)) shouldRender = true;
        }
        if (shouldRender) render();
    };

    window.addEventListener('keydown', function (e) {
        onKeyDown(e);
    }, false);
    window.addEventListener('keyup', function (e) {
        onKeyUp(e);
    }, false);

    return {
        registerContext: function registerContext(ctx) {
            var canvas = ctx.getRenderer().canvas;
            canvas.addEventListener('click', function (e) {
                return onClick(e);
            }, false);
            canvas.addEventListener('dblclick', function (e) {
                return onDoubleClick(e);
            }, false);
            // if (browser.name !== "Firefox")
            canvas.addEventListener('wheel', function (e) {
                return onWheel(e);
            }, false);
            // else
            //     canvas.addEventListener('DOMMouseScroll', e => onWheel(e), false);
            canvas.addEventListener('mousedown', function (e) {
                return onMouseDown(e);
            }, false);
            canvas.addEventListener('mouseup', function (e) {
                return onMouseUp(e);
            }, false);
            canvas.addEventListener('mousemove', function (e) {
                return onMouseMove(e);
            }, false);
            canvas.addEventListener('mouseenter', function (e) {
                if (PlaceItemController.drag) {
                    onMouseMove(e);onClick(e);PlaceItemController.drag = false;
                }
            }, false);
            canvas.addEventListener("mouseleave", function (e) {
                if (mouseDown) {
                    onMouseUp(e);onClick(e);
                }
            });

            canvas.addEventListener("contextmenu", function (e) {
                contextmenu.show(e);
                e.preventDefault();
            });
        },
        addMouseListener: function addMouseListener(l) {
            mouseListeners.push(l);
        },
        getWorldMousePos: function getWorldMousePos() {
            return V(worldMousePos);
        },
        getRawMousePos: function getRawMousePos() {
            return V(rawMousePos);
        },
        getShiftKeyDown: function getShiftKeyDown() {
            return shiftKeyDown;
        },
        getModifierKeyDown: function getModifierKeyDown() {
            return modifierKeyDown;
        },
        getOptionKeyDown: function getOptionKeyDown() {
            return optionKeyDown;
        },
        getIsDragging: function getIsDragging() {
            return isDragging;
        }
    };
}();
var ItemNavController = function () {
    var tab = document.getElementById("open-items-tab");
    var container = document.getElementById("items");

    var open = function open() {
        container.style.width = ITEMNAV_WIDTH + "px";
        tab.style.marginLeft = ItemNavController.getTabOffset() + "px";
        tab.style.borderColor = "rgba(153, 153, 153, 0.0)";
        tab.style.backgroundColor = "rgba(200, 200, 200, 0.0)";
        tab.style.fontSize = "2.5em";
        tab.innerHTML = "&times;";
    };
    var close = function close() {
        container.style.width = "0px";
        tab.style.marginLeft = ItemNavController.getTabOffset() + "px";
        tab.style.borderColor = "rgba(153, 153, 153, 0.7)";
        tab.style.backgroundColor = "rgba(200, 200, 200, 0.7)";
        tab.style.fontSize = "2em";
        tab.innerHTML = "&#9776;";
    };

    return {
        disabled: false,
        isOpen: false,
        toggle: function toggle() {
            if (this.isOpen) {
                this.isOpen = false;
                close();
            } else {
                this.isOpen = true;
                open();
            }

            // if (popup)
            //     popup.onMove();
        },
        getTabOffset: function getTabOffset() {
            return this.isOpen ? ITEMNAV_WIDTH - tab.offsetWidth : 0;
        }
    };
}();
// ItemNavController.toggle();

var PlaceItemController = function () {
    return {
        disabled: false,
        drag: false,
        place: function place(item, not) {
            if (not) item.not = not;
            var canvas = getCurrentContext().getRenderer().canvas;
            var rect = canvas.getBoundingClientRect();
            itemTool.activate(item, getCurrentContext());
        },
        onDragEnd: function onDragEnd(event) {
            this.drag = true;
            event.srcElement.parentElement.onclick();
        }
    };
}();

var SelectionBox = function () {
    var pos1 = undefined; // First corner
    var pos2 = undefined; // Second corner

    var getSelections = function getSelections() {
        var objects = getCurrentContext().getObjects();
        var selections = [];
        if (pos1 != undefined) {
            var trans = new Transform(V((pos1.x + pos2.x) / 2, (pos1.y + pos2.y) / 2), V(Math.abs(pos2.x - pos1.x), Math.abs(pos2.y - pos1.y)), 0, getCurrentContext().getCamera());
            for (var i = 0; i < objects.length; i++) {
                var obj = objects[i];
                var t = obj.selectionBoxTransform != undefined ? obj.selectionBoxTransform : obj.transform;
                if (transformContains(t, trans)) {
                    selections.push(obj);
                } else if (obj.inputs != undefined && obj.outputs != undefined) {
                    // Check if an iport or oport is selected
                    for (var j = 0; j < obj.inputs.length; j++) {
                        var input = obj.inputs[j];
                        if (rectContains(trans, input.getPos())) selections.push(input);
                    }
                    for (var j = 0; j < obj.outputs.length; j++) {
                        var output = obj.outputs[j];
                        if (rectContains(trans, output.getPos())) selections.push(output);
                    }
                }
            }
        }
        return selections;
    };

    return {
        disabled: false,
        onMouseDown: function onMouseDown(somethingHappened) {
            var objects = getCurrentContext().getObjects();
            var wires = getCurrentContext().getWires();
            var worldMousePos = Input.getWorldMousePos();

            // Make sure nothing but blank canvas was clicked
            if (somethingHappened || !selectionTool.isActive || Input.getOptionKeyDown()) return;
            for (var i = 0; i < objects.length; i++) {
                var obj = objects[i];
                if (obj.contains(worldMousePos) || obj.sContains(worldMousePos) || obj.oPortContains(worldMousePos) !== -1 || obj.iPortContains(worldMousePos) !== -1) return;
            }
            for (var i = 0; i < wires.length; i++) {
                var wire = wires[i];
                if (wire.getNearestT(worldMousePos.x, worldMousePos.y) !== -1) return;
            }

            pos1 = V(worldMousePos);
            popup.hide();
        },
        onMouseMove: function onMouseMove() {
            var objects = getCurrentContext().getObjects();
            var worldMousePos = Input.getWorldMousePos();

            if (pos1 != undefined) {
                pos2 = V(worldMousePos);
                popup.hide();
                return true;
            }
        },
        onMouseUp: function onMouseUp() {},
        onClick: function onClick(somethingHappened) {
            var objects = getCurrentContext().getObjects();
            var worldMousePos = Input.getWorldMousePos();

            // Stop selection box
            if (pos1 != undefined) {
                pos2 = V(worldMousePos);
                var selections = getSelections();
                if (!Input.getShiftKeyDown()) selectionTool.deselectAll(true);
                selectionTool.select(selections, true);
                pos1 = undefined;
                pos2 = undefined;
                return true;
            }
        },
        draw: function draw(renderer) {
            var camera = renderer.getCamera();
            if (pos1 != undefined && pos2 != undefined) {
                var p1 = camera.getScreenPos(pos1);
                var p2 = camera.getScreenPos(pos2);
                var w = p2.x - p1.x,
                    h = p2.y - p1.y;
                renderer.save();
                renderer.context.globalAlpha = 0.4;
                renderer.rect(p1.x + w / 2, p1.y + h / 2, w, h, '#ffffff', '#6666ff', 2 / camera.zoom);
                renderer.restore();
            }
        }
    };
}();

var SideNavController = function () {
    var tab = document.getElementById("open-sive-nav-button");
    var tab2 = document.getElementById("open-items-tab");
    var container = document.getElementById("sidenav");
    var otherContent = document.getElementById("content");
    var overlay = document.getElementById("overlay");
    if (overlay) {
        overlay.addEventListener("transitionend", function (event) {
            if (!SideNavController.isOpen) overlay.style.visibility = "hidden";
        }, false);
    }

    var open = function open() {
        container.style.width = SIDENAV_WIDTH + "px";
        otherContent.style.marginLeft = SIDENAV_WIDTH + "px";
        overlay.style.visibility = "visible";
        overlay.style.opacity = "1";
        overlay.onclick = function () {
            SideNavController.toggle();
        };
    };
    var close = function close() {
        container.style.width = "0px";
        otherContent.style.marginLeft = "0px";
        overlay.style.opacity = "0";
        overlay.onclick = function () {};
    };

    return {
        disabled: false,
        isOpen: false,
        toggle: function toggle() {
            if (this.isOpen) {
                this.isOpen = false;
                close();
            } else {
                this.isOpen = true;
                open();
            }
        },
        getWidth: function getWidth() {
            return this.isOpen ? SIDENAV_WIDTH : 0;
        }
    };
}();
// SideNavController.toggle();

var Tool = function () {
    function Tool() {
        _classCallCheck(this, Tool);

        this.isActive = false;
    }

    _createClass(Tool, [{
        key: 'activate',
        value: function activate() {
            if (CurrentTool) CurrentTool.deactivate();

            CurrentTool = this;
            this.isActive = true;
            render();
        }
    }, {
        key: 'deactivate',
        value: function deactivate() {
            this.isActive = false;
        }
    }, {
        key: 'onKeyDown',
        value: function onKeyDown(code) {}
    }, {
        key: 'onKeyUp',
        value: function onKeyUp(code) {}
    }, {
        key: 'onMouseDown',
        value: function onMouseDown() {}
    }, {
        key: 'onMouseMove',
        value: function onMouseMove() {}
    }, {
        key: 'onMouseUp',
        value: function onMouseUp() {}
    }, {
        key: 'onClick',
        value: function onClick() {}
    }, {
        key: 'draw',
        value: function draw() {}
    }]);

    return Tool;
}();

var CurrentTool;
var TransformController = function () {
    var pressedObj = undefined;

    var isDragging = false;
    var isRotating = false;

    var dragPos = V(0, 0);
    var dragObjects = [];

    var startAngle = 0;
    var prevAngle = 0;
    var realAngles = [];
    var rotateObjects = [];

    var startTransforms = []; // For undoing

    var drag = function drag(pos, shift) {
        var dPos = V(pos).sub(pressedObj.getPos()).sub(dragPos);
        for (var i = 0; i < dragObjects.length; i++) {
            var obj = dragObjects[i];
            var newPos = obj.getPos().add(dPos);
            if (shift) {
                newPos = V(Math.floor(newPos.x / GRID_SIZE + 0.5) * GRID_SIZE, Math.floor(newPos.y / GRID_SIZE + 0.5) * GRID_SIZE);
            }
            obj.setPos(newPos);
        }
        selectionTool.recalculateMidpoint();
    };
    var rotate = function rotate(pos, shift) {
        var origin = selectionTool.midpoint;
        var dAngle = Math.atan2(pos.y - origin.y, pos.x - origin.x) - prevAngle;
        for (var i = 0; i < rotateObjects.length; i++) {
            var newAngle = realAngles[i] + dAngle;
            realAngles[i] = newAngle;
            if (shift) newAngle = Math.floor(newAngle / (Math.PI / 4)) * Math.PI / 4;
            rotateObjects[i].setRotationAbout(newAngle, origin);
        }
        prevAngle = dAngle + prevAngle;
    };

    return {
        disabled: false,
        startDrag: function startDrag(obj, worldMousePos) {
            if (!obj.selected) {
                selectionTool.deselectAll(true);
                selectionTool.select([obj], true);
            }
            dragObjects = selectionTool.selections;

            startTransforms = [];
            for (var i = 0; i < dragObjects.length; i++) {
                if (!dragObjects[i].transform) return true;
                startTransforms[i] = dragObjects[i].transform.copy();
            }
            isDragging = true;
            dragPos = worldMousePos.copy().sub(obj.getPos());
            pressedObj = obj;
            popup.hide();
            return true;
        },
        startRotation: function startRotation(objs, pos) {
            rotateObjects = objs;
            realAngles = [];
            startTransforms = [];
            for (var i = 0; i < rotateObjects.length; i++) {
                if (!rotateObjects[i].transform) return true;
                realAngles[i] = rotateObjects[i].getAngle();
                startTransforms[i] = rotateObjects[i].transform.copy();
            }
            isRotating = true;
            startAngle = Math.atan2(pos.y - selectionTool.midpoint.y, pos.x - selectionTool.midpoint.x);
            prevAngle = startAngle;
            popup.hide();
            return true;
        },

        onMouseDown: function onMouseDown() {
            var objects = getCurrentContext().getObjects();
            var worldMousePos = Input.getWorldMousePos();

            // Check if rotation circle was pressed
            if (!isRotating && selectionTool.selections.length > 0) {
                var d = worldMousePos.sub(selectionTool.midpoint).len2();
                if (d <= ROTATION_CIRCLE_R2 && d >= ROTATION_CIRCLE_R1) {
                    return this.startRotation(selectionTool.selections, worldMousePos);
                }
            }

            // Go through objects backwards since objects on top are in the back
            for (var i = objects.length - 1; i >= 0; i--) {
                var obj = objects[i];

                // Check if object's selection box was pressed
                if (obj.contains(worldMousePos) || obj.sContains(worldMousePos)) {
                    pressedObj = obj;
                    return;
                }
            }
        },
        onMouseMove: function onMouseMove() {
            var objects = getCurrentContext().getObjects();
            var worldMousePos = Input.getWorldMousePos();

            // Begin dragging
            if (!isDragging && pressedObj != undefined) {
                return this.startDrag(pressedObj, worldMousePos);
            }

            // Actually move the object(s)
            if (isDragging) {
                drag(worldMousePos, Input.getShiftKeyDown());
                return true;
            }
            if (isRotating) {
                rotate(worldMousePos, Input.getShiftKeyDown());
                return true;
            }
        },
        onMouseUp: function onMouseUp() {
            pressedObj = undefined;

            // Stop dragging
            if (isDragging) {
                // Add transform action
                getCurrentContext().addAction(createTransformAction(dragObjects, startTransforms));
                isDragging = false;
                return true;
            }

            // Stop rotating
            if (isRotating) {
                // Add transform action
                getCurrentContext().addAction(createTransformAction(rotateObjects, startTransforms));
                isRotating = false;
                return true;
            }
        },
        onClick: function onClick() {},
        draw: function draw(renderer) {
            // Draw rotation circle
            var camera = renderer.getCamera();
            var pos = camera.getScreenPos(selectionTool.midpoint);
            var r = ROTATION_CIRCLE_RADIUS / camera.zoom;
            if (isRotating) {
                renderer.save();
                renderer.context.fillStyle = '#fff';
                renderer.context.strokeStyle = '#000';
                renderer.context.lineWidth = 5;
                renderer.context.globalAlpha = 0.4;
                renderer.context.beginPath();
                renderer.context.moveTo(pos.x, pos.y);
                var da = (prevAngle - startAngle) % (2 * Math.PI);
                if (da < 0) da += 2 * Math.PI;
                renderer.context.arc(pos.x, pos.y, r, startAngle, prevAngle, da > Math.PI);
                renderer.context.fill();
                renderer.context.closePath();
                renderer.restore();
            }
        }
    };
}();

var WireController = function () {
    var pressedPort = undefined;

    var pressedWire = undefined;
    var wireSplitPoint = -1;

    return {
        disabled: false,
        onMouseDown: function onMouseDown(somethingHappened) {
            var objects = getCurrentContext().getObjects();
            var wires = getCurrentContext().getWires();
            var worldMousePos = Input.getWorldMousePos();

            // Make sure nothing else has happened
            if (somethingHappened) return;

            // Check if a IOPort was clicked to start creating new wire
            for (var i = objects.length - 1; i >= 0; i--) {
                var obj = objects[i];

                // Check if port was clicked, then activate wire tool
                var ii;
                if ((ii = obj.oPortContains(worldMousePos)) !== -1) {
                    pressedPort = obj.outputs[ii];
                    return;
                }
                if ((ii = obj.iPortContains(worldMousePos)) !== -1) {
                    pressedPort = obj.inputs[ii];
                    return;
                }
            }

            // Check if a wire was pressed
            for (var i = 0; i < wires.length; i++) {
                var wire = wires[i];
                var t;
                if ((t = wire.getNearestT(worldMousePos.x, worldMousePos.y)) !== -1) {
                    pressedWire = wire;
                    wireSplitPoint = t;
                    return true;
                }
            }
        },
        onMouseMove: function onMouseMove(somethingHappened) {
            var worldMousePos = Input.getWorldMousePos();

            // Make sure nothing else has happened
            if (somethingHappened) return;

            // Begin dragging new wire
            if (pressedPort != undefined) {
                wiringTool.activate(pressedPort, getCurrentContext());
                pressedPort = undefined;
                return true;
            }

            // Begin splitting wire
            if (pressedWire != undefined) {
                pressedWire.split(wireSplitPoint);
                var action = new SplitWireAction(pressedWire);
                getCurrentContext().addAction(action);
                selectionTool.deselectAll(true);
                selectionTool.select([pressedWire.connection], true);
                TransformController.startDrag(pressedWire.connection, worldMousePos);
                pressedWire = undefined;
                return true;
            }
        },
        onMouseUp: function onMouseUp() {},
        onClick: function onClick(somethingHappened) {
            // Make sure nothing else has happened
            if (somethingHappened) {
                pressedPort = undefined;
                pressedWire = undefined;
                return;
            }

            // Clicking also begins dragging
            if (pressedPort != undefined) {
                wiringTool.activate(pressedPort, getCurrentContext());
                pressedPort = undefined;
                return true;
            }

            // Select wire
            if (pressedWire != undefined) {
                if (!Input.getShiftKeyDown()) selectionTool.deselectAll(true);
                selectionTool.select([pressedWire], true);
                pressedWire = undefined;
                return true;
            }
        }
    };
}();

var ContextMenu = function (_Popup) {
    _inherits(ContextMenu, _Popup);

    function ContextMenu() {
        _classCallCheck(this, ContextMenu);

        var _this12 = _possibleConstructorReturn(this, (ContextMenu.__proto__ || Object.getPrototypeOf(ContextMenu)).call(this, "context-menu"));

        _this12.add(new CutModule(_this12, "context-menu-cut"));
        _this12.add(new CopyModule(_this12, "context-menu-copy"));
        _this12.add(new PasteModule(_this12, "context-menu-paste"));
        _this12.add(new SelectAllModule(_this12, "context-menu-select-all"));

        _this12.add(new UndoModule(_this12, "context-menu-undo"));
        _this12.add(new RedoModule(_this12, "context-menu-redo"));
        return _this12;
    }

    _createClass(ContextMenu, [{
        key: 'onKeyDown',
        value: function onKeyDown(code) {
            if (code === ESC_KEY && !this.hidden) {
                this.hide();
                return;
            }
        }
    }, {
        key: 'onShow',
        value: function onShow() {
            _get(ContextMenu.prototype.__proto__ || Object.getPrototypeOf(ContextMenu.prototype), 'onShow', this).call(this);

            var pos = Input.getRawMousePos();
            this.setPos(V(pos.x, pos.y));
        }
    }]);

    return ContextMenu;
}(Popup);

var CopyModule = function (_Module) {
    _inherits(CopyModule, _Module);

    function CopyModule(parent, divName) {
        _classCallCheck(this, CopyModule);

        return _possibleConstructorReturn(this, (CopyModule.__proto__ || Object.getPrototypeOf(CopyModule)).call(this, parent, divName));
    }

    _createClass(CopyModule, [{
        key: 'onShow',
        value: function onShow() {
            this.setDisabled(selectionTool.selections.length == 0);
        }
    }, {
        key: 'onClick',
        value: function onClick() {
            this.parent.hide();
            document.execCommand("copy");
        }
    }]);

    return CopyModule;
}(Module);

var CutModule = function (_Module2) {
    _inherits(CutModule, _Module2);

    function CutModule(parent, divName) {
        _classCallCheck(this, CutModule);

        return _possibleConstructorReturn(this, (CutModule.__proto__ || Object.getPrototypeOf(CutModule)).call(this, parent, divName));
    }

    _createClass(CutModule, [{
        key: 'onShow',
        value: function onShow() {
            this.setDisabled(selectionTool.selections.length == 0);
        }
    }, {
        key: 'onClick',
        value: function onClick() {
            this.parent.hide();
            document.execCommand("cut");
        }
    }]);

    return CutModule;
}(Module);

var PasteModule = function (_Module3) {
    _inherits(PasteModule, _Module3);

    function PasteModule(parent, divName) {
        _classCallCheck(this, PasteModule);

        return _possibleConstructorReturn(this, (PasteModule.__proto__ || Object.getPrototypeOf(PasteModule)).call(this, parent, divName));
    }

    _createClass(PasteModule, [{
        key: 'onShow',
        value: function onShow() {
            this.setDisabled(false);
        }
    }, {
        key: 'onClick',
        value: function onClick() {
            this.parent.hide();
            document.execCommand("copy");
        }
    }]);

    return PasteModule;
}(Module);

var RedoModule = function (_Module4) {
    _inherits(RedoModule, _Module4);

    function RedoModule(parent, divName) {
        _classCallCheck(this, RedoModule);

        return _possibleConstructorReturn(this, (RedoModule.__proto__ || Object.getPrototypeOf(RedoModule)).call(this, parent, divName));
    }

    _createClass(RedoModule, [{
        key: 'onShow',
        value: function onShow() {
            this.setDisabled(getCurrentContext().designer.history.redoStack.length == 0);
        }
    }, {
        key: 'onClick',
        value: function onClick() {
            this.parent.hide();
            getCurrentContext().designer.history.redo();
        }
    }]);

    return RedoModule;
}(Module);

var SelectAllModule = function (_Module5) {
    _inherits(SelectAllModule, _Module5);

    function SelectAllModule(parent, divName) {
        _classCallCheck(this, SelectAllModule);

        return _possibleConstructorReturn(this, (SelectAllModule.__proto__ || Object.getPrototypeOf(SelectAllModule)).call(this, parent, divName));
    }

    _createClass(SelectAllModule, [{
        key: 'onShow',
        value: function onShow() {
            this.setDisabled(false);
        }
    }, {
        key: 'onClick',
        value: function onClick() {
            this.parent.hide();
            selectionTool.selectAll();
            render();
        }
    }]);

    return SelectAllModule;
}(Module);

var UndoModule = function (_Module6) {
    _inherits(UndoModule, _Module6);

    function UndoModule(parent, divName) {
        _classCallCheck(this, UndoModule);

        return _possibleConstructorReturn(this, (UndoModule.__proto__ || Object.getPrototypeOf(UndoModule)).call(this, parent, divName));
    }

    _createClass(UndoModule, [{
        key: 'onShow',
        value: function onShow() {
            this.setDisabled(getCurrentContext().designer.history.undoStack.length == 0);
        }
    }, {
        key: 'onClick',
        value: function onClick() {
            this.parent.hide();
            getCurrentContext().designer.history.undo();
        }
    }]);

    return UndoModule;
}(Module);

var BusButtonModule = function (_Module7) {
    _inherits(BusButtonModule, _Module7);

    function BusButtonModule(parent, divName) {
        _classCallCheck(this, BusButtonModule);

        return _possibleConstructorReturn(this, (BusButtonModule.__proto__ || Object.getPrototypeOf(BusButtonModule)).call(this, parent, divName));
    }

    _createClass(BusButtonModule, [{
        key: 'onShow',
        value: function onShow() {
            var iports = 0,
                oports = 0;
            var selections = selectionTool.selections;
            for (var i = 0; i < selections.length; i++) {
                if (selections[i] instanceof IPort) {
                    iports++;
                } else if (selections[i] instanceof OPort) {
                    oports++;
                } else {
                    this.setVisibility("none");
                    return;
                }
            }
            this.setVisibility(iports === oports ? "inherit" : "none");
        }
    }, {
        key: 'onClick',
        value: function onClick() {
            this.createBus();
        }
    }, {
        key: 'createBus',
        value: function createBus() {
            var selections = selectionTool.selections;

            var iports = [],
                oports = [];
            for (var i = 0; i < selections.length; i++) {
                if (selections[i] instanceof IPort) iports.push(selections[i]);else oports.push(selections[i]);
            }

            while (oports.length > 0) {
                var maxDist = -Infinity,
                    maxDistIndex = -1,
                    maxMinDistIndex = -1;
                for (var i = 0; i < oports.length; i++) {
                    var oport = oports[i];
                    var opos = oport.getPos();
                    var minDist = Infinity,
                        minDistIndex = -1;
                    for (var j = 0; j < iports.length; j++) {
                        var iport = iports[j];
                        var dist = opos.sub(iport.getPos()).len2();
                        if (dist < minDist) {
                            minDist = dist;
                            minDistIndex = j;
                        }
                    }
                    if (minDist > maxDist) {
                        maxDist = minDist;
                        maxDistIndex = i;
                        maxMinDistIndex = minDistIndex;
                    }
                }
                var wire = new Wire(context);
                getCurrentContext().add(wire);
                oports[maxDistIndex].connect(wire);
                wire.connect(iports[maxMinDistIndex]);
                wire.set = true;
                wire.straight = true;
                oports.splice(maxDistIndex, 1);
                iports.splice(maxMinDistIndex, 1);
            }
            render();
        }
    }]);

    return BusButtonModule;
}(Module);

var ColorPickerModule = function (_Module8) {
    _inherits(ColorPickerModule, _Module8);

    function ColorPickerModule(parent, divName, divTextName) {
        _classCallCheck(this, ColorPickerModule);

        return _possibleConstructorReturn(this, (ColorPickerModule.__proto__ || Object.getPrototypeOf(ColorPickerModule)).call(this, parent, divName, divTextName));
    }

    _createClass(ColorPickerModule, [{
        key: 'onShow',
        value: function onShow() {
            var allLEDs = true,
                allSame = true;
            var selections = selectionTool.selections;
            for (var i = 0; i < selections.length; i++) {
                allLEDs = allLEDs && selections[i] instanceof LED;
                if (allLEDs) allSame = allSame && selections[i].color === selections[0].color;
            }
            this.setVisibility(allLEDs ? "inherit" : "none");
            this.setValue(allLEDs && allSame ? selections[0].color : '#ffffff');
        }
    }, {
        key: 'onChange',
        value: function onChange() {
            var selections = selectionTool.selections;
            for (var i = 0; i < selections.length; i++) {
                selections[i].color = this.getValue();
            }
        }
    }, {
        key: 'onFocus',
        value: function onFocus() {
            this.parent.focused = true;
        }
    }, {
        key: 'onBlur',
        value: function onBlur() {
            this.parent.focused = false;
            this.onChange();
        }
    }]);

    return ColorPickerModule;
}(Module);

var ICButtonModule = function (_Module9) {
    _inherits(ICButtonModule, _Module9);

    function ICButtonModule(parent, divName) {
        _classCallCheck(this, ICButtonModule);

        return _possibleConstructorReturn(this, (ICButtonModule.__proto__ || Object.getPrototypeOf(ICButtonModule)).call(this, parent, divName));
    }

    _createClass(ICButtonModule, [{
        key: 'onShow',
        value: function onShow() {
            var count = 0;
            var selections = selectionTool.selections;
            for (var i = 0; i < selections.length; i++) {
                if (selections[i] instanceof IOObject && !(selections[i] instanceof WirePort)) count++;
            }
            this.setVisibility(count >= 2 ? "inherit" : "none");
        }
    }, {
        key: 'onClick',
        value: function onClick() {
            icdesigner.show(selectionTool.selections);
        }
    }]);

    return ICButtonModule;
}(Module);

var InputCountModule = function (_Module10) {
    _inherits(InputCountModule, _Module10);

    function InputCountModule(parent, divName, divTextName) {
        _classCallCheck(this, InputCountModule);

        return _possibleConstructorReturn(this, (InputCountModule.__proto__ || Object.getPrototypeOf(InputCountModule)).call(this, parent, divName, divTextName));
    }

    _createClass(InputCountModule, [{
        key: 'onShow',
        value: function onShow() {
            var allSame = true,
                display = true;
            var maxMinValue = 0;
            var minMaxValue = 999;
            var selections = selectionTool.selections;
            for (var i = 0; i < selections.length; i++) {
                display = display && selections[i].maxInputs > 1 && selections[i].noChange !== true;
                allSame = allSame && selections[i].getInputAmount() === selections[0].getInputAmount();
                maxMinValue = Math.max(selections[i].getMinInputFieldCount(), maxMinValue);
                minMaxValue = Math.min(selections[i].getMaxInputFieldCount(), minMaxValue);
            }
            this.setValue(allSame ? selections[0].getInputAmount() : "");
            this.setPlaceholder(allSame ? "" : "-");
            this.setVisibility(display ? "inherit" : "none");
            this.div.min = maxMinValue;
            this.div.max = minMaxValue;
        }
    }, {
        key: 'onChange',
        value: function onChange() {
            var selections = selectionTool.selections;
            for (var i = 0; i < selections.length; i++) {
                selections[i].setInputAmount(Number(this.getValue()));
            }
        }
    }]);

    return InputCountModule;
}(Module);

var PositionXModule = function (_Module11) {
    _inherits(PositionXModule, _Module11);

    function PositionXModule(parent, divName) {
        _classCallCheck(this, PositionXModule);

        return _possibleConstructorReturn(this, (PositionXModule.__proto__ || Object.getPrototypeOf(PositionXModule)).call(this, parent, divName));
    }

    _createClass(PositionXModule, [{
        key: 'onShow',
        value: function onShow() {
            var allSame = true;
            var selections = selectionTool.selections;
            for (var i = 0; i < selections.length; i++) {
                allSame = allSame && selections[i].getPos().x === selections[0].getPos().x;
            }this.setValue(allSame ? +(selections[0].getPos().x / GRID_SIZE - 0.5).toFixed(3) : "");
            this.setPlaceholder(allSame ? "" : "-");
        }
    }, {
        key: 'onChange',
        value: function onChange() {
            var action = new GroupAction();
            var selections = selectionTool.selections;
            for (var i = 0; i < selections.length; i++) {
                if (!selections[i].transform) {
                    this.onShow(); // Update value before exiting
                    return;
                }
                var origin = selections[i].transform.copy();
                selections[i].setPos(V(GRID_SIZE * (Number(this.getValue()) + 0.5), selections[i].transform.getPos().y));
                var target = selections[i].transform.copy();
                action.add(new TransformAction(selections[i], origin, target));
            }
            getCurrentContext().addAction(action);
        }
    }]);

    return PositionXModule;
}(Module);

var PositionYModule = function (_Module12) {
    _inherits(PositionYModule, _Module12);

    function PositionYModule(parent, divName) {
        _classCallCheck(this, PositionYModule);

        return _possibleConstructorReturn(this, (PositionYModule.__proto__ || Object.getPrototypeOf(PositionYModule)).call(this, parent, divName));
    }

    _createClass(PositionYModule, [{
        key: 'onShow',
        value: function onShow() {
            var allSame = true;
            var selections = selectionTool.selections;
            for (var i = 0; i < selections.length; i++) {
                allSame = allSame && selections[i].getPos().y === selections[0].getPos().y;
            }this.setValue(allSame ? +(selections[0].getPos().y / GRID_SIZE - 0.5).toFixed(3) : "");
            this.setPlaceholder(allSame ? "" : "-");
        }
    }, {
        key: 'onChange',
        value: function onChange() {
            var action = new GroupAction();
            var selections = selectionTool.selections;
            for (var i = 0; i < selections.length; i++) {
                if (!selections[i].transform) {
                    this.onShow(); // Update value before exiting
                    return;
                }
                var origin = selections[i].transform.copy();
                selections[i].setPos(V(selections[i].transform.getPos().x, GRID_SIZE * (Number(this.getValue()) + 0.5)));
                var target = selections[i].transform.copy();
                action.add(new TransformAction(selections[i], origin, target));
            }
            getCurrentContext().addAction(action);
        }
    }]);

    return PositionYModule;
}(Module);

var SelectionPopup = function (_Popup2) {
    _inherits(SelectionPopup, _Popup2);

    function SelectionPopup() {
        _classCallCheck(this, SelectionPopup);

        var _this25 = _possibleConstructorReturn(this, (SelectionPopup.__proto__ || Object.getPrototypeOf(SelectionPopup)).call(this, "popup"));

        _this25.add(new TitleModule(_this25, "popup-name"));

        _this25.add(new PositionXModule(_this25, "popup-position-x"));
        _this25.add(new PositionYModule(_this25, "popup-position-y"));

        _this25.add(new InputCountModule(_this25, "popup-input-count", "popup-input-count-text"));

        _this25.add(new ColorPickerModule(_this25, "popup-color-picker", "popup-color-text"));

        _this25.add(new ICButtonModule(_this25, "popup-ic-button"));
        _this25.add(new BusButtonModule(_this25, "popup-bus-button"));
        return _this25;
    }

    _createClass(SelectionPopup, [{
        key: 'onKeyDown',
        value: function onKeyDown(code) {
            if (code === DELETE_KEY && !this.focused) {
                RemoveObjects(getCurrentContext(), selectionTool.selections, true);
                return;
            }
            if (code === ESC_KEY && !this.hidden) {
                selectionTool.deselectAll();
                render();
                return;
            }
        }
    }, {
        key: 'onEnter',
        value: function onEnter() {
            this.blur();
        }
    }, {
        key: 'update',
        value: function update() {
            var selections = selectionTool.selections;
            if (selections.length > 0) {
                this.show();
                this.onMove();
            } else {
                this.hide();
            }
        }
    }, {
        key: 'onMove',
        value: function onMove() {
            var camera = getCurrentContext().getCamera();
            if (selectionTool.selections.length > 0) {
                selectionTool.recalculateMidpoint();
                var pos = camera.getScreenPos(selectionTool.midpoint);
                pos.y -= this.div.clientHeight / 2;
                this.setPos(pos);
            }
        }
    }, {
        key: 'onWheel',
        value: function onWheel() {
            this.onMove();
        }
    }]);

    return SelectionPopup;
}(Popup);

var TitleModule = function (_Module13) {
    _inherits(TitleModule, _Module13);

    function TitleModule(parent, divName) {
        _classCallCheck(this, TitleModule);

        return _possibleConstructorReturn(this, (TitleModule.__proto__ || Object.getPrototypeOf(TitleModule)).call(this, parent, divName));
    }

    _createClass(TitleModule, [{
        key: 'onShow',
        value: function onShow() {
            var allSame = true;
            var selections = selectionTool.selections;
            for (var i = 0; i < selections.length; i++) {
                allSame = allSame && selections[i].getName() === selections[0].getName();
            }this.setValue(allSame ? selections[0].getName() : "<Multiple>");
        }
    }, {
        key: 'onChange',
        value: function onChange() {
            var selections = selectionTool.selections;
            for (var i = 0; i < selections.length; i++) {
                selections[i].setName(this.getValue());
            }
        }
    }, {
        key: 'onFocus',
        value: function onFocus() {
            this.parent.focused = true;
        }
    }, {
        key: 'onBlur',
        value: function onBlur() {
            this.parent.focused = false;
            this.onChange();
        }
    }]);

    return TitleModule;
}(Module);

var ItemTool = function (_Tool) {
    _inherits(ItemTool, _Tool);

    function ItemTool() {
        _classCallCheck(this, ItemTool);

        var _this27 = _possibleConstructorReturn(this, (ItemTool.__proto__ || Object.getPrototypeOf(ItemTool)).call(this));

        _this27.item = undefined;
        return _this27;
    }

    _createClass(ItemTool, [{
        key: 'activate',
        value: function activate(object, context) {
            // If already active, remove current item
            if (this.item != undefined) context.remove(this.item);

            _get(ItemTool.prototype.__proto__ || Object.getPrototypeOf(ItemTool.prototype), 'activate', this).call(this);
            this.item = object;
            context.addObject(this.item);
            this.onMouseMove();
        }
    }, {
        key: 'deactivate',
        value: function deactivate() {
            _get(ItemTool.prototype.__proto__ || Object.getPrototypeOf(ItemTool.prototype), 'deactivate', this).call(this);
            this.item = undefined;
        }
    }, {
        key: 'onMouseMove',
        value: function onMouseMove() {
            this.item.setPos(Input.getWorldMousePos());
            return true;
        }
    }, {
        key: 'onClick',
        value: function onClick() {
            this.item.setPos(Input.getWorldMousePos());
            var action = new PlaceAction(this.item);
            getCurrentContext().addAction(action);
            selectionTool.activate();
            return true;
        }
    }]);

    return ItemTool;
}(Tool);

var itemTool = new ItemTool();

var SelectionTool = function (_Tool2) {
    _inherits(SelectionTool, _Tool2);

    function SelectionTool() {
        _classCallCheck(this, SelectionTool);

        var _this28 = _possibleConstructorReturn(this, (SelectionTool.__proto__ || Object.getPrototypeOf(SelectionTool)).call(this));

        _this28.selections = [];
        _this28.midpoint = V(0, 0);
        return _this28;
    }

    _createClass(SelectionTool, [{
        key: 'onKeyDown',
        value: function onKeyDown(code, input) {
            console.log(code);
            if (!icdesigner.hidden) return false;

            if (code === A_KEY && Input.getModifierKeyDown()) {
                this.selectAll();
                return true;
            }
        }
    }, {
        key: 'onMouseDown',
        value: function onMouseDown() {
            var objects = getCurrentContext().getObjects();
            var wires = getCurrentContext().getWires();
            var worldMousePos = Input.getWorldMousePos();

            if (!icdesigner.hidden) return false;

            // Go through objects backwards since objects on top are in the back
            for (var i = objects.length - 1; i >= 0; i--) {
                var obj = objects[i];

                // Check if object was pressed
                if (obj.contains(worldMousePos)) {
                    if (obj.isPressable) obj.press();
                    return true;
                }

                // Ignore if object's selection box was pressed
                if (obj.sContains(worldMousePos)) return;

                // Ignore if a port was pressed
                if (obj.oPortContains(worldMousePos) !== -1 || obj.iPortContains(worldMousePos) !== -1) {
                    return;
                }
            }
        }
    }, {
        key: 'onMouseMove',
        value: function onMouseMove() {}
    }, {
        key: 'onMouseUp',
        value: function onMouseUp() {
            var objects = getCurrentContext().getObjects();
            var wires = getCurrentContext().getWires();
            var worldMousePos = Input.getWorldMousePos();

            if (!icdesigner.hidden) return false;

            popup.update();

            for (var i = 0; i < objects.length; i++) {
                var obj = objects[i];

                // Release pressed object
                if (obj.isPressable && obj.isOn && !Input.isDragging) {
                    obj.release();
                    return true;
                }
            }
        }
    }, {
        key: 'onClick',
        value: function onClick() {
            var objects = getCurrentContext().getObjects();
            var wires = getCurrentContext().getWires();
            var worldMousePos = Input.getWorldMousePos();

            if (!icdesigner.hidden || Input.getIsDragging()) return false;

            // Go through objects backwards since objects on top are in the back
            for (var i = objects.length - 1; i >= 0; i--) {
                var obj = objects[i];

                // Check if object's selection box was clicked
                if (obj.sContains(worldMousePos)) {
                    if (obj.selected) return false;

                    if (!Input.getShiftKeyDown() && this.selections.length > 0) {
                        this.deselectAll(true);

                        // Combine deselect and select actions
                        var deselectAction = getCurrentContext().designer.history.undoStack.pop();
                        this.select([obj], true);
                        var selectAction = getCurrentContext().designer.history.undoStack.pop();
                        var combined = new GroupAction();
                        if (deselectAction != undefined) combined.add(deselectAction);
                        combined.add(selectAction);
                        getCurrentContext().addAction(combined);
                    } else {
                        this.select([obj], true);
                    }

                    return true;
                }

                // Check if object was clicked
                if (obj.contains(worldMousePos)) {
                    obj.click();
                    return true;
                }
            }

            // Didn't click on anything so deselect everything
            // And add a deselect action
            if (!Input.getShiftKeyDown() && this.selections.length > 0) {
                this.deselectAll(true);
                return true;
            }
        }
    }, {
        key: 'select',
        value: function select(objects, doAction) {
            if (objects.length === 0) return;

            var action = new GroupAction();
            for (var i = 0; i < objects.length; i++) {
                var obj = objects[i];
                if (obj.selected) continue;
                obj.selected = true;
                this.selections.push(obj);
                this.sendToFront(obj);
                if (doAction) action.add(new SelectAction(obj));
            }
            if (doAction) getCurrentContext().addAction(action);
            popup.update();
            this.recalculateMidpoint();
        }
    }, {
        key: 'deselect',
        value: function deselect(objects, doAction) {
            if (objects.length === 0) return;

            var action = new GroupAction();
            for (var i = 0; i < objects.length; i++) {
                var obj = objects[i];
                if (!obj.selected) {
                    console.error("Can't deselect an unselected object! " + obj);
                    continue;
                }
                obj.selected = false;
                this.selections.splice(this.selections.indexOf(obj), 1);
                if (doAction) action.add(new SelectAction(obj, true));
            }
            if (doAction) getCurrentContext().addAction(action);
            popup.update();
            this.recalculateMidpoint();
        }
    }, {
        key: 'selectAll',
        value: function selectAll() {
            this.deselectAll(true);
            this.select(getCurrentContext().getObjects(), true);
        }
    }, {
        key: 'deselectAll',
        value: function deselectAll(doAction) {
            // Copy selections array because just passing selections
            // causes it to get mutated mid-loop at causes weirdness
            var objects = [];
            for (var i = 0; i < this.selections.length; i++) {
                objects.push(this.selections[i]);
            }this.deselect(objects, doAction);
        }
    }, {
        key: 'sendToFront',
        value: function sendToFront(obj) {
            if (obj instanceof IOObject || obj instanceof Wire) {
                getCurrentContext().remove(obj);
                getCurrentContext().add(obj);
            }
        }
    }, {
        key: 'recalculateMidpoint',
        value: function recalculateMidpoint() {
            this.midpoint = V(0, 0);
            for (var i = 0; i < this.selections.length; i++) {
                this.midpoint.translate(this.selections[i].getPos());
            }this.midpoint = this.midpoint.scale(1. / this.selections.length);
        }
    }, {
        key: 'draw',
        value: function draw(renderer) {
            var camera = renderer.getCamera();
            if (this.selections.length > 0 && !this.drag) {
                var pos = camera.getScreenPos(this.midpoint);
                var r = ROTATION_CIRCLE_RADIUS / camera.zoom;
                var br = ROTATION_CIRCLE_THICKNESS / camera.zoom;
                TransformController.draw(renderer);
                renderer.circle(pos.x, pos.y, r, undefined, '#ff0000', br, 0.5);
            }
            SelectionBox.draw(renderer);
        }
    }]);

    return SelectionTool;
}(Tool);

var selectionTool = new SelectionTool();

var WiringTool = function (_Tool3) {
    _inherits(WiringTool, _Tool3);

    function WiringTool() {
        _classCallCheck(this, WiringTool);

        var _this29 = _possibleConstructorReturn(this, (WiringTool.__proto__ || Object.getPrototypeOf(WiringTool)).call(this));

        _this29.clickOPort = false;
        _this29.wire = undefined;
        return _this29;
    }

    _createClass(WiringTool, [{
        key: 'onKeyUp',
        value: function onKeyUp(code, input) {
            if (code === ESC_KEY) {
                this.removeWire();
                selectionTool.activate();
                render();
            }
        }
    }, {
        key: 'activate',
        value: function activate(object, context) {
            _get(WiringTool.prototype.__proto__ || Object.getPrototypeOf(WiringTool.prototype), 'activate', this).call(this);

            console.log(object);

            this.wire = new Wire(context);
            this.clickOPort = object instanceof OPort;
            var success;
            if (this.clickOPort) success = object.connect(this.wire);else success = this.wire.connect(object);
            if (success) {
                this.onMouseMove();
                context.addWire(this.wire);
            } else {
                // Illegal connection (ex. two inputs to IPort)
                selectionTool.activate();
            }
        }
    }, {
        key: 'deactivate',
        value: function deactivate() {
            _get(WiringTool.prototype.__proto__ || Object.getPrototypeOf(WiringTool.prototype), 'deactivate', this).call(this);

            this.wire = undefined;
        }
    }, {
        key: 'removeWire',
        value: function removeWire() {
            getCurrentContext().remove(this.wire);
            if (this.clickOPort) this.wire.input.disconnect(this.wire);else this.wire.disconnect();
        }
    }, {
        key: 'onMouseMove',
        value: function onMouseMove() {
            if (this.clickOPort) this.wire.curve.update(this.wire.curve.p1, Input.getWorldMousePos(), this.wire.curve.c1, Input.getWorldMousePos());else this.wire.curve.update(Input.getWorldMousePos(), this.wire.curve.p2, Input.getWorldMousePos(), this.wire.curve.c2);
            return true;
        }
    }, {
        key: 'onClick',
        value: function onClick() {
            var objects = getCurrentContext().getObjects();
            var worldMousePos = Input.getWorldMousePos();

            for (var i = 0; i < objects.length; i++) {
                var ii = -1;
                if (this.clickOPort && (ii = objects[i].iPortContains(worldMousePos)) !== -1) {
                    if (!this.wire.connect(objects[i].inputs[ii])) this.removeWire();
                }
                if (!this.clickOPort && (ii = objects[i].oPortContains(worldMousePos)) !== -1) {
                    if (!objects[i].outputs[ii].connect(this.wire)) this.removeWire();
                }
                if (ii !== -1) {
                    var action = new PlaceWireAction(this.wire);
                    getCurrentContext().addAction(action);

                    selectionTool.activate();
                    return true;
                }
            }

            this.removeWire();
            selectionTool.activate();
            return true;
        }
    }]);

    return WiringTool;
}(Tool);

var wiringTool = new WiringTool();

var IOObject = function () {
    function IOObject(context, x, y, w, h, img, isPressable, maxInputs, maxOutputs, selectionBoxWidth, selectionBoxHeight) {
        _classCallCheck(this, IOObject);

        if (context == undefined) context = getCurrentContext();
        this.context = context;
        x = x == undefined ? 0 : x;
        y = y == undefined ? 0 : y;
        this.transform = new Transform(V(x, y), V(w, h), 0, context.getCamera());
        this.cullTransform = new Transform(this.transform.getPos(), V(0, 0), 0, this.context.getCamera());

        this.name = this.getDisplayName();
        this.img = img;
        this.isOn = false;
        this.isPressable = isPressable;
        this.maxInputs = maxInputs;
        this.maxOutputs = maxOutputs;
        this.selected = false;

        if (this.isPressable) this.selectionBoxTransform = new Transform(V(x, y), V(selectionBoxWidth, selectionBoxHeight), 0, context.getCamera());

        this.outputs = [];
        this.inputs = [];

        if (maxOutputs > 0) this.setOutputAmount(1);
    }

    _createClass(IOObject, [{
        key: 'setInputAmount',
        value: function setInputAmount(target) {
            target = clamp(target, 0, this.maxInputs);
            while (this.inputs.length > target) {
                this.inputs.splice(this.inputs.length - 1, 1);
            }while (this.inputs.length < target) {
                this.inputs.push(new IPort(this));
            }for (var i = 0; i < this.inputs.length; i++) {
                this.inputs[i].updatePosition();
            }this.onTransformChange();
        }
    }, {
        key: 'setOutputAmount',
        value: function setOutputAmount(target) {
            target = clamp(target, 0, this.maxOutputs);
            while (this.outputs.length > target) {
                this.outputs.splice(this.outputs.length - 1, 1);
            }while (this.outputs.length < target) {
                this.outputs.push(new OPort(this));
            }for (var i = 0; i < this.outputs.length; i++) {
                this.outputs[i].updatePosition();
            }this.onTransformChange();
        }
    }, {
        key: 'onTransformChange',
        value: function onTransformChange() {
            if (this.isPressable && this.selectionBoxTransform != undefined) {
                this.selectionBoxTransform.setPos(this.transform.getPos());
                this.selectionBoxTransform.setAngle(this.transform.getAngle());
                this.selectionBoxTransform.setScale(this.transform.getScale());
            }
            this.updateCullTransform();
            for (var i = 0; i < this.inputs.length; i++) {
                this.inputs[i].onTransformChange();
            }for (var i = 0; i < this.outputs.length; i++) {
                this.outputs[i].onTransformChange();
            }
        }
    }, {
        key: 'updateCullTransform',
        value: function updateCullTransform() {
            // Find min/max points on the object
            var min = V(-this.transform.size.x / 2, -this.transform.size.y / 2);
            var max = V(this.transform.size.x / 2, this.transform.size.y / 2);
            if (this.selectionBoxTransform != undefined) {
                min.x = Math.min(-this.selectionBoxTransform.size.x / 2, min.x);
                min.y = Math.min(-this.selectionBoxTransform.size.y / 2, min.y);
                max.x = Math.max(this.selectionBoxTransform.size.x / 2, max.x);
                max.y = Math.max(this.selectionBoxTransform.size.y / 2, max.y);
            }
            for (var i = 0; i < this.inputs.length; i++) {
                var iport = this.inputs[i];
                min.x = Math.min(iport.target.x, min.x);
                min.y = Math.min(iport.target.y, min.y);
                max.x = Math.max(iport.target.x, max.x);
                max.y = Math.max(iport.target.y, max.y);
            }
            for (var i = 0; i < this.outputs.length; i++) {
                var oport = this.outputs[i];
                min.x = Math.min(oport.target.x, min.x);
                min.y = Math.min(oport.target.y, min.y);
                max.x = Math.max(oport.target.x, max.x);
                max.y = Math.max(oport.target.y, max.y);
            }
            this.cullTransform.setSize(V(max.x - min.x, max.y - min.y));
            var c = Math.cos(this.transform.getAngle());
            var s = Math.sin(this.transform.getAngle());
            var x = (min.x - -this.cullTransform.size.x / 2) * c + (min.y - -this.cullTransform.size.y / 2) * s;
            var y = (min.y - -this.cullTransform.size.y / 2) * c + (min.x - -this.cullTransform.size.x / 2) * s;
            this.cullTransform.setPos(this.transform.getPos().add(V(x, y)));
            this.cullTransform.setAngle(this.transform.getAngle());
            this.cullTransform.setScale(this.transform.getScale());
            this.cullTransform.setSize(this.cullTransform.size.add(V(2 * IO_PORT_RADIUS, 2 * IO_PORT_RADIUS)));
        }
    }, {
        key: 'click',
        value: function click() {
            // console.log(this);
        }
    }, {
        key: 'press',
        value: function press() {}
    }, {
        key: 'release',
        value: function release() {}
    }, {
        key: 'activate',
        value: function activate(on, i) {
            if (i == undefined) i = 0;

            this.isOn = on;
            if (this.outputs[i] != undefined) this.outputs[i].activate(on);
        }
    }, {
        key: 'localSpace',
        value: function localSpace() {
            var renderer = this.context.getRenderer();
            renderer.save();
            this.transform.transformCtx(renderer.context);
        }
    }, {
        key: 'draw',
        value: function draw() {
            this.localSpace();
            for (var i = 0; i < this.inputs.length; i++) {
                this.inputs[i].draw();
            }for (var i = 0; i < this.outputs.length; i++) {
                this.outputs[i].draw(i);
            }var renderer = this.context.getRenderer();
            if (this.isPressable && this.selectionBoxTransform != undefined) renderer.rect(0, 0, this.selectionBoxTransform.size.x, this.selectionBoxTransform.size.y, this.getCol(), this.getBorderColor());

            if (this.img != undefined) renderer.image(this.img, 0, 0, this.transform.size.x, this.transform.size.y, this.getImageTint());
            renderer.restore();
        }
    }, {
        key: 'remove',
        value: function remove() {
            this.context.remove(this);
            for (var i = 0; i < this.outputs.length; i++) {
                this.outputs[i].remove();
            }for (var i = 0; i < this.inputs.length; i++) {
                this.inputs[i].remove();
            }
        }
    }, {
        key: 'contains',
        value: function contains(pos) {
            return rectContains(this.transform, pos);
        }
    }, {
        key: 'sContains',
        value: function sContains(pos) {
            return !this.isPressable && this.contains(pos) || this.isPressable && !this.contains(pos) && rectContains(this.selectionBoxTransform, pos);
        }
    }, {
        key: 'iPortContains',
        value: function iPortContains(pos) {
            for (var i = 0; i < this.inputs.length; i++) {
                if (this.inputs[i].contains(pos)) return i;
            }
            return -1;
        }
    }, {
        key: 'oPortContains',
        value: function oPortContains(pos) {
            for (var i = 0; i < this.outputs.length; i++) {
                if (this.outputs[i].contains(pos)) return i;
            }
            return -1;
        }
    }, {
        key: 'setContext',
        value: function setContext(context) {
            this.context = context;
            this.transform.setCamera(this.context.getCamera());
            if (this.selectionBoxTransform != undefined) this.selectionBoxTransform.setCamera(this.context.getCamera());
        }
    }, {
        key: 'setTransform',
        value: function setTransform(t) {
            this.transform = t;
            this.onTransformChange();
        }
    }, {
        key: 'setPos',
        value: function setPos(v) {
            this.transform.setPos(v);
            this.onTransformChange();
        }
    }, {
        key: 'setAngle',
        value: function setAngle(a) {
            this.transform.setAngle(a);
            this.onTransformChange();
        }
        // setRotationAbout(a, c) {
        //     this.transform.rotateAbout(a-this.getAngle(), c);
        //     this.onTransformChange();
        // }

    }, {
        key: 'setRotationAbout',
        value: function setRotationAbout(a, c) {
            this.transform.rotateAbout(-this.getAngle(), c);
            this.transform.rotateAbout(a, c);
            this.onTransformChange();
        }
    }, {
        key: 'setName',
        value: function setName(name) {
            this.name = name;
        }
    }, {
        key: 'getCullBox',
        value: function getCullBox() {
            return this.cullTransform;
        }
    }, {
        key: 'getInputAmount',
        value: function getInputAmount() {
            return this.inputs.length;
        }
    }, {
        key: 'getImageTint',
        value: function getImageTint() {
            return this.getCol();
        }
    }, {
        key: 'getCol',
        value: function getCol() {
            return this.selected ? '#1cff3e' : undefined;
        }
    }, {
        key: 'getBorderColor',
        value: function getBorderColor() {
            return this.selected ? '#0d7f1f' : undefined;
        }
    }, {
        key: 'getPos',
        value: function getPos() {
            return this.transform.pos.copy();
        }
    }, {
        key: 'getAngle',
        value: function getAngle() {
            return this.transform.angle;
        }
    }, {
        key: 'getSize',
        value: function getSize() {
            return this.transform.size;
        }
    }, {
        key: 'getMaxInputFieldCount',
        value: function getMaxInputFieldCount() {
            return 8;
        }
    }, {
        key: 'getMinInputFieldCount',
        value: function getMinInputFieldCount() {
            return 2;
        }
    }, {
        key: 'getName',
        value: function getName() {
            return this.name;
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return "IOObject";
        }
    }, {
        key: 'getRenderer',
        value: function getRenderer() {
            return this.context.getRenderer();
        }
    }, {
        key: 'copy',
        value: function copy() {
            var copy = new this.constructor(this.context);
            copy.transform = this.transform.copy();
            copy.name = this.name;
            if (this.selectionBoxTransform != undefined) copy.selectionBoxTransform = this.selectionBoxTransform.copy();
            for (var i = 0; i < this.inputs.length; i++) {
                copy.inputs[i] = this.inputs[i].copy();
                copy.inputs[i].parent = copy;
            }
            for (var i = 0; i < this.outputs.length; i++) {
                copy.outputs[i] = this.outputs[i].copy();
                copy.outputs[i].parent = copy;
            }
            return copy;
        }
    }, {
        key: 'writeTo',
        value: function writeTo(node) {
            var objNode = createChildNode(node, this.constructor.getXMLName());
            createTextElement(objNode, "uid", this.uid);
            createTextElement(objNode, "name", this.getName());
            createTextElement(objNode, "x", this.getPos().x);
            createTextElement(objNode, "y", this.getPos().y);
            createTextElement(objNode, "angle", this.getAngle());
            return objNode;
        }
    }, {
        key: 'load',
        value: function load(node) {
            var uid = getIntValue(getChildNode(node, "uid"));
            var name = getStringValue(getChildNode(node, "name"));
            var x = getFloatValue(getChildNode(node, "x"));
            var y = getFloatValue(getChildNode(node, "y"));
            var angle = getFloatValue(getChildNode(node, "angle"));
            var isOn = getBooleanValue(getChildNode(node, "isOn"), false);
            this.uid = uid;
            this.setName(name);
            if (isOn) this.click(isOn);
            this.setPos(V(x, y));
            this.setAngle(angle);
            return this;
        }
    }]);

    return IOObject;
}();

var IOPort = function () {
    function IOPort(parent, dir) {
        _classCallCheck(this, IOPort);

        this.isOn = false;
        this.parent = parent;
        this.connections = [];

        this.lineColor = DEFAULT_BORDER_COLOR;

        this.origin = V(0, 0);
        this.target = dir.scale(IO_PORT_LENGTH);
        this.dir = dir;

        this.set = false;

        if (parent != undefined) this.updatePosition();
    }

    _createClass(IOPort, [{
        key: 'getArray',
        value: function getArray() {}
    }, {
        key: 'getIndex',
        value: function getIndex() {
            for (var i = 0; i < this.getArray().length && this.getArray()[i] !== this; i++) {}
            return i;
        }
    }, {
        key: 'getCol',
        value: function getCol() {
            return this.parent.selected || this.selected ? '#1cff3e' : undefined;
        }
    }, {
        key: 'getBorderColor',
        value: function getBorderColor() {
            return this.parent.selected || this.selected ? '#0d7f1f' : undefined;
        }
    }, {
        key: 'updatePosition',
        value: function updatePosition() {
            var i = this.getIndex();

            var l = -this.parent.transform.size.y / 2 * (i - this.getArray().length / 2 + 0.5);
            if (i === 0) l -= 1;
            if (i === this.getArray().length - 1) l += 1;

            this.origin.y = l;
            this.target.y = l;
            this.prevParentLength = this.getArray().length;
        }
    }, {
        key: 'onTransformChange',
        value: function onTransformChange() {
            if (!this.set) this.updatePosition();

            for (var i = 0; i < this.connections.length; i++) {
                if (this.connections[i] != undefined) this.connections[i].onTransformChange();
            }
        }
    }, {
        key: 'activate',
        value: function activate(on) {}
    }, {
        key: 'contains',
        value: function contains(pos) {
            var transform = new Transform(this.target, V(IO_PORT_RADIUS, IO_PORT_RADIUS).scale(2), 0, this.parent.context.getCamera());
            transform.setParent(this.parent.transform);
            return circleContains(transform, pos);
        }
    }, {
        key: 'sContains',
        value: function sContains(pos) {
            var angle = Math.atan2(this.target.y - this.origin.y, this.target.x - this.origin.x);
            var len = this.origin.distanceTo(this.target);
            var pos0 = this.target.add(this.origin).scale(0.5);
            var transform = new Transform(pos0, V(len, IO_PORT_LINE_WIDTH * 2), angle, this.parent.context.getCamera());
            transform.setParent(this.parent.transform);
            return rectContains(transform, pos);
        }
    }, {
        key: 'draw',
        value: function draw() {
            if (!this.set && this.getArray().length !== this.prevParentLength) this.updatePosition();

            var o = this.origin;
            var v = this.target;
            var renderer = this.parent.getRenderer();

            var lineCol = this.parent.getBorderColor() ? this.parent.getBorderColor() : this.lineColor;
            renderer.line(o.x, o.y, v.x, v.y, lineCol, IO_PORT_LINE_WIDTH);

            var circleFillCol = this.getCol() ? this.getCol() : DEFAULT_FILL_COLOR;
            var circleBorderCol = this.getBorderColor() ? this.getBorderColor() : DEFAULT_BORDER_COLOR;
            renderer.circle(v.x, v.y, IO_PORT_RADIUS, circleFillCol, circleBorderCol, IO_PORT_BORDER_WIDTH);
        }
    }, {
        key: 'remove',
        value: function remove() {}
    }, {
        key: 'setOrigin',
        value: function setOrigin(v) {
            this.origin.x = v.x;
            this.origin.y = v.y;
            this.set = true;
            if (this.parent != undefined) this.parent.onTransformChange();
        }
    }, {
        key: 'setTarget',
        value: function setTarget(v) {
            this.target.x = v.x;
            this.target.y = v.y;
            this.set = true;
            if (this.parent != undefined) this.parent.onTransformChange();
        }
    }, {
        key: 'getPos',
        value: function getPos() {
            return this.parent.transform.getMatrix().mul(this.target);
        }
    }, {
        key: 'getOPos',
        value: function getOPos() {
            return this.parent.transform.getMatrix().mul(this.origin);
        }
    }, {
        key: 'getDir',
        value: function getDir() {
            return this.parent.transform.getMatrix().mul(this.dir).sub(this.parent.getPos()).normalize();
        }
    }, {
        key: 'setName',
        value: function setName(n) {}
    }, {
        key: 'setPos',
        value: function setPos() {}
    }, {
        key: 'getInputAmount',
        value: function getInputAmount() {
            return 1;
        }
    }, {
        key: 'getMaxInputFieldCount',
        value: function getMaxInputFieldCount() {
            return 1;
        }
    }, {
        key: 'getMinInputFieldCount',
        value: function getMinInputFieldCount() {
            return 1;
        }
    }, {
        key: 'getName',
        value: function getName() {
            return this.getDisplayName();
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return "ioport";
        }
    }, {
        key: 'getXMLName',
        value: function getXMLName() {
            return this.getDisplayName().toLowerCase().replace(/\s+/g, '');
        }
    }, {
        key: 'copy',
        value: function copy() {
            var port = new this.constructor();
            port.origin = this.origin.copy();
            port.target = this.target.copy();
            port.set = this.set;
            port.lineColor = this.lineColor;
            return port;
        }
    }, {
        key: 'writeTo',
        value: function writeTo(node) {
            var ioPortNode = createChildNode(node, this.getXMLName());
            createTextElement(ioPortNode, "originx", this.origin.x);
            createTextElement(ioPortNode, "originy", this.origin.y);
            createTextElement(ioPortNode, "targetx", this.target.x);
            createTextElement(ioPortNode, "targety", this.target.y);
        }
    }, {
        key: 'load',
        value: function load(node) {
            var originx = getFloatValue(getChildNode(node, "originx"));
            var originy = getFloatValue(getChildNode(node, "originy"));
            var targetx = getFloatValue(getChildNode(node, "targetx"));
            var targety = getFloatValue(getChildNode(node, "targety"));
            this.setOrigin(V(originx, originy));
            this.setTarget(V(targetx, targety));
            return this;
        }
    }, {
        key: 'uid',
        get: function get() {
            return this.parent.uid;
        }
    }]);

    return IOPort;
}();

var IPort = function (_IOPort) {
    _inherits(IPort, _IOPort);

    function IPort(parent) {
        _classCallCheck(this, IPort);

        return _possibleConstructorReturn(this, (IPort.__proto__ || Object.getPrototypeOf(IPort)).call(this, parent, V(-1, 0)));
    }

    _createClass(IPort, [{
        key: 'getArray',
        value: function getArray() {
            return this.parent.inputs;
        }
    }, {
        key: 'activate',
        value: function activate(on) {
            if (this.isOn === on) return;

            this.isOn = on;
            this.parent.context.propogate(this, this.parent, this.isOn);
        }
    }, {
        key: 'remove',
        value: function remove() {
            if (this.input != undefined) this.input.disconnect(this);
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return "iport";
        }
    }, {
        key: 'input',
        set: function set(obj) {
            if (obj == undefined) this.connections = [];else this.connections[0] = obj;
        },
        get: function get() {
            if (this.connections.length > 0) return this.connections[0];else return undefined;
        }
    }]);

    return IPort;
}(IOPort);

var OPort = function (_IOPort2) {
    _inherits(OPort, _IOPort2);

    function OPort(parent) {
        _classCallCheck(this, OPort);

        return _possibleConstructorReturn(this, (OPort.__proto__ || Object.getPrototypeOf(OPort)).call(this, parent, V(1, 0)));
    }

    _createClass(OPort, [{
        key: 'getArray',
        value: function getArray() {
            return this.parent.outputs;
        }
    }, {
        key: 'activate',
        value: function activate(on) {
            if (this.isOn === on) return;

            this.isOn = on;
            for (var i = 0; i < this.connections.length; i++) {
                this.parent.context.propogate(this, this.connections[i], this.isOn);
            }
        }
    }, {
        key: 'remove',
        value: function remove() {
            for (var i = 0; i < this.connections.length; i++) {
                this.disconnect(this.connections[i]);
            }
        }
    }, {
        key: 'connect',
        value: function connect(wire) {
            this.connections.push(wire);
            wire.input = this;
            wire.onTransformChange();
            wire.activate(this.isOn);
            return true;
        }
    }, {
        key: 'disconnect',
        value: function disconnect(obj) {
            for (var i = 0; i < this.connections.length && this.connections[i] !== obj; i++) {}
            this.connections[i].input = undefined;
            this.connections.splice(i, 1);
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return "oport";
        }
    }]);

    return OPort;
}(IOPort);

var Wire = function () {
    function Wire(context) {
        _classCallCheck(this, Wire);

        this.context = context;

        this.input = undefined;
        this.connection = undefined;

        this.curve = new BezierCurve(V(0, 0), V(0, 0), V(0, 0), V(0, 0));
        this.isOn = false;
        this.set = false; // Manually set bezier control points

        this.straight = false;
        this.dirty = true;
        this.boundingBox = new Transform(0, 0, 0, context.getCamera());
    }

    _createClass(Wire, [{
        key: 'activate',
        value: function activate(on) {
            if (this.isOn === on) return;

            this.isOn = on;
            if (this.connection != undefined) this.connection.activate(on);
        }
    }, {
        key: 'split',
        value: function split(t) {
            var pos = this.curve.getPos(t);

            var wire = new Wire(this.context);

            var prevConnection = this.connection;
            this.disconnect();

            var port = new WirePort(this.context);
            this.connect(port);
            wire.connect(prevConnection);
            port.connect(wire);

            this.connection.setPos(pos);

            getCurrentContext().addObject(port);
            getCurrentContext().addWire(wire);
        }
    }, {
        key: 'updateBoundingBox',
        value: function updateBoundingBox() {
            if (!this.dirty) return;
            this.dirty = false;

            var end1 = this.getPos(0);
            var end2 = this.getPos(1);
            var min = V(Math.min(end1.x, end2.x), Math.min(end1.y, end2.y));
            var max = V(Math.max(end1.x, end2.x), Math.max(end1.y, end2.y));
            this.boundingBox.setSize(V(max.x - min.x + 2, max.y - min.y + 2));
            this.boundingBox.setPos(V((max.x - min.x) / 2 + min.x, (max.y - min.y) / 2 + min.y));
        }
    }, {
        key: 'onTransformChange',
        value: function onTransformChange() {
            if (this.input != undefined) {
                var pos = this.input.getPos();
                if (this.set) {
                    this.curve.c1.x += pos.x - this.curve.p1.x;
                    this.curve.c1.y += pos.y - this.curve.p1.y;
                } else {
                    var dir = this.input instanceof WirePort ? this.input.getODir() : this.input.getDir();
                    var c = dir.scale(DEFAULT_SIZE).add(pos);
                    this.curve.c1.x = c.x;
                    this.curve.c1.y = c.y;
                }
                this.curve.p1.x = pos.x;
                this.curve.p1.y = pos.y;
                this.curve.dirty = true;
                this.dirty = true;
            }
            if (this.connection != undefined) {
                var pos = this.connection.getPos();
                if (this.set) {
                    this.curve.c2.x += pos.x - this.curve.p2.x;
                    this.curve.c2.y += pos.y - this.curve.p2.y;
                } else {
                    var dir = this.connection.getDir();
                    var c = dir.scale(DEFAULT_SIZE).add(pos);
                    this.curve.c2.x = c.x;
                    this.curve.c2.y = c.y;
                }
                this.curve.p2.x = pos.x;
                this.curve.p2.y = pos.y;
                this.curve.dirty = true;
                this.dirty = true;
            }
        }
    }, {
        key: 'connect',
        value: function connect(obj) {
            if (this.connection != undefined || obj.input != undefined) return false;

            this.connection = obj;
            obj.input = this;
            this.onTransformChange();
            obj.activate(this.isOn);

            return true;
        }
    }, {
        key: 'disconnect',
        value: function disconnect() {
            if (this.connection == undefined) return false;

            this.connection.input = undefined;
            this.connection.activate(false);
            this.connection = undefined;
        }
    }, {
        key: 'draw',
        value: function draw() {
            var renderer = this.context.getRenderer();
            var camera = this.context.getCamera();

            var color = this.isOn ? '#3cacf2' : this.selected ? '#1cff3e' : DEFAULT_FILL_COLOR;
            if (this.straight) {
                var p1 = camera.getScreenPos(this.curve.p1);
                var p2 = camera.getScreenPos(this.curve.p2);
                renderer.line(p1.x, p1.y, p2.x, p2.y, color, 7 / camera.zoom);
            } else {
                this.curve.draw(color, 7 / camera.zoom, renderer);
            }
        }
    }, {
        key: 'remove',
        value: function remove() {
            this.context.remove(this);
            if (this.input != undefined) this.input.disconnect(this);
            if (this.connection != undefined) this.disconnect(this.connection);
        }
    }, {
        key: 'contains',
        value: function contains(pos) {
            return this.curve.getNearestT(pos.x, pos.y) !== -1;
        }
    }, {
        key: 'setName',
        value: function setName(n) {}
    }, {
        key: 'setPos',
        value: function setPos() {}
    }, {
        key: 'getPos',
        value: function getPos(t) {
            if (t == undefined) t = 0.5;
            return this.curve.getPos(t);
        }
    }, {
        key: 'getNearestT',
        value: function getNearestT(mx, my) {
            return this.straight ? _getNearestT(this.curve.p1, this.curve.p2, mx, my) : this.curve.getNearestT(mx, my);
        }
    }, {
        key: 'getCullBox',
        value: function getCullBox() {
            return this.straight ? this.getBoundingBox() : this.curve.getBoundingBox();
        }
    }, {
        key: 'getBoundingBox',
        value: function getBoundingBox() {
            if (!this.straight) return undefined;

            this.updateBoundingBox();
            return this.boundingBox;
        }
    }, {
        key: 'getInputAmount',
        value: function getInputAmount() {
            return 1;
        }
    }, {
        key: 'getMaxInputFieldCount',
        value: function getMaxInputFieldCount() {
            return 1;
        }
    }, {
        key: 'getMinInputFieldCount',
        value: function getMinInputFieldCount() {
            return 1;
        }
    }, {
        key: 'getName',
        value: function getName() {
            return this.getDisplayName();
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return "Wire";
        }
    }, {
        key: 'copy',
        value: function copy() {
            var copy = new Wire(this.context);
            copy.curve = this.curve.copy();
            copy.straight = this.straight;
            return copy;
        }
    }, {
        key: 'writeTo',
        value: function writeTo(node, objects, wires) {
            var wireNode = createChildNode(node, "wire");

            createTextElement(wireNode, "uid", this.uid);

            var inputNode = createChildNode(wireNode, "input");
            createTextElement(inputNode, "uid", this.input.uid);
            createTextElement(inputNode, "index", this.input.getIndex());

            var connectionNode = createChildNode(wireNode, "connection");
            createTextElement(connectionNode, "uid", this.connection.uid);
            createTextElement(connectionNode, "index", this.connection.getIndex());

            this.curve.writeTo(wireNode);

            createTextElement(wireNode, "straight", this.straight);
        }
    }, {
        key: 'load',
        value: function load(node) {
            var objects = this.context.getObjects();
            var wires = this.context.getWires();

            var uid = getIntValue(getChildNode(node, "uid"));
            this.uid = uid;

            var bezier = getChildNode(node, "bezier");
            this.curve.load(bezier);

            var straight = getBooleanValue(getChildNode(node, "straight"));
            this.straight = straight;

            return this;
        }
    }, {
        key: 'loadConnections',
        value: function loadConnections(node, objects) {
            var inputNode = getChildNode(node, "input");
            var sourceUID = getIntValue(getChildNode(inputNode, "uid"));
            var sourceIndx = getIntValue(getChildNode(inputNode, "index"));
            var source = findByUID(objects, sourceUID);
            source = source instanceof WirePort ? source : source.outputs[sourceIndx];

            var connectionNode = getChildNode(node, "connection");
            var targetUID = getIntValue(getChildNode(connectionNode, "uid"));
            var targetIndx = getIntValue(getChildNode(connectionNode, "index"));
            var target = findByUID(objects, targetUID);
            console.log(targetUID);
            console.log(targetIndx);
            console.log(target);
            target = target instanceof WirePort ? target : target.inputs[targetIndx];

            source.connect(this);
            this.connect(target);
        }
    }]);

    return Wire;
}();

var WirePort = function (_IOObject) {
    _inherits(WirePort, _IOObject);

    function WirePort(context) {
        _classCallCheck(this, WirePort);

        var _this32 = _possibleConstructorReturn(this, (WirePort.__proto__ || Object.getPrototypeOf(WirePort)).call(this, context, 0, 0, 2 * IO_PORT_RADIUS, 2 * IO_PORT_RADIUS));

        _this32._input = undefined;
        _this32.connection = undefined;
        _this32.isOn = false;
        _this32.selected = false;
        _this32.hasSetTransform = false;
        return _this32;
    }

    _createClass(WirePort, [{
        key: 'activate',
        value: function activate(on) {
            if (this.isOn === on) return;

            this.isOn = on;
            if (this.connection != undefined) this.connection.activate(on);
        }
    }, {
        key: 'remove',
        value: function remove() {
            this.context.remove(this);
            if (this.input != undefined) this.input.disconnect(this);
            if (this.connection != undefined) this.disconnect(this.connection);
        }
    }, {
        key: 'setTransform',
        value: function setTransform(t) {
            this.transform = t;
            this.setPos(t.pos);
        }
    }, {
        key: 'onTransformChange',
        value: function onTransformChange() {
            if (this.input != undefined) this.input.onTransformChange();
            if (this.connection != undefined) this.connection.onTransformChange();
        }
    }, {
        key: 'connect',
        value: function connect(wire) {
            if (this.connection != undefined) return false;

            this.connection = wire;
            wire.input = this;
            wire.onTransformChange();
            wire.activate(this.isOn);

            return true;
        }
    }, {
        key: 'disconnect',
        value: function disconnect() {
            if (this.connection == undefined) return;

            this.connection.input = undefined;
            this.connection = undefined;
        }
    }, {
        key: 'draw',
        value: function draw() {
            var renderer = this.context.getRenderer();
            var camera = this.context.getCamera();

            var v = camera.getScreenPos(this.getPos());
            renderer.circle(v.x, v.y, 7 / camera.zoom, this.selected ? '#1cff3e' : '#ffffff', this.selected ? '#0d7f1f' : '#000000', 1 / camera.zoom);
        }
    }, {
        key: 'contains',
        value: function contains(pos) {
            return circleContains(this.transform, pos);
        }
    }, {
        key: 'sContains',
        value: function sContains(pos) {
            return this.contains(pos);
        }
    }, {
        key: 'setPos',
        value: function setPos(v) {
            if (this.input != undefined && this.connection != undefined) {
                // Snap to end points of wires
                this.input.straight = false;
                this.connection.straight = false;
                v.x = snap(this.input, v.x, this.input.curve.p1.x);
                v.y = snap(this.input, v.y, this.input.curve.p1.y);
                v.x = snap(this.connection, v.x, this.connection.curve.p2.x);
                v.y = snap(this.connection, v.y, this.connection.curve.p2.y);
            }

            _get(WirePort.prototype.__proto__ || Object.getPrototypeOf(WirePort.prototype), 'setPos', this).call(this, v);
        }
    }, {
        key: 'getIndex',
        value: function getIndex() {
            return 0;
        }
    }, {
        key: 'getDir',
        value: function getDir() {
            return this.transform.getMatrix().mul(V(-1, 0)).sub(this.transform.pos).normalize();
        }
    }, {
        key: 'getODir',
        value: function getODir() {
            return this.transform.getMatrix().mul(V(1, 0)).sub(this.transform.pos).normalize();
        }
    }, {
        key: 'getCullBox',
        value: function getCullBox() {
            return this.transform;
        }
    }, {
        key: 'getInputAmount',
        value: function getInputAmount() {
            return 1;
        }
    }, {
        key: 'getName',
        value: function getName() {
            return this.getDisplayName();
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return "Port";
        }
    }, {
        key: 'input',
        set: function set(input) {
            this._input = input;
            if (!this.hasSetTransform) {
                this.hasSetTransform = true;
                this.transform = new Transform(input.curve.p2.copy(), V(15, 15), 0, this.context.getCamera());
            }
        },
        get: function get() {
            return this._input;
        }
    }]);

    return WirePort;
}(IOObject);

WirePort.getXMLName = function () {
    return "port";
};
Importer.types.push(WirePort);

function snap(wire, x, c) {
    if (Math.abs(x - c) <= WIRE_SNAP_THRESHOLD) {
        wire.straight = true;
        return c;
    }
    return x;
}

var Gate = function (_IOObject2) {
    _inherits(Gate, _IOObject2);

    function Gate(context, not, x, y, img) {
        _classCallCheck(this, Gate);

        var _this33 = _possibleConstructorReturn(this, (Gate.__proto__ || Object.getPrototypeOf(Gate)).call(this, context, x, y, DEFAULT_SIZE * (img != undefined ? img.ratio : 1), DEFAULT_SIZE, img, false, 512, 512));

        _this33._not = not ? true : false;
        _this33.name = _this33.getDisplayName();

        _this33.setInputAmount(2);
        return _this33;
    }

    _createClass(Gate, [{
        key: 'activate',
        value: function activate(on, i) {
            _get(Gate.prototype.__proto__ || Object.getPrototypeOf(Gate.prototype), 'activate', this).call(this, this.not ? !on : on, i);
        }
    }, {
        key: 'draw',
        value: function draw() {
            _get(Gate.prototype.__proto__ || Object.getPrototypeOf(Gate.prototype), 'draw', this).call(this);

            var renderer = this.context.getRenderer();

            this.localSpace();
            if (this.not) {
                var l = this.transform.size.x / 2 + 5;
                renderer.circle(l, 0, 5, this.getCol() == undefined ? '#fff' : this.getCol(), this.getBorderColor(), 2);
            }
            renderer.restore();
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return "Gate";
        }
    }, {
        key: 'copy',
        value: function copy() {
            var copy = _get(Gate.prototype.__proto__ || Object.getPrototypeOf(Gate.prototype), 'copy', this).call(this);
            copy.not = this.not;
            return copy;
        }
    }, {
        key: 'writeTo',
        value: function writeTo(node) {
            var gateNode = _get(Gate.prototype.__proto__ || Object.getPrototypeOf(Gate.prototype), 'writeTo', this).call(this, node);
            createTextElement(gateNode, "not", this.not);
            createTextElement(gateNode, "inputcount", this.getInputAmount());
            return gateNode;
        }
    }, {
        key: 'load',
        value: function load(node) {
            _get(Gate.prototype.__proto__ || Object.getPrototypeOf(Gate.prototype), 'load', this).call(this, node);
            var not = getBooleanValue(getChildNode(node, "not"));
            var inputCount = getIntValue(getChildNode(node, "inputcount"), 1);
            this.not = not;
            this.setInputAmount(inputCount);
            return this;
        }
    }, {
        key: 'not',
        set: function set(value) {
            this._not = value;
            if (value) this.outputs[0].isOn = !this.isOn;
        },
        get: function get() {
            return this._not;
        }
    }]);

    return Gate;
}(IOObject);

var SRFlipFlop = function (_Gate) {
    _inherits(SRFlipFlop, _Gate);

    function SRFlipFlop(context, x, y) {
        _classCallCheck(this, SRFlipFlop);

        var _this34 = _possibleConstructorReturn(this, (SRFlipFlop.__proto__ || Object.getPrototypeOf(SRFlipFlop)).call(this, context, false, x, y, undefined));

        _this34.noChange = true;
        _this34.setInputAmount(3);
        _this34.setOutputAmount(2);
        _this34.transform.setSize(_this34.transform.size.scale(1.5));
        return _this34;
    }

    _createClass(SRFlipFlop, [{
        key: 'onTransformChange',
        value: function onTransformChange() {
            this.transform.setSize(V(DEFAULT_SIZE, DEFAULT_SIZE));
            _get(SRFlipFlop.prototype.__proto__ || Object.getPrototypeOf(SRFlipFlop.prototype), 'onTransformChange', this).call(this);
            this.transform.setSize(V(DEFAULT_SIZE * 1.5, DEFAULT_SIZE * 1.5));
        }
    }, {
        key: 'activate',
        value: function activate(x) {
            var on = this.outputs[0].isOn;

            var set = this.inputs[0].isOn;
            var clock = this.inputs[1].isOn;
            var reset = this.inputs[2].isOn;
            if (clock) {
                if (set && reset) {
                    // undefined behavior
                } else if (set) {
                    on = true;
                } else if (reset) {
                    on = false;
                }
            }

            _get(SRFlipFlop.prototype.__proto__ || Object.getPrototypeOf(SRFlipFlop.prototype), 'activate', this).call(this, on, 0);
            _get(SRFlipFlop.prototype.__proto__ || Object.getPrototypeOf(SRFlipFlop.prototype), 'activate', this).call(this, !on, 1);
        }
    }, {
        key: 'draw',
        value: function draw() {
            _get(SRFlipFlop.prototype.__proto__ || Object.getPrototypeOf(SRFlipFlop.prototype), 'draw', this).call(this);

            var renderer = this.context.getRenderer();
            this.localSpace();
            renderer.rect(0, 0, this.transform.size.x, this.transform.size.y, this.getCol(), this.getBorderColor());
            renderer.restore();
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return "SR Flip Flop";
        }
    }]);

    return SRFlipFlop;
}(Gate);

SRFlipFlop.getXMLName = function () {
    return "srff";
};
Importer.types.push(SRFlipFlop);

// key board input inputs

var Button = function (_IOObject3) {
    _inherits(Button, _IOObject3);

    function Button(context, x, y) {
        _classCallCheck(this, Button);

        return _possibleConstructorReturn(this, (Button.__proto__ || Object.getPrototypeOf(Button)).call(this, context, x, y, DEFAULT_SIZE, DEFAULT_SIZE, images["buttonUp.svg"], true, 0, 1, 60, 60));
    }

    _createClass(Button, [{
        key: 'press',
        value: function press() {
            _get(Button.prototype.__proto__ || Object.getPrototypeOf(Button.prototype), 'activate', this).call(this, true);
            this.img = images["buttonDown.svg"];
        }
    }, {
        key: 'release',
        value: function release() {
            _get(Button.prototype.__proto__ || Object.getPrototypeOf(Button.prototype), 'activate', this).call(this, false);
            this.img = images["buttonUp.svg"];
        }
    }, {
        key: 'contains',
        value: function contains(pos) {
            return circleContains(this.transform, pos);
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return "Button";
        }
    }]);

    return Button;
}(IOObject);

Button.getXMLName = function () {
    return "button";
};
Importer.types.push(Button);

var Clock = function (_IOObject4) {
    _inherits(Clock, _IOObject4);

    function Clock(context, x, y) {
        _classCallCheck(this, Clock);

        var _this36 = _possibleConstructorReturn(this, (Clock.__proto__ || Object.getPrototypeOf(Clock)).call(this, context, x, y, 60, 60 / images["clock.svg"].ratio, images["clock.svg"], false, 0, 1));

        _this36.frequency = 1000;
        setTimeout(function () {
            return _this36.tick();
        }, _this36.frequency);
        return _this36;
    }

    _createClass(Clock, [{
        key: 'tick',
        value: function tick() {
            var _this37 = this;

            this.activate(!this.isOn);
            setTimeout(function () {
                return _this37.tick();
            }, this.frequency);
        }
    }, {
        key: 'activate',
        value: function activate(on) {
            _get(Clock.prototype.__proto__ || Object.getPrototypeOf(Clock.prototype), 'activate', this).call(this, on);
            this.img = on ? images["clockOn.svg"] : images["clock.svg"];
            render();
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return "Clock";
        }
    }]);

    return Clock;
}(IOObject);

Clock.getXMLName = function () {
    return "clock";
};
Importer.types.push(Clock);

var ConstantHigh = function (_IOObject5) {
    _inherits(ConstantHigh, _IOObject5);

    function ConstantHigh(context, x, y) {
        _classCallCheck(this, ConstantHigh);

        var _this38 = _possibleConstructorReturn(this, (ConstantHigh.__proto__ || Object.getPrototypeOf(ConstantHigh)).call(this, context, x, y, DEFAULT_SIZE, DEFAULT_SIZE, images["constHigh.svg"], false, 0, 1));

        _get(ConstantHigh.prototype.__proto__ || Object.getPrototypeOf(ConstantHigh.prototype), 'activate', _this38).call(_this38, true);
        return _this38;
    }

    _createClass(ConstantHigh, [{
        key: 'getDisplayName',
        value: function getDisplayName() {
            return "Constant High";
        }
    }]);

    return ConstantHigh;
}(IOObject);

ConstantHigh.getXMLName = function () {
    return "consthigh";
};
Importer.types.push(ConstantHigh);

var ConstantLow = function (_IOObject6) {
    _inherits(ConstantLow, _IOObject6);

    function ConstantLow(context, x, y) {
        _classCallCheck(this, ConstantLow);

        var _this39 = _possibleConstructorReturn(this, (ConstantLow.__proto__ || Object.getPrototypeOf(ConstantLow)).call(this, context, x, y, DEFAULT_SIZE, DEFAULT_SIZE, images["constLow.svg"], false, 0, 1));

        _get(ConstantLow.prototype.__proto__ || Object.getPrototypeOf(ConstantLow.prototype), 'activate', _this39).call(_this39, false);
        return _this39;
    }

    _createClass(ConstantLow, [{
        key: 'getDisplayName',
        value: function getDisplayName() {
            return "Constant Low";
        }
    }]);

    return ConstantLow;
}(IOObject);

ConstantLow.getXMLName = function () {
    return "constlow";
};
Importer.types.push(ConstantLow);

var Keyboard = function (_IOObject7) {
    _inherits(Keyboard, _IOObject7);

    function Keyboard(context, x, y) {
        _classCallCheck(this, Keyboard);

        var _this40 = _possibleConstructorReturn(this, (Keyboard.__proto__ || Object.getPrototypeOf(Keyboard)).call(this, context, x, y, 3.5 * DEFAULT_SIZE, 3.5 * DEFAULT_SIZE / images["keyboard.svg"].ratio, images["keyboard.svg"], false, 0, 7));

        _this40.setOutputAmount(7);
        for (var i = 0; i < 7; i++) {
            var output = _this40.outputs[i];

            var l = -DEFAULT_SIZE / 2 * (i - 7 / 2 + 0.5);
            if (i === 0) l -= 1;
            if (i === 7 - 1) l += 1;

            output.setOrigin(V(l, 0));
            output.setTarget(V(l, -IO_PORT_LENGTH - (_this40.transform.size.y - DEFAULT_SIZE) / 2));
            output.dir = V(0, -1);
        }
        return _this40;
    }

    _createClass(Keyboard, [{
        key: 'onKeyDown',
        value: function onKeyDown(code) {
            var code = Keyboard.codeMap[code];
            if (code == undefined) return;

            // Down bit
            this.activate(true, this.outputs.length - 1);

            for (var i = this.outputs.length - 2; i >= 0; i--) {
                var num = 1 << i;
                if (num > code) {
                    this.outputs[i].activate(false);
                } else {
                    this.outputs[i].activate(true);
                    code -= num;
                }
            }
        }
    }, {
        key: 'onKeyUp',
        value: function onKeyUp(code) {
            var code = Keyboard.codeMap[code];
            if (code == undefined) return;

            // Up bit
            this.activate(false, this.outputs.length - 1);

            for (var i = this.outputs.length - 2; i >= 0; i--) {
                this.outputs[i].activate(false);
                // var num = 1 << i;
                // if (num > code) {
                //     this.outputs[i].activate(false);
                // } else {
                //     this.outputs[i].activate(true);
                //     code -= num;
                // }
            }
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return "Keyboard";
        }
    }]);

    return Keyboard;
}(IOObject);

Keyboard.getXMLName = function () {
    return "keyboard";
};
Importer.types.push(Keyboard);

Keyboard.codeMap = [];
Keyboard.codeCount = 0;

Keyboard.addKey = function (code) {
    Keyboard.codeMap[code] = ++Keyboard.codeCount;
};

// Add numbers 0-9
for (var code = 48; code <= 57; code++) {
    Keyboard.addKey(code);
} // Add letters a-z
for (var code = 65; code <= 90; code++) {
    Keyboard.addKey(code);
}Keyboard.addKey(32); // Space
Keyboard.addKey(13); // Enter
Keyboard.addKey(8); // Delete
Keyboard.addKey(9); // Tab
Keyboard.addKey(16); // LShift
Keyboard.addKey(17); // LCtrl
Keyboard.addKey(18); // LOption
Keyboard.addKey(91); // LCommand
Keyboard.addKey(20); // Caps lock
Keyboard.addKey(27); // Escape
Keyboard.addKey(192); // Tilda
Keyboard.addKey(189); // Minus
Keyboard.addKey(187); // Plus
Keyboard.addKey(219); // LBracket
Keyboard.addKey(221); // RBracket
Keyboard.addKey(220); // Backslash
Keyboard.addKey(186); // Semicolon
Keyboard.addKey(222); // Quote
Keyboard.addKey(188); // Comma
Keyboard.addKey(190); // Period
Keyboard.addKey(191); // Forwardslash
Keyboard.addKey(37); // Left
Keyboard.addKey(38); // Up
Keyboard.addKey(39); // Right
Keyboard.addKey(40); // Down
Keyboard.addKey(112); // F1
Keyboard.addKey(112); // F2

console.log(Keyboard.codeCount);

var Switch = function (_IOObject8) {
    _inherits(Switch, _IOObject8);

    function Switch(context, x, y) {
        _classCallCheck(this, Switch);

        return _possibleConstructorReturn(this, (Switch.__proto__ || Object.getPrototypeOf(Switch)).call(this, context, x, y, 60 * images["switchUp.svg"].ratio, 60, images["switchUp.svg"], true, 0, 1, 77 * images["switchUp.svg"].ratio, 77));
    }

    _createClass(Switch, [{
        key: 'activate',
        value: function activate(on) {
            _get(Switch.prototype.__proto__ || Object.getPrototypeOf(Switch.prototype), 'activate', this).call(this, on);
            this.img = images[this.isOn ? "switchDown.svg" : "switchUp.svg"];
        }
    }, {
        key: 'click',
        value: function click() {
            _get(Switch.prototype.__proto__ || Object.getPrototypeOf(Switch.prototype), 'click', this).call(this);
            this.activate(!this.isOn);
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return "Switch";
        }
    }, {
        key: 'writeTo',
        value: function writeTo(node) {
            var switchNode = _get(Switch.prototype.__proto__ || Object.getPrototypeOf(Switch.prototype), 'writeTo', this).call(this, node);
            createTextElement(switchNode, "isOn", this.outputs[0].isOn);
            return switchNode;
        }
    }]);

    return Switch;
}(IOObject);

Switch.getXMLName = function () {
    return "switch";
};
Importer.types.push(Switch);

var ANDGate = function (_Gate2) {
    _inherits(ANDGate, _Gate2);

    function ANDGate(context, not, x, y) {
        _classCallCheck(this, ANDGate);

        return _possibleConstructorReturn(this, (ANDGate.__proto__ || Object.getPrototypeOf(ANDGate)).call(this, context, not, x, y, images["and.svg"]));
    }

    _createClass(ANDGate, [{
        key: 'setInputAmount',
        value: function setInputAmount(target) {
            _get(ANDGate.prototype.__proto__ || Object.getPrototypeOf(ANDGate.prototype), 'setInputAmount', this).call(this, target);

            for (var i = 0; i < this.inputs.length; i++) {
                var input = this.inputs[i];
                input.origin = V(-(this.transform.size.x - 2) / 2, input.origin.y);
            }
        }
    }, {
        key: 'activate',
        value: function activate(x) {
            var on = true;
            for (var i = 0; i < this.inputs.length; i++) {
                on = on && this.inputs[i].isOn;
            }_get(ANDGate.prototype.__proto__ || Object.getPrototypeOf(ANDGate.prototype), 'activate', this).call(this, on);
        }
    }, {
        key: 'draw',
        value: function draw() {
            var renderer = this.context.getRenderer();

            this.localSpace();
            var l1 = -(this.transform.size.y / 2) * (0.5 - this.inputs.length / 2);
            var l2 = -(this.transform.size.y / 2) * (this.inputs.length / 2 - 0.5);

            var s = (this.transform.size.x - 2) / 2;
            var p1 = V(-s, l1);
            var p2 = V(-s, l2);

            renderer.line(p1.x, p1.y, p2.x, p2.y, this.getBorderColor(), 2);
            renderer.restore();

            _get(ANDGate.prototype.__proto__ || Object.getPrototypeOf(ANDGate.prototype), 'draw', this).call(this);
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return this.not ? "NAND Gate" : "AND Gate";
        }
    }]);

    return ANDGate;
}(Gate);

ANDGate.getXMLName = function () {
    return "andgate";
};
Importer.types.push(ANDGate);

var BUFGate = function (_Gate3) {
    _inherits(BUFGate, _Gate3);

    function BUFGate(context, not, x, y) {
        _classCallCheck(this, BUFGate);

        var _this43 = _possibleConstructorReturn(this, (BUFGate.__proto__ || Object.getPrototypeOf(BUFGate)).call(this, context, not, x, y, images["buffer.svg"]));

        _this43.maxInputs = 1;

        _this43.setInputAmount(1);
        _this43.activate(false);
        return _this43;
    }

    _createClass(BUFGate, [{
        key: 'activate',
        value: function activate(x) {
            var on = false;
            for (var i = 0; i < this.inputs.length; i++) {
                on = this.inputs[i].isOn;
            }_get(BUFGate.prototype.__proto__ || Object.getPrototypeOf(BUFGate.prototype), 'activate', this).call(this, on);
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return this.not ? "NOT Gate" : "Buffer Gate";
        }
    }]);

    return BUFGate;
}(Gate);

BUFGate.getXMLName = function () {
    return "bufgate";
};
Importer.types.push(BUFGate);

var ORGate = function (_Gate4) {
    _inherits(ORGate, _Gate4);

    function ORGate(context, not, x, y) {
        _classCallCheck(this, ORGate);

        return _possibleConstructorReturn(this, (ORGate.__proto__ || Object.getPrototypeOf(ORGate)).call(this, context, not, x, y, images["or.svg"]));
    }

    _createClass(ORGate, [{
        key: 'quadCurveXAt',
        value: function quadCurveXAt(t) {
            var s = this.transform.size.x / 2 - 2;
            var l = this.transform.size.x / 5 - 2;
            var t2 = 1 - t;
            return t2 * t2 * -s + 2 * t * t2 * -l + t * t * -s;
        }
    }, {
        key: 'setInputAmount',
        value: function setInputAmount(target) {
            _get(ORGate.prototype.__proto__ || Object.getPrototypeOf(ORGate.prototype), 'setInputAmount', this).call(this, target);

            for (var i = 0; i < this.inputs.length; i++) {
                var input = this.inputs[i];
                var t = (input.origin.y / this.transform.size.y + 0.5) % 1.0;
                if (t < 0) t += 1.0;
                var x = this.quadCurveXAt(t);
                input.origin = V(x, input.origin.y);
            }
        }
    }, {
        key: 'activate',
        value: function activate(x) {
            var on = false;
            for (var i = 0; i < this.inputs.length; i++) {
                on = on || this.inputs[i].isOn;
            }_get(ORGate.prototype.__proto__ || Object.getPrototypeOf(ORGate.prototype), 'activate', this).call(this, on);
        }
    }, {
        key: 'draw',
        value: function draw() {
            var renderer = this.context.getRenderer();

            this.localSpace();
            var amt = 2 * Math.floor(this.inputs.length / 4) + 1;
            for (var i = 0; i < amt; i++) {
                var d = (i - Math.floor(amt / 2)) * this.transform.size.y;
                var h = 2;
                var l1 = -this.transform.size.y / 2;
                var l2 = +this.transform.size.y / 2;

                var s = this.transform.size.x / 2 - h;
                var l = this.transform.size.x / 5 - h;

                var p1 = V(-s, l1 + d);
                var p2 = V(-s, l2 + d);
                var c = V(-l, d);

                renderer.quadCurve(p1.x, p1.y, p2.x, p2.y, c.x, c.y, this.getBorderColor(), 2);
            }
            renderer.restore();

            _get(ORGate.prototype.__proto__ || Object.getPrototypeOf(ORGate.prototype), 'draw', this).call(this);
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return this.not ? "NOR Gate" : "OR Gate";
        }
    }]);

    return ORGate;
}(Gate);

ORGate.getXMLName = function () {
    return "orgate";
};
Importer.types.push(ORGate);

var XORGate = function (_Gate5) {
    _inherits(XORGate, _Gate5);

    function XORGate(context, not, x, y) {
        _classCallCheck(this, XORGate);

        return _possibleConstructorReturn(this, (XORGate.__proto__ || Object.getPrototypeOf(XORGate)).call(this, context, not, x, y, images["or.svg"]));
    }

    _createClass(XORGate, [{
        key: 'quadCurveXAt',
        value: function quadCurveXAt(t) {
            var s = this.transform.size.x / 2 - 2;
            var l = this.transform.size.x / 5 - 2;
            var t2 = 1 - t;
            return t2 * t2 * -s + 2 * t * t2 * -l + t * t * -s;
        }
    }, {
        key: 'setInputAmount',
        value: function setInputAmount(target) {
            _get(XORGate.prototype.__proto__ || Object.getPrototypeOf(XORGate.prototype), 'setInputAmount', this).call(this, target);

            for (var i = 0; i < this.inputs.length; i++) {
                var input = this.inputs[i];
                var t = (input.origin.y / this.transform.size.y + 0.5) % 1.0;
                if (t < 0) t += 1.0;
                var x = this.quadCurveXAt(t);
                input.origin = V(x, input.origin.y);
            }
        }
    }, {
        key: 'activate',
        value: function activate(x) {
            var on = false;
            for (var i = 0; i < this.inputs.length; i++) {
                on = on !== this.inputs[i].isOn;
            }_get(XORGate.prototype.__proto__ || Object.getPrototypeOf(XORGate.prototype), 'activate', this).call(this, on);
        }
    }, {
        key: 'draw',
        value: function draw() {
            _get(XORGate.prototype.__proto__ || Object.getPrototypeOf(XORGate.prototype), 'draw', this).call(this);

            var renderer = this.context.getRenderer();

            this.localSpace();
            var amt = 2 * Math.floor(this.inputs.length / 4) + 1;
            for (var i = 0; i < amt; i++) {
                var d = (i - Math.floor(amt / 2)) * this.transform.size.y;
                var h = 2;
                var x = 12;
                var l1 = -this.transform.size.y / 2;
                var l2 = +this.transform.size.y / 2;

                var s = this.transform.size.x / 2 - h;
                var l = this.transform.size.x / 5 - h;

                var p1 = V(-s, l1 + d);
                var p2 = V(-s, l2 + d);
                var c = V(-l, d);

                renderer.quadCurve(p1.x, p1.y, p2.x, p2.y, c.x, c.y, this.getBorderColor(), 2);
                renderer.quadCurve(p1.x - x, p1.y, p2.x - x, p2.y, c.x - x, c.y, this.getBorderColor(), 2);
            }

            renderer.restore();
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return this.not ? "XNOR Gate" : "XOR Gate";
        }
    }, {
        key: 'getXMLName',
        value: function getXMLName() {
            return "xorgate";
        }
    }]);

    return XORGate;
}(Gate);

XORGate.getXMLName = function () {
    return "xorgate";
};
Importer.types.push(XORGate);

var Decoder = function (_Gate6) {
    _inherits(Decoder, _Gate6);

    function Decoder(context, x, y) {
        _classCallCheck(this, Decoder);

        return _possibleConstructorReturn(this, (Decoder.__proto__ || Object.getPrototypeOf(Decoder)).call(this, context, false, x, y, undefined));
    }

    _createClass(Decoder, [{
        key: 'onTransformChange',
        value: function onTransformChange() {
            this.transform.setSize(V(DEFAULT_SIZE, DEFAULT_SIZE));
            _get(Decoder.prototype.__proto__ || Object.getPrototypeOf(Decoder.prototype), 'onTransformChange', this).call(this);
            this.transform.setSize(V(DEFAULT_SIZE, DEFAULT_SIZE / 2 * (2 << this.inputs.length - 1)));
        }
    }, {
        key: 'setInputAmount',
        value: function setInputAmount(target) {
            target = clamp(target, 0, 8);
            _get(Decoder.prototype.__proto__ || Object.getPrototypeOf(Decoder.prototype), 'setInputAmount', this).call(this, target);
            _get(Decoder.prototype.__proto__ || Object.getPrototypeOf(Decoder.prototype), 'setOutputAmount', this).call(this, 2 << target - 1);
        }
    }, {
        key: 'getInputAmount',
        value: function getInputAmount() {
            return this.inputs.length;
        }
    }, {
        key: 'activate',
        value: function activate(x) {
            var num = 0;
            for (var i = 0; i < this.inputs.length; i++) {
                num = num | (this.inputs[i].isOn ? 1 : 0) << i;
            }for (var i = 0; i < this.outputs.length; i++) {
                this.outputs[i].activate(i === num, i);
            }
        }
    }, {
        key: 'draw',
        value: function draw() {
            _get(Decoder.prototype.__proto__ || Object.getPrototypeOf(Decoder.prototype), 'draw', this).call(this);

            var renderer = this.context.getRenderer();
            this.localSpace();
            renderer.rect(0, 0, this.transform.size.x, this.transform.size.y, this.getCol(), this.getBorderColor());
            renderer.restore();
        }
    }, {
        key: 'getMinInputFieldCount',
        value: function getMinInputFieldCount() {
            return 1;
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return "Decoder";
        }
    }]);

    return Decoder;
}(Gate);

Decoder.getXMLName = function () {
    return "decoder";
};
Importer.types.push(Decoder);

var Demultiplexer = function (_Gate7) {
    _inherits(Demultiplexer, _Gate7);

    function Demultiplexer(context, x, y) {
        _classCallCheck(this, Demultiplexer);

        return _possibleConstructorReturn(this, (Demultiplexer.__proto__ || Object.getPrototypeOf(Demultiplexer)).call(this, context, false, x, y, undefined));
    }

    _createClass(Demultiplexer, [{
        key: 'setInputAmount',
        value: function setInputAmount(target) {
            _get(Demultiplexer.prototype.__proto__ || Object.getPrototypeOf(Demultiplexer.prototype), 'setInputAmount', this).call(this, target + 1);
            _get(Demultiplexer.prototype.__proto__ || Object.getPrototypeOf(Demultiplexer.prototype), 'setOutputAmount', this).call(this, 2 << target - 1);

            var width = Math.max(DEFAULT_SIZE / 2 * (target - 1), DEFAULT_SIZE);
            var height = DEFAULT_SIZE / 2 * (2 << target - 1);
            this.transform.setSize(V(width + 10, height));

            this.selectLines = [];
            for (var i = 0; i < target; i++) {
                var input = this.inputs[i];
                this.selectLines.push(input);

                var l = -DEFAULT_SIZE / 2 * (i - target / 2 + 0.5);
                if (i === 0) l -= 1;
                if (i === target - 1) l += 1;

                input.setOrigin(V(l, 0));
                input.setTarget(V(l, IO_PORT_LENGTH + height / 2 - DEFAULT_SIZE / 2));
            }
            for (var i = 0; i < this.outputs.length; i++) {
                var output = this.outputs[i];

                var l = -DEFAULT_SIZE / 2 * (i - this.outputs.length / 2 + 0.5);
                if (i === 0) l -= 1;
                if (i === this.outputs.length - 1) l += 1;

                output.setOrigin(V(0, l));
                output.setTarget(V(IO_PORT_LENGTH + (width / 2 - DEFAULT_SIZE / 2), l));
            }
            var input = this.inputs[this.inputs.length - 1];
            input.setOrigin(V(0, 0));
            input.setTarget(V(-IO_PORT_LENGTH - (width / 2 - DEFAULT_SIZE / 2), 0));
        }
    }, {
        key: 'getInputAmount',
        value: function getInputAmount() {
            return this.selectLines.length;
        }
    }, {
        key: 'activate',
        value: function activate(x) {
            var num = 0;
            for (var i = 0; i < this.selectLines.length; i++) {
                num = num | (this.selectLines[i].isOn ? 1 : 0) << i;
            }
            _get(Demultiplexer.prototype.__proto__ || Object.getPrototypeOf(Demultiplexer.prototype), 'activate', this).call(this, this.inputs[this.inputs.length - 1].isOn, num);
            // var num = 0;
            // for (var i = 0; i < this.selectLines.length; i++)
            //     num = num | ((this.selectLines[i].isOn ? 1 : 0) << i);
            // super.activate(this.inputs[num + this.selectLines.length].isOn);
        }
    }, {
        key: 'draw',
        value: function draw() {
            _get(Demultiplexer.prototype.__proto__ || Object.getPrototypeOf(Demultiplexer.prototype), 'draw', this).call(this);

            var renderer = this.context.getRenderer();
            this.localSpace();

            var p1 = V(this.transform.size.x / 2, this.transform.size.y / 2);
            var p2 = V(this.transform.size.x / 2, -this.transform.size.y / 2);
            var p3 = V(-this.transform.size.x / 2, -this.transform.size.y / 2 + 20);
            var p4 = V(-this.transform.size.x / 2, this.transform.size.y / 2 - 20);

            renderer.shape([p1, p2, p3, p4], this.getCol(), this.getBorderColor(), 2);

            renderer.restore();
        }
    }, {
        key: 'getMinInputFieldCount',
        value: function getMinInputFieldCount() {
            return 1;
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return "Demultiplexer";
        }
    }]);

    return Demultiplexer;
}(Gate);

Demultiplexer.getXMLName = function () {
    return "demux";
};
Importer.types.push(Demultiplexer);

var Encoder = function (_Gate8) {
    _inherits(Encoder, _Gate8);

    function Encoder(context, x, y) {
        _classCallCheck(this, Encoder);

        return _possibleConstructorReturn(this, (Encoder.__proto__ || Object.getPrototypeOf(Encoder)).call(this, context, false, x, y, undefined));
    }

    _createClass(Encoder, [{
        key: 'onTransformChange',
        value: function onTransformChange() {
            this.transform.setSize(V(DEFAULT_SIZE, DEFAULT_SIZE));
            _get(Encoder.prototype.__proto__ || Object.getPrototypeOf(Encoder.prototype), 'onTransformChange', this).call(this);
            this.transform.setSize(V(DEFAULT_SIZE, DEFAULT_SIZE / 2 * (2 << this.outputs.length - 1)));
        }
    }, {
        key: 'setInputAmount',
        value: function setInputAmount(target) {
            target = clamp(target, 0, 8);
            _get(Encoder.prototype.__proto__ || Object.getPrototypeOf(Encoder.prototype), 'setInputAmount', this).call(this, 2 << target - 1);
            _get(Encoder.prototype.__proto__ || Object.getPrototypeOf(Encoder.prototype), 'setOutputAmount', this).call(this, target);
        }
    }, {
        key: 'getInputAmount',
        value: function getInputAmount() {
            return this.outputs.length;
        }
    }, {
        key: 'activate',
        value: function activate(x) {
            var indx = -1;
            for (var i = 0; i < this.inputs.length; i++) {
                if (this.inputs[i].isOn) {
                    if (indx !== -1) return; // undefined behavior
                    indx = i;
                }
            }
            if (indx === -1) return; // undefined behavior
            for (var i = this.outputs.length - 1; i >= 0; i--) {
                var num = 1 << i;
                if (num > indx) {
                    this.outputs[i].activate(false);
                } else {
                    this.outputs[i].activate(true);
                    indx -= num;
                }
            }
        }
    }, {
        key: 'draw',
        value: function draw() {
            _get(Encoder.prototype.__proto__ || Object.getPrototypeOf(Encoder.prototype), 'draw', this).call(this);

            var renderer = this.context.getRenderer();
            this.localSpace();
            renderer.rect(0, 0, this.transform.size.x, this.transform.size.y, this.getCol(), this.getBorderColor());
            renderer.restore();
        }
    }, {
        key: 'getMinInputFieldCount',
        value: function getMinInputFieldCount() {
            return 1;
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return "Encoder";
        }
    }]);

    return Encoder;
}(Gate);

Encoder.getXMLName = function () {
    return "encoder";
};
Importer.types.push(Encoder);

var IC = function (_IOObject9) {
    _inherits(IC, _IOObject9);

    function IC(context, data, x, y) {
        _classCallCheck(this, IC);

        var _this49 = _possibleConstructorReturn(this, (IC.__proto__ || Object.getPrototypeOf(IC)).call(this, context, x, y, 50, 50, undefined, false, 999, 999));

        _this49.data = data;
        _this49.setup();
        return _this49;
    }

    _createClass(IC, [{
        key: 'setup',
        value: function setup() {
            if (this.data == undefined) return;

            // Setup input and outputs
            this.setInputAmount(this.data.getInputAmount());
            this.setOutputAmount(this.data.getOutputAmount());

            // Copy object references
            var copy = this.data.copy();
            this.inputObjects = copy.inputs;
            this.outputObjects = copy.outputs;
            this.components = copy.components;
            for (var i = 0; i < this.outputObjects.length; i++) {
                var ii = i;
                var port = this.outputs[i];
                this.outputObjects[i].activate = function (on) {
                    port.activate(on);
                };
            }
            this.noChange = true;

            this.update();
        }
    }, {
        key: 'update',
        value: function update() {
            if (this.data == undefined) return;

            // Update size
            this.transform.setWidth(this.data.getWidth());
            this.transform.setHeight(this.data.getHeight());

            // Update port positions
            for (var i = 0; i < this.inputs.length; i++) {
                this.inputs[i].setOrigin(this.data.iports[i].origin);
                this.inputs[i].setTarget(this.data.iports[i].target);
            }
            for (var i = 0; i < this.outputs.length; i++) {
                this.outputs[i].setOrigin(this.data.oports[i].origin);
                this.outputs[i].setTarget(this.data.oports[i].target);
            }

            this.activate();
        }
    }, {
        key: 'activate',
        value: function activate() {
            for (var i = 0; i < this.inputs.length; i++) {
                this.inputObjects[i].activate(this.inputs[i].isOn);
            }
        }
    }, {
        key: 'draw',
        value: function draw() {
            var renderer = this.context.getRenderer();

            _get(IC.prototype.__proto__ || Object.getPrototypeOf(IC.prototype), 'draw', this).call(this);

            this.localSpace();

            var size = this.transform.size;
            renderer.rect(0, 0, size.x, size.y, this.getCol(), '#000000', 1);

            for (var i = 0; i < this.inputs.length; i++) {
                var name = this.inputObjects[i].getName();
                var pos1 = this.transform.toLocalSpace(this.inputs[i].getPos());
                var align = "center";
                var padding = 8;
                var ww = renderer.getTextWidth(name) / 2;
                var pos = getNearestPointOnRect(V(-size.x / 2, -size.y / 2), V(size.x / 2, size.y / 2), pos1);
                pos = pos.sub(pos1).normalize().scale(padding).add(pos);
                pos.x = clamp(pos.x, -size.x / 2 + padding + ww, size.x / 2 - padding - ww);
                pos.y = clamp(pos.y, -size.y / 2 + 14, size.y / 2 - 14);
                renderer.text(name, pos.x, pos.y, 0, 0, align);
            }
            for (var i = 0; i < this.outputs.length; i++) {
                var name = this.outputObjects[i].getName();
                var pos1 = this.transform.toLocalSpace(this.outputs[i].getPos());
                var align = "center";
                var padding = 8;
                var ww = renderer.getTextWidth(name) / 2;
                var pos = getNearestPointOnRect(V(-size.x / 2, -size.y / 2), V(size.x / 2, size.y / 2), pos1);
                pos = pos.sub(pos1).normalize().scale(padding).add(pos);
                pos.x = clamp(pos.x, -size.x / 2 + padding + ww, size.x / 2 - padding - ww);
                pos.y = clamp(pos.y, -size.y / 2 + 14, size.y / 2 - 14);
                renderer.text(name, pos.x, pos.y, 0, 0, align);
            }

            renderer.restore();
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return "IC";
        }
    }, {
        key: 'copy',
        value: function copy() {
            return new IC(this.context, this.data, this.transform.pos.x, this.transform.pos.y);
        }
    }, {
        key: 'writeTo',
        value: function writeTo(node) {
            var ICNode = _get(IC.prototype.__proto__ || Object.getPrototypeOf(IC.prototype), 'writeTo', this).call(this, node);
            createTextElement(ICNode, "icuid", this.data.getUID());
            return ICNode;
        }
    }, {
        key: 'load',
        value: function load(node, ics) {
            _get(IC.prototype.__proto__ || Object.getPrototypeOf(IC.prototype), 'load', this).call(this, node);
            var icuid = getIntValue(getChildNode(node, "icuid"));
            var data = findIC(icuid, ics);
            this.data = data;
            this.setup();
            return this;
        }
    }]);

    return IC;
}(IOObject);

IC.getXMLName = function () {
    return "ic";
};
Importer.types.push(IC);

var ICData = function () {
    function ICData(inputs, outputs, components) {
        _classCallCheck(this, ICData);

        this.transform = new Transform(V(0, 0), V(0, 0), 0);
        this.inputs = inputs;
        this.outputs = outputs;
        this.components = components;
        this.wires = getAllWires(this.getObjects());

        this.uidmanager = new UIDManager(this);

        // Give everything a uid
        var objects = this.getObjects();
        for (var i = 0; i < objects.length; i++) {
            this.uidmanager.giveUIDTo(objects[i]);
        }for (var i = 0; i < this.wires.length; i++) {
            this.uidmanager.giveUIDTo(this.wires[i]);
        } // Set start size based on length of names and amount of ports
        var longestName = 0;
        for (var i = 0; i < this.inputs.length; i++) {
            longestName = Math.max(this.inputs[i].getName().length, longestName);
        }for (var i = 0; i < this.outputs.length; i++) {
            longestName = Math.max(this.outputs[i].getName().length, longestName);
        }var w = DEFAULT_SIZE + 20 * longestName;
        var h = DEFAULT_SIZE / 2 * Math.max(this.inputs.length, this.outputs.length);
        this.transform.setSize(V(w, h));

        // Create and position ioports
        this.iports = [];
        this.oports = [];
        for (var i = 0; i < this.inputs.length; i++) {
            this.iports[i] = new IPort();

            var l = -DEFAULT_SIZE / 2 * (i - this.inputs.length / 2 + 0.5);
            if (i === 0) l -= 1;
            if (i === this.inputs.length - 1) l += 1;

            this.iports[i].setOrigin(V(0, l));
            this.iports[i].setTarget(V(-IO_PORT_LENGTH - (w / 2 - DEFAULT_SIZE / 2), l));
        }
        for (var i = 0; i < this.outputs.length; i++) {
            this.oports[i] = new OPort();

            var l = -DEFAULT_SIZE / 2 * (i - this.outputs.length / 2 + 0.5);
            if (i === 0) l -= 1;
            if (i === this.outputs.length - 1) l += 1;

            this.oports[i].setOrigin(V(0, l));
            this.oports[i].setTarget(V(IO_PORT_LENGTH + (w / 2 - DEFAULT_SIZE / 2), l));
        }

        this.recalculatePorts();
    }

    _createClass(ICData, [{
        key: 'recalculatePorts',
        value: function recalculatePorts() {
            var size = this.transform.size;

            var inputs = this.iports;
            for (var i = 0; i < inputs.length; i++) {
                var inp = inputs[i];
                // Scale by large number to make sure that the target pos is not in the IC
                var targ = this.transform.getMatrix().mul(inp.target);
                var orig = this.transform.getMatrix().mul(inp.origin);
                var pos = targ.add(targ.sub(orig).normalize().scale(10000));
                var p = getNearestPointOnRect(V(-size.x / 2, -size.y / 2), V(size.x / 2, size.y / 2), pos);
                var v1 = p.sub(pos).normalize().scale(size.scale(0.5)).add(p);
                var v2 = p.sub(pos).normalize().scale(size.scale(0.5).sub(V(IO_PORT_LENGTH + size.x / 2 - 25, IO_PORT_LENGTH + size.y / 2 - 25))).add(p);
                inp.setOrigin(v1);
                inp.setTarget(v2);
            }
            var outputs = this.oports;
            for (var i = 0; i < outputs.length; i++) {
                var out = outputs[i];
                // Scale by large number to make sure that the target pos is not in the IC
                var targ = this.transform.getMatrix().mul(out.target);
                var orig = this.transform.getMatrix().mul(out.origin);
                var pos = targ.add(targ.sub(orig).normalize().scale(10000));
                var p = getNearestPointOnRect(V(-size.x / 2, -size.y / 2), V(size.x / 2, size.y / 2), pos);
                var v1 = p.sub(pos).normalize().scale(size.scale(0.5)).add(p);
                var v2 = p.sub(pos).normalize().scale(size.scale(0.5).sub(V(IO_PORT_LENGTH + size.x / 2 - 25, IO_PORT_LENGTH + size.y / 2 - 25))).add(p);
                out.setOrigin(v1);
                out.setTarget(v2);
            }
        }
    }, {
        key: 'getInputAmount',
        value: function getInputAmount() {
            return this.inputs.length;
        }
    }, {
        key: 'getOutputAmount',
        value: function getOutputAmount() {
            return this.outputs.length;
        }
    }, {
        key: 'copy',
        value: function copy() {
            return separateGroup(copyGroup(this.getObjects()).objects);
        }
    }, {
        key: 'getUID',
        value: function getUID() {
            return this.icuid;
        }
    }, {
        key: 'getObjects',
        value: function getObjects() {
            return this.inputs.concat(this.components, this.outputs);
        }
    }, {
        key: 'getWires',
        value: function getWires() {
            return this.wires;
        }
    }, {
        key: 'getWidth',
        value: function getWidth() {
            return this.transform.getSize().x;
        }
    }, {
        key: 'getHeight',
        value: function getHeight() {
            return this.transform.getSize().y;
        }
    }]);

    return ICData;
}();

ICData.create = function (objects) {
    objects = copyGroup(objects).objects;
    var separate = separateGroup(objects);
    for (var i = 0; i < separate.inputs.length; i++) {
        var input = separate.inputs[i];
        if (input instanceof Clock && input.getName() === input.getDisplayName()) input.setName(">");
    }
    return new ICData(separate.inputs, separate.outputs, separate.components);
};
ICData.add = function (data) {
    data.icuid = ICData.ICs.length;
    ICData.ICs.push(data);
};
ICData.redistributeUIDs = function () {
    var ics = [];
    for (var i = 0; i < ICData.ICs.length; i++) {
        ics[i] = ICData.ICs[i];
    }ICData.ICs = [];
    for (var i = 0; i < ics.length; i++) {
        ics[i].icuid = i;
        ICData.ICs[i] = ics[i];
    }
};
ICData.ICs = [];

var Label = function (_IOObject10) {
    _inherits(Label, _IOObject10);

    function Label(context, x, y) {
        _classCallCheck(this, Label);

        var _this50 = _possibleConstructorReturn(this, (Label.__proto__ || Object.getPrototypeOf(Label)).call(this, context, x, y, 0, 0, undefined, true, 0, 0, 60, 30));

        _this50.setName("LABEL");

        _this50.setInputAmount(0);
        _this50.setOutputAmount(0);
        return _this50;
    }

    _createClass(Label, [{
        key: 'activate',
        value: function activate(x) {}
    }, {
        key: 'draw',
        value: function draw() {
            _get(Label.prototype.__proto__ || Object.getPrototypeOf(Label.prototype), 'draw', this).call(this);

            var renderer = this.context.getRenderer();

            this.localSpace();

            var align = "center";
            var padding = 8;
            var ww = renderer.getTextWidth(this.text) / 2;
            var pos = V(0, 0);
            renderer.text(this.name, pos.x, pos.y, 0, 0, align);

            renderer.restore();
        }
    }, {
        key: 'setName',
        value: function setName(name) {
            _get(Label.prototype.__proto__ || Object.getPrototypeOf(Label.prototype), 'setName', this).call(this, name);
            var renderer = this.context.getRenderer();
            var width = renderer.getTextWidth(this.name) + 20;
            this.selectionBoxTransform.setSize(V(width, this.selectionBoxTransform.size.y));
            this.onTransformChange();
            render();
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return this.name;
        }
    }]);

    return Label;
}(IOObject);

Label.getXMLName = function () {
    return "label";
};
Importer.types.push(Label);

var Multiplexer = function (_Gate9) {
    _inherits(Multiplexer, _Gate9);

    function Multiplexer(context, x, y) {
        _classCallCheck(this, Multiplexer);

        return _possibleConstructorReturn(this, (Multiplexer.__proto__ || Object.getPrototypeOf(Multiplexer)).call(this, context, false, x, y, undefined));
    }

    _createClass(Multiplexer, [{
        key: 'setInputAmount',
        value: function setInputAmount(target) {
            _get(Multiplexer.prototype.__proto__ || Object.getPrototypeOf(Multiplexer.prototype), 'setInputAmount', this).call(this, target + (2 << target - 1));

            var width = Math.max(DEFAULT_SIZE / 2 * (target - 1), DEFAULT_SIZE);
            var height = DEFAULT_SIZE / 2 * (2 << target - 1);
            this.transform.setSize(V(width + 10, height));

            this.selectLines = [];
            for (var i = 0; i < target; i++) {
                var input = this.inputs[i];
                this.selectLines.push(input);

                var l = -DEFAULT_SIZE / 2 * (i - target / 2 + 0.5);
                if (i === 0) l -= 1;
                if (i === target - 1) l += 1;

                input.setOrigin(V(l, 0));
                input.setTarget(V(l, IO_PORT_LENGTH + height / 2 - DEFAULT_SIZE / 2));
            }
            for (var ii = target; ii < this.inputs.length; ii++) {
                var input = this.inputs[ii];

                var i = ii - target;

                var l = -DEFAULT_SIZE / 2 * (i - (this.inputs.length - target) / 2 + 0.5);
                if (i === 0) l -= 1;
                if (i === this.inputs.length - target - 1) l += 1;

                input.setOrigin(V(0, l));
                input.setTarget(V(-IO_PORT_LENGTH - (width / 2 - DEFAULT_SIZE / 2), l));
            }
            var output = this.outputs[0];
            output.target = V(IO_PORT_LENGTH + (width / 2 - DEFAULT_SIZE / 2), output.target.y);
        }
    }, {
        key: 'getInputAmount',
        value: function getInputAmount() {
            return this.selectLines.length;
        }
    }, {
        key: 'activate',
        value: function activate(x) {
            var num = 0;
            for (var i = 0; i < this.selectLines.length; i++) {
                num = num | (this.selectLines[i].isOn ? 1 : 0) << i;
            }_get(Multiplexer.prototype.__proto__ || Object.getPrototypeOf(Multiplexer.prototype), 'activate', this).call(this, this.inputs[num + this.selectLines.length].isOn);
        }
    }, {
        key: 'draw',
        value: function draw() {
            _get(Multiplexer.prototype.__proto__ || Object.getPrototypeOf(Multiplexer.prototype), 'draw', this).call(this);

            var renderer = this.context.getRenderer();
            this.localSpace();

            var p1 = V(-this.transform.size.x / 2, this.transform.size.y / 2);
            var p2 = V(-this.transform.size.x / 2, -this.transform.size.y / 2);
            var p3 = V(this.transform.size.x / 2, -this.transform.size.y / 2 + 20);
            var p4 = V(this.transform.size.x / 2, this.transform.size.y / 2 - 20);

            renderer.shape([p1, p2, p3, p4], this.getCol(), this.getBorderColor(), 2);

            renderer.restore();
        }
    }, {
        key: 'getMinInputFieldCount',
        value: function getMinInputFieldCount() {
            return 1;
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return "Multiplexer";
        }
    }, {
        key: 'getXMLName',
        value: function getXMLName() {
            return "mux";
        }
    }]);

    return Multiplexer;
}(Gate);

Multiplexer.getXMLName = function () {
    return "mux";
};
Importer.types.push(Multiplexer);

var SevenSegmentDisplay = function (_IOObject11) {
    _inherits(SevenSegmentDisplay, _IOObject11);

    function SevenSegmentDisplay(context, x, y) {
        _classCallCheck(this, SevenSegmentDisplay);

        var _this52 = _possibleConstructorReturn(this, (SevenSegmentDisplay.__proto__ || Object.getPrototypeOf(SevenSegmentDisplay)).call(this, context, x, y, 100 * 7 / 10, 100, undefined, false, 7, 0));

        _this52.setInputAmount(7);
        _this52.noChange = true;
        _this52.segmentWidth = 45;
        _this52.segmentHeight = 10;

        for (var ii = 0; ii < 7; ii++) {
            var iport = _this52.inputs[ii];
            var i = iport.getIndex();

            var l = -15 * (i - iport.getArray().length / 2.0 + 0.5);

            iport.setOrigin(V(iport.origin.x, l));
            iport.setTarget(V(iport.target.x, l));
        }
        var w = _this52.transform.size.x;
        var h = _this52.transform.size.y;

        var padding = 15;

        var sw = _this52.segmentWidth;
        var sh = _this52.segmentHeight;

        _this52.segmentPositions = [V(0, -sw + sh), V(sw / 2 - sh / 2, (-sw + sh) / 2), V(sw / 2 - sh / 2, (+sw - sh) / 2), V(0, sw - sh), V(-sw / 2 + sh / 2, (+sw - sh) / 2), V(-sw / 2 + sh / 2, (-sw + sh) / 2), V(0, 0)];
        _this52.segmentSizes = [V(sw, sh), V(sh, sw), V(sh, sw), V(sw, sh), V(sh, sw), V(sh, sw), V(sw, sh)];
        _this52.segmentImages = [images["segment1.svg"], images["segment2.svg"], images["segment2.svg"], images["segment1.svg"], images["segment2.svg"], images["segment2.svg"], images["segment1.svg"]];
        _this52.segmentOnImages = [images["segment3.svg"], images["segment4.svg"], images["segment4.svg"], images["segment3.svg"], images["segment4.svg"], images["segment4.svg"], images["segment3.svg"]];
        return _this52;
    }

    _createClass(SevenSegmentDisplay, [{
        key: 'draw',
        value: function draw() {
            _get(SevenSegmentDisplay.prototype.__proto__ || Object.getPrototypeOf(SevenSegmentDisplay.prototype), 'draw', this).call(this);

            this.localSpace();
            var renderer = this.context.getRenderer();
            renderer.rect(0, 0, this.transform.size.x, this.transform.size.y, this.getCol(), this.getBorderColor());

            for (var i = 0; i < 7; i++) {
                var pos = this.segmentPositions[i];
                var size = this.segmentSizes[i];
                var on = this.inputs[i].isOn;
                var img = on ? this.segmentOnImages[i] : this.segmentImages[i];

                renderer.image(img, pos.x, pos.y, size.x, size.y, undefined);
            }

            renderer.restore();
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return "7 Segment Display";
        }
    }, {
        key: 'getXMLName',
        value: function getXMLName() {
            return "sevensegmentdisplay";
        }
    }]);

    return SevenSegmentDisplay;
}(IOObject);

SevenSegmentDisplay.getXMLName = function () {
    return "sevensegmentdisplay";
};
Importer.types.push(SevenSegmentDisplay);

var LED = function (_IOObject12) {
    _inherits(LED, _IOObject12);

    function LED(context, x, y, color) {
        _classCallCheck(this, LED);

        var _this53 = _possibleConstructorReturn(this, (LED.__proto__ || Object.getPrototypeOf(LED)).call(this, context, x, y, DEFAULT_SIZE, DEFAULT_SIZE, images["led.svg"], false, 1, 0));

        _this53.transform.setPos(V(_this53.transform.pos.x, _this53.transform.pos.y - 2 * _this53.transform.size.y));
        _this53.color = color == undefined ? "#ffffff" : color;
        _this53.connectorWidth = 5;

        _this53.setInputAmount(1);
        _this53.inputs[0].setOrigin(V(0, 0));
        _this53.inputs[0].setTarget(V(0, 2 * _this53.transform.size.y));
        _this53.inputs[0].lineColor = '#ffffff';
        _this53.inputs[0].dir = V(0, 1);
        return _this53;
    }

    _createClass(LED, [{
        key: 'updateCullTransform',
        value: function updateCullTransform() {
            _get(LED.prototype.__proto__ || Object.getPrototypeOf(LED.prototype), 'updateCullTransform', this).call(this);
            if (this.isOn) {
                this.cullTransform.setSize(V(3 * this.transform.size.x, 4 * this.transform.size.y));
                this.cullTransform.setPos(this.transform.pos.add(V(0, (this.inputs[0].target.y - this.transform.size.y * 3 / 2) / 2)));
            }
        }
    }, {
        key: 'activate',
        value: function activate(on, i) {
            _get(LED.prototype.__proto__ || Object.getPrototypeOf(LED.prototype), 'activate', this).call(this, on, i);
            this.updateCullTransform();
        }
    }, {
        key: 'getImageTint',
        value: function getImageTint() {
            return this.color;
        }
    }, {
        key: 'draw',
        value: function draw() {
            _get(LED.prototype.__proto__ || Object.getPrototypeOf(LED.prototype), 'draw', this).call(this);

            var renderer = this.context.getRenderer();

            this.localSpace();
            if (this.isOn) renderer.image(images["ledLight.svg"], 0, 0, 3 * this.transform.size.x, 3 * this.transform.size.y, this.color);
            renderer.restore();
        }
    }, {
        key: 'getDisplayName',
        value: function getDisplayName() {
            return "LED";
        }
    }, {
        key: 'copy',
        value: function copy() {
            var copy = _get(LED.prototype.__proto__ || Object.getPrototypeOf(LED.prototype), 'copy', this).call(this);
            copy.color = this.color;
            copy.connectorWidth = this.connectorWidth;
            return copy;
        }
    }, {
        key: 'writeTo',
        value: function writeTo(node) {
            var LEDNode = _get(LED.prototype.__proto__ || Object.getPrototypeOf(LED.prototype), 'writeTo', this).call(this, node);
            createTextElement(LEDNode, "color", this.color);
            return LEDNode;
        }
    }, {
        key: 'load',
        value: function load(node) {
            _get(LED.prototype.__proto__ || Object.getPrototypeOf(LED.prototype), 'load', this).call(this, node);
            var color = getStringValue(getChildNode(node, "color"));
            this.color = color;
            return this;
        }
    }]);

    return LED;
}(IOObject);

LED.getXMLName = function () {
    return "led";
};
Importer.types.push(LED);

var CircuitDesigner = function () {
    function CircuitDesigner(canvas, vw, vh) {
        var _this54 = this;

        _classCallCheck(this, CircuitDesigner);

        this.renderer = new Renderer(this, canvas, vw, vh);
        this.camera = new Camera(this);
        this.history = new HistoryManager();

        this.wires = [];
        this.objects = [];

        this.propogationQueue = [];

        window.addEventListener('resize', function (e) {
            return _this54.resize();
        }, false);

        this.resize();
    }

    _createClass(CircuitDesigner, [{
        key: 'reset',
        value: function reset() {
            for (var i = 0; i < this.objects.length; i++) {
                this.objects[i].remove();
            }for (var i = 0; i < this.wires.length; i++) {
                this.wires[i].remove();
            }this.objects = [];
            this.wires = [];
            this.propogationQueue = [];
        }
    }, {
        key: 'propogate',
        value: function propogate(sender, receiver, signal) {
            var _this55 = this;

            this.propogationQueue.push(new Propogation(sender, receiver, signal, function () {
                return _this55.update(sender, receiver);
            })); //() => this.update()));
        }
    }, {
        key: 'update',
        value: function update(sender, receiver) {
            var _this56 = this;

            var tempQueue = [];
            while (this.propogationQueue.length > 0) {
                tempQueue.push(this.propogationQueue.pop());
            }while (tempQueue.length > 0) {
                tempQueue.pop().send();
            }if (this.propogationQueue.length > 0) updateRequests++;

            updateRequests--;

            console.log("update");

            // See if the sender/receiver is a wire in the scene (not in an IC) to render
            var inScene = false;
            if (sender instanceof Wire || receiver instanceof Wire) {
                for (var i = 0; i < this.wires.length; i++) {
                    if (this.wires[i] === sender || this.wires[i] === receiver) {
                        inScene = true;
                        break;
                    }
                }
            } else {
                render();
            }

            if (inScene) render();

            if (updateRequests > 0) {
                setTimeout(function () {
                    return _this56.update(sender, receiver);
                }, PROPOGATION_TIME);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            // console.log("RENDER");

            this.renderer.clear();

            var step = GRID_SIZE / this.camera.zoom;

            var cpos = V(this.camera.pos.x / this.camera.zoom - this.renderer.canvas.width / 2, this.camera.pos.y / this.camera.zoom - this.renderer.canvas.height / 2);

            var cpx = cpos.x - Math.floor(cpos.x / step) * step;
            if (cpx < 0) cpx += step;
            var cpy = cpos.y - Math.floor(cpos.y / step) * step;
            if (cpy < 0) cpy += step;

            // Batch-render the lines = uglier code + way better performance
            this.renderer.save();
            this.renderer.setStyles(undefined, '#999', 1 / this.camera.zoom);
            this.renderer.context.beginPath();
            for (var x = -cpx; x <= this.renderer.canvas.width - cpx + step; x += step) {
                this.renderer._line(x, 0, x, this.renderer.canvas.height);
            }
            for (var y = -cpy; y <= this.renderer.canvas.height - cpy + step; y += step) {
                this.renderer._line(0, y, this.renderer.canvas.width, y);
            }
            this.renderer.context.closePath();
            this.renderer.context.stroke();
            this.renderer.restore();

            // Cull objects/wires if they aren't on the screen
            for (var i = 0; i < this.wires.length; i++) {
                if (this.camera.cull(this.wires[i].getCullBox())) this.wires[i].draw();
            }
            for (var i = 0; i < this.objects.length; i++) {
                if (this.camera.cull(this.objects[i].getCullBox())) this.objects[i].draw();
            }

            CurrentTool.draw(this.renderer);
        }
    }, {
        key: 'resize',
        value: function resize() {
            this.renderer.resize();
            this.camera.resize();

            render();
        }
    }, {
        key: 'addObject',
        value: function addObject(o) {
            if (this.getIndexOfObject(o) === -1) this.objects.push(o);else console.error("Attempted to add an object that already existed!");
        }
    }, {
        key: 'addWire',
        value: function addWire(w) {
            if (this.getIndexOfWire(w) === -1) this.wires.push(w);else console.error("Attempted to add a wire that already existed!");
        }
    }, {
        key: 'getRenderer',
        value: function getRenderer() {
            return this.renderer;
        }
    }, {
        key: 'getObjects',
        value: function getObjects() {
            return this.objects;
        }
    }, {
        key: 'getWires',
        value: function getWires() {
            return this.wires;
        }
    }, {
        key: 'getIndexOfObject',
        value: function getIndexOfObject(obj) {
            for (var i = 0; i < this.objects.length; i++) {
                if (obj === this.objects[i]) return i;
            }
            return -1;
        }
    }, {
        key: 'getIndexOfWire',
        value: function getIndexOfWire(wire) {
            for (var i = 0; i < this.wires.length; i++) {
                if (wire === this.wires[i]) return i;
            }
            return -1;
        }
    }]);

    return CircuitDesigner;
}();

var ICDesigner = function () {
    function ICDesigner() {
        _classCallCheck(this, ICDesigner);

        this.canvas = document.getElementById("designer-canvas");

        this.designer = new CircuitDesigner(this.canvas, 0.84, 0.76);
        this.context = new Context(this.designer);

        this.ic = undefined;
        this.data = undefined;

        this.drag = false;
        this.dragObj = undefined;

        this.dragEdge = undefined;

        this.disabled = true;

        this.confirmButton = document.getElementById("ic-confirmbutton");
        this.cancelButton = document.getElementById("ic-cancelbutton");

        this.hide();
    }

    _createClass(ICDesigner, [{
        key: 'confirm',
        value: function confirm() {
            if (this.ic != undefined) {
                ICData.add(this.data);
                var out = this.ic.copy();
                out.setContext(context);
                context.getDesigner().addObject(out);
                this.hide();
            }
        }
    }, {
        key: 'cancel',
        value: function cancel() {
            if (this.ic != undefined) {
                this.hide();
            }
        }
    }, {
        key: 'show',
        value: function show(selections) {
            currentContext = this.context;
            this.disabled = false;
            TransformController.disabled = true;
            WireController.disabled = true;
            SelectionBox.disabled = true;

            this.hidden = false;
            this.canvas.style.visibility = "visible";
            this.confirmButton.style.visibility = "visible";
            this.cancelButton.style.visibility = "visible";
            if (ItemNavController.isOpen) ItemNavController.toggle();
            popup.hide();

            this.data = ICData.create(selections);
            this.ic = new IC(this.context, this.data, 0, 0);

            this.designer.addObject(this.ic);
            selectionTool.deselectAll();
            this.context.getCamera().zoom = 0.5 + 0.1 * (this.ic.transform.size.x - 50) / 20;
            render();
        }
    }, {
        key: 'hide',
        value: function hide() {
            currentContext = context;
            this.disabled = true;
            TransformController.disabled = false;
            WireController.disabled = false;
            SelectionBox.disabled = false;

            this.hidden = true;
            this.canvas.style.visibility = "hidden";
            this.confirmButton.style.visibility = "hidden";
            this.cancelButton.style.visibility = "hidden";
            if (this.ic != undefined) {
                this.ic.remove();
                this.ic = undefined;
                this.data = undefined;
            }
            render();
        }
    }, {
        key: 'onMouseDown',
        value: function onMouseDown() {
            if (this.ic == undefined) return false;

            var worldMousePos = Input.getWorldMousePos();

            var inputs = this.ic.inputs;
            for (var i = 0; i < inputs.length; i++) {
                var inp = inputs[i];
                if (inp.sContains(worldMousePos)) {
                    this.drag = true;
                    this.dragObj = this.data.iports[i];
                    return true;
                }
            }
            var outputs = this.ic.outputs;
            for (var i = 0; i < outputs.length; i++) {
                var out = outputs[i];
                if (out.sContains(worldMousePos)) {
                    this.drag = true;
                    this.dragObj = this.data.oports[i];
                    return true;
                }
            }

            var pos = this.ic.getPos();
            var size = this.ic.getSize();
            var transform1 = new Transform(pos, size.scale(1.2), 0, this.context.getCamera());
            var transform2 = new Transform(pos, size.scale(0.8), 0, this.context.getCamera());
            if (rectContains(transform1, worldMousePos) && !rectContains(transform2, worldMousePos)) {
                if (worldMousePos.y < pos.y + size.y / 2 - 4 && worldMousePos.y > pos.y - size.y / 2 + 4) {
                    this.dragEdge = "horizontal";
                } else {
                    this.dragEdge = "vertical";
                }
                return true;
            }
        }
    }, {
        key: 'onMouseUp',
        value: function onMouseUp() {
            if (this.ic == undefined) return false;

            this.drag = false;
            this.dragObj = undefined;
            this.dragEdge = undefined;
        }
    }, {
        key: 'onMouseMove',
        value: function onMouseMove() {
            if (this.ic == undefined) return false;

            var worldMousePos = Input.getWorldMousePos();

            if (this.drag) {
                var size = this.ic.getSize();
                var p = getNearestPointOnRect(V(-size.x / 2, -size.y / 2), V(size.x / 2, size.y / 2), worldMousePos);
                var v1 = p.sub(worldMousePos).normalize().scale(size.scale(0.5)).add(p);
                var v2 = p.sub(worldMousePos).normalize().scale(size.scale(0.5).sub(V(IO_PORT_LENGTH + size.x / 2 - 25, IO_PORT_LENGTH + size.y / 2 - 25))).add(p);
                this.dragObj.setOrigin(v1);
                this.dragObj.setTarget(v2);

                this.ic.update();

                return true;
            }
            if (this.dragEdge != undefined) {
                if (this.dragEdge === "horizontal") {
                    this.data.transform.setWidth(Math.abs(2 * worldMousePos.x));
                } else {
                    this.data.transform.setHeight(Math.abs(2 * worldMousePos.y));
                }
                this.data.recalculatePorts();

                this.ic.update();

                return true;
            }
        }
    }, {
        key: 'onClick',
        value: function onClick() {}
    }]);

    return ICDesigner;
}();

var images = [];

var popup;
var contextmenu;
var icdesigner;

var context;

var currentContext;

var browser = getBrowser();

var saved = true;

// Prompt for exit
window.onbeforeunload = function (e) {
    if (!saved) {
        var dialogText = "You have unsaved changes.";
        e.returnValue = dialogText;
        return dialogText;
    }
};

function start() {
    var designer = new CircuitDesigner(document.getElementById("canvas"));
    context = new Context(designer);
    currentContext = context;

    popup = new SelectionPopup();
    icdesigner = new ICDesigner();
    contextmenu = new ContextMenu();

    Input.registerContext(context);
    Input.registerContext(icdesigner.context);
    Input.addMouseListener(icdesigner);
    Input.addMouseListener(TransformController);
    Input.addMouseListener(WireController);
    Input.addMouseListener(SelectionBox);

    selectionTool.activate();

    loadImage(images, ["constLow.svg", "constHigh.svg", "buttonUp.svg", "buttonDown.svg", "switchUp.svg", "switchDown.svg", "led.svg", "ledLight.svg", "buffer.svg", "and.svg", "or.svg", "xor.svg", "segment1.svg", "segment2.svg", "segment3.svg", "segment4.svg", "clock.svg", "clockOn.svg", "keyboard.svg", "base.svg"], 0, onFinishLoading);
}

function wire(source, target) {
    var wire = new Wire(getCurrentContext(), source);
    source.connect(wire);
    wire.connect(target);
}

function reset() {
    ICData.ICs = [];
    currentContext = context;
    context.reset();
}

function onFinishLoading() {
    render();
}

var renderQueue = 0;

function render() {
    if (__TESTING__) // Never render while unit testing
        return;

    if (renderQueue === 0) requestAnimationFrame(actualRender);
    renderQueue++;
}

function actualRender() {
    // console.log("Saved : " + (renderQueue - 1) + " render calls!");
    renderQueue = 0;
    getCurrentContext().render();
}

function loadImage(imgs, imageNames, index, onFinish) {
    var img = new Image();
    img.onload = function () {
        imgs[imageNames[index]] = img;
        img.dx = 0;
        img.dy = 0;
        img.ratio = img.width / img.height;
        if (index === imageNames.length - 1) onFinish(imgs);else loadImage(imgs, imageNames, index + 1, onFinish);
    };
    img.src = "img/items/" + imageNames[index];
}

var Renderer = function () {
    function Renderer(parent, canvas, vw, vh) {
        _classCallCheck(this, Renderer);

        this.parent = parent;
        this.canvas = canvas;
        this.tintCanvas = document.createElement("canvas");
        this.vw = vw == undefined ? 1 : vw;
        this.vh = vh == undefined ? 1 : vh;

        this.context = this.canvas.getContext("2d");

        this.tintCanvas.width = 100;
        this.tintCanvas.height = 100;
        this.tintContext = this.tintCanvas.getContext("2d");
    }

    _createClass(Renderer, [{
        key: 'getCamera',
        value: function getCamera() {
            return this.parent.camera;
        }
    }, {
        key: 'setCursor',
        value: function setCursor(cursor) {
            this.canvas.style.cursor = cursor;
        }
    }, {
        key: 'resize',
        value: function resize() {
            this.canvas.width = window.innerWidth * this.vw;
            this.canvas.height = window.innerHeight * this.vh;
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }, {
        key: 'save',
        value: function save() {
            this.context.save();
        }
    }, {
        key: 'restore',
        value: function restore() {
            this.context.restore();
        }
    }, {
        key: 'translate',
        value: function translate(v) {
            this.context.translate(v.x, v.y);
        }
    }, {
        key: 'scale',
        value: function scale(s) {
            this.context.scale(s.x, s.y);
        }
    }, {
        key: 'rotate',
        value: function rotate(a) {
            this.context.rotate(a);
        }
    }, {
        key: 'rect',
        value: function rect(x, y, w, h, fillStyle, borderStyle, borderSize, alpha) {
            this.save();
            this.setStyles(fillStyle, borderStyle, borderSize, alpha);
            this.context.beginPath();
            this.context.rect(x - w / 2, y - h / 2, w, h);
            this.context.fill();
            if (borderSize > 0 || borderSize == undefined) this.context.stroke();
            this.context.closePath();
            this.restore();
        }
    }, {
        key: 'circle',
        value: function circle(x, y, r, fillStyle, borderStyle, borderSize, alpha) {
            this.save();
            this.setStyles(fillStyle, borderStyle, borderSize, alpha);
            this.context.beginPath();
            this.context.arc(x, y, r, 0, 2 * Math.PI);
            if (fillStyle != undefined) this.context.fill();
            if (borderSize > 0 || borderSize == undefined) this.context.stroke();
            this.context.closePath();
            this.restore();
        }
    }, {
        key: 'image',
        value: function image(img, x, y, w, h, tint) {
            this.context.drawImage(img, x - w / 2, y - h / 2, w, h);
            if (tint != undefined) this.tintImage(img, x, y, w, h, tint);
        }
    }, {
        key: 'tintImage',
        value: function tintImage(img, x, y, w, h, tint) {
            this.tintContext.clearRect(0, 0, this.tintCanvas.width, this.tintCanvas.height);
            this.tintContext.fillStyle = tint;
            this.tintContext.fillRect(0, 0, this.tintCanvas.width, this.tintCanvas.height);
            if (browser.name !== "Firefox") this.tintContext.globalCompositeOperation = "destination-atop";else this.tintContext.globalCompositeOperation = "source-atop";
            this.tintContext.drawImage(img, 0, 0, this.tintCanvas.width, this.tintCanvas.height);

            this.context.globalAlpha = 0.5;
            this.context.drawImage(this.tintCanvas, x - w / 2, y - h / 2, w, h);
            this.context.globalAlpha = 1.0;
        }
    }, {
        key: 'text',
        value: function text(txt, x, y, w, h, textAlign) {
            this.save();
            this.context.font = "lighter 15px arial";
            this.context.fillStyle = '#000';
            this.context.textAlign = textAlign;
            this.context.textBaseline = "middle";
            this.context.fillText(txt, x, y);
            this.restore();
        }
    }, {
        key: 'getTextWidth',
        value: function getTextWidth(txt) {
            var width = 0;
            this.save();
            this.context.font = "lighter 15px arial";
            this.context.fillStyle = '#000';
            this.context.textBaseline = "middle";
            width = this.context.measureText(txt).width;
            this.restore();
            return width;
        }
    }, {
        key: 'line',
        value: function line(x1, y1, x2, y2, style, size) {
            this.save();
            this.setStyles(undefined, style, size);
            this.context.beginPath();
            this.context.moveTo(x1, y1);
            this.context.lineTo(x2, y2);
            this.context.stroke();
            this.context.closePath();
            this.restore();
        }
    }, {
        key: '_line',
        value: function _line(x1, y1, x2, y2) {
            this.context.moveTo(x1, y1);
            this.context.lineTo(x2, y2);
        }
    }, {
        key: 'curve',
        value: function curve(x1, y1, x2, y2, cx1, cy1, cx2, cy2, style, size) {
            this.save();
            this.setStyles(undefined, style, size);
            this.context.beginPath();
            this.context.moveTo(x1, y1);
            this.context.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
            this.context.stroke();
            this.context.closePath();
            this.restore();
        }
    }, {
        key: 'quadCurve',
        value: function quadCurve(x1, y1, x2, y2, cx, cy, style, size) {
            this.save();
            this.setStyles(undefined, style, size);
            this.context.beginPath();
            this.context.moveTo(x1, y1);
            this.context.quadraticCurveTo(cx, cy, x2, y2);
            this.context.stroke();
            this.context.closePath();
            this.restore();
        }
    }, {
        key: 'shape',
        value: function shape(points, fillStyle, borderStyle, borderSize) {
            this.save();
            this.setStyles(fillStyle, borderStyle, borderSize);
            this.context.beginPath();
            this.context.moveTo(points[0].x, points[0].y);
            for (var i = 1; i < points.length; i++) {
                this.context.lineTo(points[i].x, points[i].y);
            }this.context.lineTo(points[0].x, points[0].y);
            this.context.fill();
            this.context.closePath();
            if (borderSize > 0) this.context.stroke();
            this.restore();
        }
    }, {
        key: 'setStyles',
        value: function setStyles(fillStyle, borderStyle, borderSize, alpha) {
            if (alpha != undefined && alpha !== this.context.globalAlpha) this.context.globalAlpha = alpha;

            fillStyle = fillStyle == undefined ? '#ffffff' : fillStyle;
            if (fillStyle != undefined && fillStyle !== this.context.fillStyle) this.context.fillStyle = fillStyle;

            borderStyle = borderStyle == undefined ? '#000000' : borderStyle;
            if (borderStyle != undefined && borderStyle !== this.context.strokeStyle) this.context.strokeStyle = borderStyle;

            borderSize = borderSize == undefined ? 2 : borderSize;
            if (borderSize != undefined && borderSize !== this.context.lineWidth) this.context.lineWidth = borderSize;
        }
    }]);

    return Renderer;
}();